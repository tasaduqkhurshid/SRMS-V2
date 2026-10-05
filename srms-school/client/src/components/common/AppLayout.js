import template from "./AppLayout-template.js"
import Header from "./Header.js"
import Sidebar from "./Sidebar.js"
import Footer from "./Footer.js"
const { ref } = Vue

export default {
  name: "AppLayout",
  components: { Header, Sidebar, Footer },
  template,
  setup() {
    // 👤 Dummy user object
    const user = ref({
      name: "Admin User",
      email: "admin@example.com",
      image: "/admin/assets/images/avatar.png"
    })

    return { user }
  }
}
