import { ref, computed } from 'vue';
import { useRoute, useRouter, RouterView } from 'vue-router';
import Sidebar from '../../components/common/Sidebar.js';
import Header from '../../components/common/Header.js';
import template from './AdminLayout.template.js';

export default {
  name: 'AdminLayout',
  components: { Sidebar, Header, RouterView },
  props: {},
  template,
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    const token = ref(localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '');

    const logout = () => {
      token.value = '';
      localStorage.removeItem('srms_platform_token');
      sessionStorage.removeItem('srms_platform_token');
      router.push('/login');
    };

    const eyebrowText = computed(() => {
      if (route.path.startsWith('/support')) return 'SUPPORT MANAGEMENT';
      if (route.path.startsWith('/schools')) return 'SCHOOL MANAGEMENT';
      if (route.path === '/payment-gateways') return 'PAYMENT GATEWAYS';
      return 'PLATFORM OVERVIEW';
    });

    const pageTitle = computed(() => {
      if (route.path.startsWith('/support/tickets/create')) return 'Create Support Ticket';
      if (route.path.startsWith('/support/tickets/')) return 'Ticket Details';
      if (route.path === '/support/tickets' || route.path === '/support') return 'Support Tickets';
      if (route.path === '/schools') return 'Schools';
      if (route.path === '/payment-gateways') return 'Payment Gateways';
      if (route.path.startsWith('/schools/')) return 'School Details';
      return 'Good day, Administrator';
    });

    return { route, currentYear, token, logout, eyebrowText, pageTitle };
  },
};
