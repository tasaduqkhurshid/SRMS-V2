import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminNotificationBell from './NotificationBell.js';
import template from './Header.template.js';

export default {
  name: 'Header',
  props: {
    token: { type: String, required: true },
    eyebrowText: { type: String, default: 'PLATFORM OVERVIEW' },
    title: { type: String, default: 'Good day, Administrator' },
  },
  template,
  components: {
    AdminNotificationBell,
  },
  setup(props) {
    const route = useRoute();
    const eyebrow = computed(() => {
      if (route.path.startsWith('/support')) return 'SUPPORT MANAGEMENT';
      if (route.path.startsWith('/schools')) return 'SCHOOL MANAGEMENT';
      if (route.path === '/payment-gateways') return 'PAYMENT GATEWAYS';
      return 'PLATFORM OVERVIEW';
    });
    const title = computed(() => {
      if (route.path.startsWith('/support/tickets/create')) return 'Create Support Ticket';
      if (route.path.startsWith('/support/tickets/')) return 'Ticket Details';
      if (route.path === '/support/tickets' || route.path === '/support') return 'Support Tickets';
      if (route.path === '/schools') return 'Schools';
      if (route.path === '/payment-gateways') return 'Payment Gateways';
      if (route.path.startsWith('/schools/')) return 'School Details';
      return 'Good day, Administrator';
    });
    return { eyebrow, title };
  },
};
