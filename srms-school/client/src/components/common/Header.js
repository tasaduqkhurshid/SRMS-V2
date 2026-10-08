import template from "./HeaderTemplate.js"
const { onMounted, ref, computed } = Vue
const { useRouter } = VueRouter

export default {
  name: "Header",
  emits: ['toggle-sidebar'],
  props: {
    user: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  template,
  setup(props, { emit }) {
    const router = useRouter()

    const logoUrl = ref("")
    const schoolInitials = ref("SC")
    const schoolName = ref("School Portal")
    const localUser = ref({})
    const searchQuery = ref("")
    const notificationCount = ref(0)
    const userInitials = ref("HA")

    // Load user data from localStorage/sessionStorage
    onMounted(() => {
      let storedUser = {}
      try {
        storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}")
      } catch (_error) {
        storedUser = {}
      }
      const school = storedUser.school || {}
      schoolName.value = storedUser.schoolName || school.name || school.school_name || "School Portal"
      localUser.value = { ...storedUser }
      logoUrl.value = school.logo_url || school.logo_path || ""

      // Set user initials from username
      const name = storedUser.username || "HA"
      userInitials.value = String(name)
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "HA"

      // Set school initials
      const sName = schoolName.value
      schoolInitials.value = String(sName)
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "SC"
    })

    // Use prop user or fallback to localStorage user
    const currentUser = computed(() => {
      // Check if prop user has actual data, otherwise use localStorage
      if (props.user && (props.user.id || props.user.username || props.user.name)) {
        return props.user
      }
      return localUser.value || {}
    })

    const userRole = computed(() => {
      const role = currentUser.value?.role || 'Admin'
      return String(role).charAt(0).toUpperCase() + String(role).slice(1).toLowerCase()
    })

    const userImage = computed(() => {
      return currentUser.value?.image || currentUser.value?.avatar || currentUser.value?.photo || null
    })

    const userName = computed(() => {
      return currentUser.value?.username || 'Admin'
    })

    const handleSearch = () => {
      const q = (searchQuery.value || "").trim()
      router.push({ path: "/students", query: q ? { q } : {} })
    }

    const handleNotifications = () => {
      console.log('Notifications clicked')
    }

    const handleLogout = () => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.clear()

      toast?.success?.("Logged out successfully")

      router.push("/")
    }

    return {
      logoUrl,
      schoolInitials,
      schoolName,
      user: currentUser,
      userRole,
      userInitials,
      userImage,
      userName,
      searchQuery,
      notificationCount,
      handleSearch,
      handleNotifications,
      handleLogout,
    }
  },
}