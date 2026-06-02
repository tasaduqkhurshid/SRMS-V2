import AppLayout from "./components/common/AppLayout.js"
import AuthLayout from "./components/common/AuthLayout.js"
const { onMounted, computed } = Vue
const { useRoute } = VueRouter

export default {
  name: "App",
  components: { AppLayout, AuthLayout },
  setup() {
    const route = useRoute()

    // Decide layout type dynamically based on route path
    const layout = computed(() => {
      // Any auth-related route uses AuthLayout (login, register)
      if (route.path.includes("/login") || route.path.includes("/register")) {
        return "auth"
      }
      // Default to AppLayout for all other pages
      return "app"
    })

    onMounted(() => {
    })

    return { layout }
  },

  template: `
    <div>
      <!-- Auth pages (Login/Register) -->
      <AuthLayout v-if="layout === 'auth'">
        <router-view :key="$route.fullPath"></router-view>
      </AuthLayout>

      <!-- Main app pages (Dashboard, Students, etc.) -->
      <AppLayout v-else>
        <router-view :key="$route.fullPath"></router-view>
      </AppLayout>
    </div>
  `
}
