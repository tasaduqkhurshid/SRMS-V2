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

    const logoUrl = ref("");
    const schoolInitials = ref("SC");
    const user = ref({});

    // Load user data from localStorage/sessionStorage
    onMounted(() => {
      let storedUser = {};
      try {
        storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
      } catch (_error) {
        storedUser = {};
      }
      const school = storedUser.school || {};
      const schoolName = storedUser.schoolName || school.name || school.school_name || "School Portal";
      user.value = { ...storedUser, schoolName };
      logoUrl.value = school.logo_url || school.logo_path || "";
      schoolInitials.value = String(school.abbreviation || schoolName)
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "SC";
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
      schoolInitials,
      user,
      handleLogout,
    };
  },
}
