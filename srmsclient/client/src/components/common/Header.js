import template from "./HeaderTemplate.js"
const { onMounted, computed, ref } = Vue
const { useRouter } = VueRouter

export default {
  name: "Header",
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  template,
  setup() {
    const router = useRouter();

    const logoUrl = ref("/assets/images/app-logo.png");
    const user = ref({});

    // Load user data from localStorage/sessionStorage
    onMounted(() => {
      const storedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user")) ||
        {};
      user.value = storedUser;
    });

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();

      // Optional toast
      toast?.success?.("Logged out successfully");

      // Redirect to login page
      router.push("/");
    };

    return {
      logoUrl,
      user,
      handleLogout,
    };
  },
}
