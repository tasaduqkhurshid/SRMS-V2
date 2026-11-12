import template from './TicketList.template.js';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SupportDashboard from './SupportDashboard.js';
import SupportTicketList from '../../components/pages/support/SupportTicketList.js';
import CreateSupportTicketAdmin from '../../components/pages/support/CreateSupportTicketAdmin.js';
import SupportSubjectManagement from '../../components/pages/support/SupportSubjectManagement.js';
import SupportServiceManagement from '../../components/pages/support/SupportServiceManagement.js';
import SupportStatusManagement from '../../components/pages/support/SupportStatusManagement.js';

export default {
  name: 'TicketList',
  components: { SupportDashboard, SupportTicketList, CreateSupportTicketAdmin, SupportSubjectManagement, SupportServiceManagement, SupportStatusManagement },
  template,
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    const token = ref(localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '');
    const supportTickets = ref([]);
    const supportSubjects = ref([]);
    const supportServices = ref([]);
    const supportStatuses = ref([]);
    const supportStatistics = ref({ total: 0, by_status: {}, created_today: 0 });
    const supportLoading = ref(false);
    const supportError = ref('');
    const supportSuccess = ref('');

    const api = async (path, options = {}) => {
      const response = await fetch(`/api/admin${path}`, {
        ...options,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
          ...(options.headers || {}),
        },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`);
      return result.data;
    };

    const loadSupportDashboard = async () => {
      supportLoading.value = true; supportError.value = '';
      try { supportStatistics.value = await api('/support-tickets/statistics'); }
      catch (cause) { supportError.value = cause.message || 'Could not load support statistics.'; }
      finally { supportLoading.value = false; }
    };

    const loadSupportTickets = async () => {
      supportLoading.value = true; supportError.value = '';
      try { const data = await api('/support-tickets'); supportTickets.value = data.tickets || []; }
      catch (cause) { supportError.value = cause.message || 'Could not load tickets.'; }
      finally { supportLoading.value = false; }
    };

    const loadSupportConfig = async () => {
      supportLoading.value = true; supportError.value = '';
      try {
        const [subjects, services, statuses] = await Promise.all([api('/support-ticket-subjects'), api('/support-ticket-services'), api('/support-ticket-statuses')]);
        supportSubjects.value = subjects || []; supportServices.value = services || []; supportStatuses.value = statuses || [];
      } catch (cause) { supportError.value = cause.message || 'Could not load support config.'; }
      finally { supportLoading.value = false; }
    };

    const handleSupportRefresh = async () => { await Promise.all([loadSupportDashboard(), loadSupportTickets(), loadSupportConfig()]); };
    const handleSupportTicketCreated = (ticket) => { supportTickets.value.unshift(ticket); supportStatistics.value.total = (supportStatistics.value.total || 0) + 1; supportStatistics.value.by_status.pending = (supportStatistics.value.by_status.pending || 0) + 1; supportStatistics.value.created_today = (supportStatistics.value.created_today || 0) + 1; };
    const handleSupportConfigRefresh = () => { loadSupportConfig(); };
    const loadForRoute = () => { if (route.path.startsWith('/support/')) return handleSupportRefresh(); };

    watch(() => route.path, () => { if (token.value) loadForRoute(); });
    onMounted(() => { if (token.value) loadForRoute(); });

    return {
      route, router, currentYear, token, supportTickets, supportSubjects, supportServices, supportStatuses,
      supportStatistics, supportLoading, supportError, supportSuccess,
      api, loadSupportDashboard, loadSupportTickets, loadSupportConfig,
      handleSupportRefresh, handleSupportTicketCreated,
      handleSupportConfigRefresh, loadForRoute,
    };
  },
};
