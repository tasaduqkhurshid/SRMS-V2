import template from "./AppLayout-template.js"
import Header from "./Header.js"
import Sidebar from "./Sidebar.js"
const { ref } = Vue

export default {
  name: "AppLayout",
  components: { Header, Sidebar },
  template,
  setup() {
    const sidebarRef = ref(null)

    const handleToggleSidebar = () => {
      if (sidebarRef.value?.toggle) {
        sidebarRef.value.toggle()
      }
    }

    return { sidebarRef, handleToggleSidebar }
  }
}