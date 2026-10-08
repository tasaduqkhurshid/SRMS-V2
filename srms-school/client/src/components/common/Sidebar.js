import template from './Sidebar-template.js'
const { ref, onMounted, onUnmounted, computed, watch } = Vue
const { useRoute, useRouter } = VueRouter

export default {
  name: 'Sidebar',
  template,
  setup() {
    const route = useRoute()
    const router = useRouter()

    // collapsed = narrow desktop (shows only icons)
    const collapsed = ref(false)
    // mobile = window width below breakpoint
    const mobile = ref(window.innerWidth < 992)
    // mobileOpen = overlay open state (on mobile toggle)
    const mobileOpen = ref(false)

    // School branding
    const schoolLogo = ref('')
    const schoolName = ref('School Portal')
    const schoolInitials = ref('SP')

    const handleResize = () => {
      mobile.value = window.innerWidth < 992
      if (!mobile.value) {
        mobileOpen.value = false
      }
    }

    // Load school branding from localStorage
    const loadSchoolBranding = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}")
        const school = storedUser.school || {}
        const name = storedUser.schoolName || school.name || school.school_name || "School Portal"
        schoolName.value = name
        schoolLogo.value = school.logo_url || school.logo_path || ''
        schoolInitials.value = String(school.abbreviation || name)
          .split(/\s+/)
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "SP"
      } catch (e) {
        schoolLogo.value = ''
      }
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
      if (mobile.value) collapsed.value = false
      updateResultsOpenState()
      updateTemplatesOpenState()
      updateResultBookOpenState()
      loadSchoolBranding()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // Watch route changes to auto-open sections
    watch(() => route.path, () => {
      updateResultsOpenState()
      updateTemplatesOpenState()
      updateResultBookOpenState()
    })

    const toggle = () => {
      if (mobile.value) {
        mobileOpen.value = !mobileOpen.value
      } else {
        collapsed.value = !collapsed.value
      }
    }

    // Academics collapsible state
    const academicsOpen = ref(true)
    const toggleAcademics = () => { academicsOpen.value = !academicsOpen.value }

    // Results submenu state
    const resultsOpen = ref(false)
    const toggleResults = () => {
      if (!resultsOpen.value) {
        resultsOpen.value = true
        router.push('/results/student-wise')
      } else {
        resultsOpen.value = false
      }
    }

    // Result Book submenu state
    const resultBookOpen = ref(false)
    const toggleResultBook = () => {
      if (!resultBookOpen.value) {
        resultBookOpen.value = true
        router.push('/results/result-book/class-wise')
      } else {
        resultBookOpen.value = false
      }
    }

    // Auto-open Results if current route is a Results sub-route
    const updateResultsOpenState = () => {
      if (route.path.startsWith('/results') && route.path !== '/results') {
        resultsOpen.value = true
      } else {
        resultsOpen.value = false
      }
    }

    const updateTemplatesOpenState = () => {
      // Templates is a simple link; nothing to auto-open
    }

    // Auto-open Result Book when on a result-book route
    const updateResultBookOpenState = () => {
      if (route.path.startsWith('/results/result-book')) {
        resultBookOpen.value = true
      } else {
        resultBookOpen.value = false
      }
    }

    const closeMobile = () => {
      if (mobile.value) mobileOpen.value = false
    }

    // utility to highlight active route
    const isActive = (path) => {
      try {
        if (path === '/dashboard') {
          return route.path === '/dashboard'
        }
        if (path === '/students') {
          return route.path === '/students'
        }
        if (path === '/students/import') {
          return route.path === '/students/import'
        }
        if (path === '/subjects') {
          return route.path === '/subjects'
        }
        if (path === '/courses') {
          return route.path === '/courses'
        }
        if (path === '/exams') {
          return route.path === '/exams'
        }
        if (path === '/results/student-wise') {
          return route.path === '/results/student-wise'
        }
        if (path === '/results/course-wise') {
          return route.path === '/results/course-wise'
        }
        if (path === '/results/subject-wise') {
          return route.path === '/results/subject-wise'
        }
        if (path === '/results/generate') {
          return route.path === '/results/generate'
        }
        if (path === '/results/result-book/class-wise') {
          return route.path === '/results/result-book/class-wise' || route.path === '/results/result-book/student-wise'
        }
        if (path === '/templates/marksheets') {
          return route.path === '/templates/marksheets' || route.path.startsWith('/templates/marksheets/')
        }
        if (path === '/school/profile') {
          return route.path === '/school/profile'
        }
        if (path === '/settings') {
          return route.path === '/settings'
        }
        if (path === '/backup') {
          return route.path === '/backup'
        }
        return route.path === path
      } catch (e) {
        return false
      }
    }

    return {
      collapsed,
      mobile,
      mobileOpen,
      toggle,
      closeMobile,
      isActive,
      academicsOpen,
      toggleAcademics,
      resultsOpen,
      toggleResults,
      resultBookOpen,
      toggleResultBook,
      schoolLogo,
      schoolName,
      schoolInitials,
      currentYear: new Date().getFullYear()
    }
  }
}
