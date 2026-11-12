import template from './Gateways.template.js';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'Gateways',
  components: {},
  template,
  setup() {
    const route = useRoute();
    const router = useRouter();
    const token = ref(localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '');
    const loading = ref(false);
    const error = ref('');
    const success = ref('');
    const platformGateways = ref([]);
    const gatewaySaving = ref('');

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

    const loadPlatformGateways = async () => {
      loading.value = true; error.value = '';
      try { platformGateways.value = await api('/payment-gateways'); }
      catch (cause) { error.value = cause.message || 'Could not load gateway catalog.'; }
      finally { loading.value = false; }
    };

    const togglePlatformGateway = async (gateway) => {
      gatewaySaving.value = gateway.code; error.value = ''; success.value = '';
      try {
        await api(`/payment-gateways/${gateway.code}`, { method: 'PATCH', body: JSON.stringify({ enabled: !gateway.isEnabled }) });
        success.value = `${gateway.name} ${gateway.isEnabled ? 'disabled' : 'enabled'} at platform level.`;
        await loadPlatformGateways();
      } catch (cause) { error.value = cause.message || 'Gateway availability could not be updated.'; }
      finally { gatewaySaving.value = ''; }
    };

    onMounted(loadPlatformGateways);

    return { route, router, token, loading, error, success, platformGateways, gatewaySaving, api, loadPlatformGateways, togglePlatformGateway };
  },
};
