import template from './Sidebar.template.js';
import SMSBrand from './SMSBrand.js';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

export default {
  name: 'Sidebar',
  components: { SMSBrand, RouterLink },
  props: { currentYear: { type: Number, required: true } },
  emits: ['logout'],
  template,
  setup(props) {
    const supportMenuOpen = ref(false);

    const toggleSupportMenu = () => {
      supportMenuOpen.value = !supportMenuOpen.value;
    };

    const closeSupportMenu = () => {
      supportMenuOpen.value = false;
    };

    return {
      supportMenuOpen,
      toggleSupportMenu,
      closeSupportMenu,
    };
  },
};
