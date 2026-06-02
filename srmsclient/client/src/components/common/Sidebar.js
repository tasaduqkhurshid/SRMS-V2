import template from './Sidebar-template.js'
const { ref, onMounted, onUnmounted, computed, watch } = Vue
const { useRoute } = VueRouter

export default {
  name: 'Sidebar',
  template,
  setup() {
    const route = useRoute()

    // collapsed = narrow desktop (shows only icons)
    const collapsed = ref(false)
    // mobile = window width below breakpoint
    const mobile = ref(window.innerWidth < 992) // md/lg breakpoint ~992
    // mobileOpen = overlay open state (on mobile toggle)
    const mobileOpen = ref(false)

    const handleResize = () => {
      mobile.value = window.innerWidth < 992
      if (!mobile.value) {
        mobileOpen.value = false
      }
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
      // auto-collapse on initial small screen
      if (mobile.value) collapsed.value = false
      updateResultsOpenState()
      updateTemplatesOpenState()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // Watch route changes to auto-open sections
    watch(() => route.path, () => {
      updateResultsOpenState()
      updateTemplatesOpenState()
    })

    const toggle = () => {
      if (mobile.value) {
        mobileOpen.value = !mobileOpen.value
      } else {
        collapsed.value = !collapsed.value
      }
    }

    // Academics collapsible state
    const academicsOpen = ref(true);
    const toggleAcademics = () => { academicsOpen.value = !academicsOpen.value };

    // Results submenu state
    const resultsOpen = ref(false);
    const toggleResults = () => { 
      if (!resultsOpen.value) {
        // When opening Results, navigate to first sub-item (Student-wise)
        resultsOpen.value = true;
        setTimeout(() => {
          window.location.href = '#/results/student-wise';
        }, 10);
      } else {
        resultsOpen.value = false;
      }
    };

    // Templates submenu state
    const templatesOpen = ref(false);
    const toggleTemplates = () => { 
      if (!templatesOpen.value) {
        // When opening Templates, navigate to first sub-item (Marksheets)
        templatesOpen.value = true;
        setTimeout(() => {
          window.location.href = '#/templates/marksheets';
        }, 10);
      } else {
        templatesOpen.value = false;
      }
    };

    // Result Book submenu state (top-level)
    const resultBookOpen = ref(false);
    const toggleResultBook = () => {
      if (!resultBookOpen.value) {
        resultBookOpen.value = true;
        setTimeout(() => {
          window.location.href = '#/results/result-book/class-wise';
        }, 10);
      } else {
        resultBookOpen.value = false;
      }
    };

    // Auto-open Results if current route is a Results sub-route
    const updateResultsOpenState = () => {
      if (route.path.startsWith('/results') && route.path !== '/results') {
        resultsOpen.value = true;
      } else {
        resultsOpen.value = false;
      }
    };

    // Auto-open Templates if current route is a Templates sub-route
    const updateTemplatesOpenState = () => {
      if (route.path.startsWith('/templates')) {
        templatesOpen.value = true;
      } else {
        templatesOpen.value = false;
      }
    };

    // Auto-open Result Book if current route is under result-book
    const updateResultBookOpenState = () => {
      if (route.path.startsWith('/results/result-book')) {
        resultBookOpen.value = true;
      } else {
        resultBookOpen.value = false;
      }
    };

    const closeMobile = () => {
      if (mobile.value) mobileOpen.value = false
    }

    // utility to highlight active route (basic)
    const isActive = (path) => {
      try {
        // route.path may be reactive; use startsWith for root matches
        return route.path === path
      } catch (e) {
        return false
      }
    }

    return { collapsed, mobile, mobileOpen, toggle, closeMobile, isActive, academicsOpen, toggleAcademics, resultsOpen, toggleResults, templatesOpen, toggleTemplates, resultBookOpen, toggleResultBook, updateResultBookOpenState }
  }
}
