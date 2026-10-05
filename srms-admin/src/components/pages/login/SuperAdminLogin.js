import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SMSBrand from '../../common/SMSBrand.js';
import template from './SuperAdminLoginTemplate.js';

export default {
  name: 'SuperAdminLogin',
  components: { SMSBrand },
  template,
  setup() {
    const router = useRouter();
    const username = ref('platform-admin');
    const password = ref('');
    const showPassword = ref(false);
    const rememberMe = ref(false);
    const saving = ref(false);
    const error = ref('');

    function showPasswordResetHelp() {
      error.value = 'Contact your platform owner to reset this administrator password.';
    }

    async function submit() {
      error.value = '';
      saving.value = true;
      try {
        const response = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, password: password.value }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result?.data?.token || result.data.user?.role !== 'SUPER_ADMIN') {
          throw new Error(result.message || 'Platform administrator login failed');
        }
        const storage = rememberMe.value ? localStorage : sessionStorage;
        storage.setItem('srms_platform_token', result.data.token);
        (rememberMe.value ? sessionStorage : localStorage).removeItem('srms_platform_token');
        await router.push('/dashboard');
      } catch (cause) {
        error.value = cause.message;
      } finally {
        saving.value = false;
      }
    }

    return { username, password, showPassword, rememberMe, saving, error, showPasswordResetHelp, submit };
  },
};
