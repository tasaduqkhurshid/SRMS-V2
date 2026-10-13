import { ref, reactive, computed } from 'vue';

export default {
  name: 'AddUserModal',
  props: {
    isOpen: { type: Boolean, default: false },
    school: { type: Object, default: null },
  },
  emits: ['close', 'created'],
  setup(props, { emit }) {
    const loading = ref(false);
    const error = ref('');
    const success = ref('');

    const form = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    const passwordMatch = computed(() => form.password === form.confirmPassword);

    function close() {
      resetForm();
      emit('close');
    }

    function resetForm() {
      form.username = '';
      form.email = '';
      form.password = '';
      form.confirmPassword = '';
      error.value = '';
      success.value = '';
    }

    function validateForm() {
      error.value = '';
      if (!form.username.trim()) {
        error.value = 'Username is required';
        return false;
      }
      if (!form.email.trim()) {
        error.value = 'Email is required';
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        error.value = 'Please enter a valid email address';
        return false;
      }
      if (!form.password) {
        error.value = 'Password is required';
        return false;
      }
      if (form.password.length < 8) {
        error.value = 'Password must be at least 8 characters';
        return false;
      }
      if (form.password !== form.confirmPassword) {
        error.value = 'Passwords do not match';
        return false;
      }
      return true;
    }

    async function handleSubmit() {
      if (!validateForm()) return;
      if (!props.school) return;

      loading.value = true;
      error.value = '';
      success.value = '';

      try {
        const token = localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '';
        const response = await fetch(`/api/admin/schools/${props.school._id}/admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.message || `Request failed (${response.status})`);
        }

        success.value = 'School administrator created successfully.';
        emit('created', result);

        // Close modal after a brief delay to show success message
        setTimeout(() => {
          close();
        }, 1500);
      } catch (cause) {
        error.value = cause.message;
      } finally {
        loading.value = false;
      }
    }

    const modalTitle = computed(() => {
      if (!props.school) return 'Add Administrator';
      return 'Add Administrator';
    });

    return {
      loading,
      error,
      success,
      form,
      passwordMatch,
      close,
      handleSubmit,
      modalTitle,
    };
  },
  template: `
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="add-user-modal-title">
        <header class="modal-header">
          <div>
            <p class="eyebrow">USER MANAGEMENT</p>
            <h2 id="add-user-modal-title">Add Administrator</h2>
            <p class="modal-subtitle" v-if="school">({{ school.school_name }})</p>
          </div>
          <button class="modal-close" type="button" @click="close" aria-label="Close modal" :disabled="loading">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div class="modal-body">
          <form class="school-form-modal" @submit.prevent="handleSubmit" novalidate>
            <fieldset class="form-section">
              <legend>Administrator Details</legend>
              <div class="form-fields">
                <div class="form-field full-width">
                  <span class="form-label">Username <span class="required">*</span></span>
                  <input
                    id="username"
                    type="text"
                    v-model="form.username"
                    class="form-input"
                    autocomplete="username"
                    required
                    :disabled="loading"
                    aria-describedby="username-hint"
                    placeholder="Enter username"
                  />
                  <small class="field-hint">Unique username for login</small>
                </div>
                <div class="form-field full-width">
                  <span class="form-label">Email <span class="required">*</span></span>
                  <input
                    id="email"
                    type="email"
                    v-model="form.email"
                    class="form-input"
                    autocomplete="email"
                    required
                    :disabled="loading"
                    aria-describedby="email-hint"
                    placeholder="Enter email address"
                  />
                  <small class="field-hint">Administrator email address</small>
                </div>
                <div class="form-field full-width">
                  <span class="form-label">Password <span class="required">*</span></span>
                  <input
                    id="password"
                    type="password"
                    v-model="form.password"
                    class="form-input"
                    autocomplete="new-password"
                    required
                    :disabled="loading"
                    aria-describedby="password-hint"
                    placeholder="Enter password (min 8 characters)"
                  />
                  <small class="field-hint">Minimum 8 characters</small>
                </div>
                <div class="form-field full-width">
                  <span class="form-label">Confirm Password <span class="required">*</span></span>
                  <input
                    id="confirmPassword"
                    type="password"
                    v-model="form.confirmPassword"
                    class="form-input"
                    autocomplete="new-password"
                    required
                    :disabled="loading"
                    aria-describedby="confirmPassword-hint"
                    placeholder="Confirm password"
                  />
                  <small class="field-hint">Must match password</small>
                  <div v-if="form.confirmPassword && !passwordMatch" class="field-hint error">Passwords do not match</div>
                </div>
              </div>
            </fieldset>

            <p v-if="error" class="form-error">{{ error }}</p>
            <p v-if="success" class="form-success">{{ success }}</p>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="secondary" @click="close" :disabled="loading">Cancel</button>
              <button type="submit" class="primary" :disabled="loading">
                <span v-if="loading">Creating…</span>
                <span v-else>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
};