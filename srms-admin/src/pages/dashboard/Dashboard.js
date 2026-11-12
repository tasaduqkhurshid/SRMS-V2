import template from './Dashboard.template.js';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PlatformStats from '../../components/dashboard/PlatformStats.js';
import StatsChart from '../../components/dashboard/StatsChart.js';

export default {
  name: 'Dashboard',
  components: { PlatformStats, StatsChart },
  template,
  setup() {
    const route = useRoute();
    const router = useRouter();
    const token = ref(localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '');
    const statistics = ref({ schools: 0, activeSchools: 0, inactiveSchools: 0, students: 0, schoolAdministrators: 0 });
    const loading = ref(false);
    const error = ref('');
    const success = ref('');

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

    const loadStatistics = async () => {
      loading.value = true; error.value = '';
      try { statistics.value = await api('/dashboard'); }
      catch (cause) { error.value = cause.message || 'Could not load statistics.'; }
      finally { loading.value = false; }
    };

    watch(() => route.path, () => { if (token.value) loadStatistics(); });
    onMounted(() => { if (token.value) loadStatistics(); });

    return { route, router, token, statistics, loading, error, success, api, loadStatistics };
  },
};
