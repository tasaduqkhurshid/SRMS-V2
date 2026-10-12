import { ref, computed, watch, onMounted, nextTick } from 'vue';
import template from './SchoolModalTemplate.js';

export default {
  name: 'SchoolModalComponent',
  props: {
    isOpen: { type: Boolean, default: false },
    mode: { type: String, default: 'create' },
    school: { type: Object, default: null },
    saving: { type: Boolean, default: false },
    schoolPortalUrl: { type: Function, required: true },
  },
  emits: ['close', 'submit', 'cancel'],
  setup(props, { emit }) {
    // Form state
    const form = ref({
      school_name: '',
      slug: '',
      email: '',
      address: '',
      status: 'active',
      tagline: '',
      description: '',
    });

    // Logo upload state
    const logoFile = ref(null);
    const logoPreviewUrl = ref(null);
    const logoUploadState = ref('empty');
    const logoUploadError = ref('');
    const logoUploadProgress = ref(0);
    const logoExistingKey = ref('');

    // Welcome image upload state
    const welcomeFile = ref(null);
    const welcomePreviewUrl = ref(null);
    const welcomeUploadState = ref('empty');
    const welcomeUploadError = ref('');
    const welcomeUploadProgress = ref(0);
    const welcomeExistingKey = ref('');

    // Submission state
    const submitting = ref(false);
    const errorMessage = ref('');
    const previousActiveElement = ref(null);

    // Refs for file inputs
    const logoInput = ref(null);
    const welcomeInput = ref(null);

    // Computed: label for upload state
    const logoUploadStateLabel = computed(() => {
      switch (logoUploadState.value) {
        case 'existing': return 'Current';
        case 'selected': return 'Pending';
        case 'uploading': return 'Uploading…';
        case 'uploaded': return 'Uploaded';
        case 'error': return 'Failed';
        default: return '';
      }
    });

    const welcomeUploadStateLabel = computed(() => {
      switch (welcomeUploadState.value) {
        case 'existing': return 'Current';
        case 'selected': return 'Pending';
        case 'uploading': return 'Uploading…';
        case 'uploaded': return 'Uploaded';
        case 'error': return 'Failed';
        default: return '';
      }
    });

    // Computed: whether submission is blocked by pending/failed uploads
    const hasPendingUploads = computed(() => {
      return (
        logoUploadState.value === 'selected' ||
        logoUploadState.value === 'uploading' ||
        logoUploadState.value === 'error' ||
        welcomeUploadState.value === 'selected' ||
        welcomeUploadState.value === 'uploading' ||
        welcomeUploadState.value === 'error'
      );
    });

    const submitDisabled = computed(() => {
      if (submitting.value || props.saving) return true;
      if (!form.value.school_name?.trim()) return true;
      if (props.mode === 'create' && !form.value.slug?.trim()) return true;
      if (hasPendingUploads.value) return true;
      return false;
    });

    const showUploadBlockingMessage = computed(() => hasPendingUploads.value);

    const blockingMessage = computed(() => {
      const pending = [];
      if (logoUploadState.value === 'selected') pending.push('logo (selected, not uploaded)');
      if (logoUploadState.value === 'uploading') pending.push('logo (uploading)');
      if (logoUploadState.value === 'error') pending.push('logo (upload failed)');
      if (welcomeUploadState.value === 'selected') pending.push('welcome image (selected, not uploaded)');
      if (welcomeUploadState.value === 'uploading') pending.push('welcome image (uploading)');
      if (welcomeUploadState.value === 'error') pending.push('welcome image (upload failed)');
      if (!pending.length) return '';
      return `Cannot submit: ${pending.join(', ')}. Please upload or remove pending images.`;
    });

    // API helper
    const api = async (path, options = {}) => {
      const token = localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '';
      const response = await fetch(`/api/admin${path}`, {
        ...options,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`);
      return result.data;
    };

    // Initialize form when modal opens or mode/school changes
    const initializeForm = () => {
      resetForm();
      if (props.mode === 'edit' && props.school) {
        populateFormFromSchool(props.school);
      } else if (props.mode === 'create') {
        form.value = {
          school_name: '',
          slug: '',
          email: '',
          address: '',
          status: 'active',
          tagline: 'A place to learn, grow, and succeed.',
          description: 'A welcoming place to support learning, academic progress, and student success.',
        };
      }
      // Focus management
      nextTick(() => {
        if (previousActiveElement.value) {
          previousActiveElement.value.focus();
        }
      });
    };

    const resetForm = () => {
      form.value = {
        school_name: '',
        slug: '',
        email: '',
        address: '',
        status: 'active',
        tagline: '',
        description: '',
      };
      // Reset logo state
      logoFile.value = null;
      logoPreviewUrl.value = null;
      logoUploadState.value = 'empty';
      logoUploadError.value = '';
      logoUploadProgress.value = 0;
      logoExistingKey.value = '';
      if (logoInput.value) logoInput.value.value = '';

      // Reset welcome state
      welcomeFile.value = null;
      welcomePreviewUrl.value = null;
      welcomeUploadState.value = 'empty';
      welcomeUploadError.value = '';
      welcomeUploadProgress.value = 0;
      welcomeExistingKey.value = '';
      if (welcomeInput.value) welcomeInput.value.value = '';

      errorMessage.value = '';
      submitting.value = false;
    };

    const populateFormFromSchool = (school) => {
      form.value = {
        school_name: school.school_name || '',
        slug: school.slug || '',
        email: school.email || '',
        address: school.address || '',
        status: school.status || 'active',
        tagline: school.branding?.tagline || 'A place to learn, grow, and succeed.',
        description: school.branding?.description || 'A welcoming place to support learning, academic progress, and student success.',
      };

      // Logo
      logoExistingKey.value = school.branding?.logoKey || '';
      if (logoExistingKey.value) {
        logoPreviewUrl.value = props.schoolPortalUrl(school, '/api/student/school/branding/logo');
        logoUploadState.value = 'existing';
      } else {
        logoPreviewUrl.value = null;
        logoUploadState.value = 'empty';
      }

      // Welcome image
      welcomeExistingKey.value = school.branding?.welcomeImageKey || '';
      if (welcomeExistingKey.value) {
        welcomePreviewUrl.value = props.schoolPortalUrl(school, '/api/student/school/branding/welcome-image');
        welcomeUploadState.value = 'existing';
      } else {
        welcomePreviewUrl.value = null;
        welcomeUploadState.value = 'empty';
      }
    };

    // File validation
    const validateImageFile = (file) => {
      if (!file) return { valid: false, error: 'No file selected' };
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
      }
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        return { valid: false, error: 'Image must be 5 MB or smaller' };
      }
      return { valid: true };
    };

    // Logo handlers
    const onLogoSelect = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        logoUploadError.value = validation.error;
        logoUploadState.value = 'error';
        event.target.value = '';
        return;
      }

      logoFile.value = file;
      logoUploadError.value = '';
      logoUploadState.value = 'selected';

      // Create object URL for preview
      if (logoPreviewUrl.value && logoUploadState.value !== 'existing') {
        URL.revokeObjectURL(logoPreviewUrl.value);
      }
      logoPreviewUrl.value = URL.createObjectURL(file);
    };

    const removeLogoSelection = () => {
      if (logoPreviewUrl.value) {
        URL.revokeObjectURL(logoPreviewUrl.value);
      }
      logoFile.value = null;
      logoPreviewUrl.value = null;
      logoUploadError.value = '';
      logoUploadState.value = logoExistingKey.value ? 'existing' : 'empty';
      if (logoInput.value) logoInput.value.value = '';

      // Restore existing preview if there was one
      if (logoExistingKey.value && props.school) {
        logoPreviewUrl.value = props.schoolPortalUrl(props.school, '/api/student/school/branding/logo');
      }
    };

    const replaceLogo = () => {
      // Keep the existing key but allow new selection
      logoUploadState.value = 'empty';
      logoPreviewUrl.value = null;
      if (logoInput.value) logoInput.value.click();
    };

    const uploadLogo = async () => {
      if (!logoFile.value || !props.school?._id) return;

      logoUploadState.value = 'uploading';
      logoUploadError.value = '';
      logoUploadProgress.value = 0;

      try {
        const data = new FormData();
        data.append('file', logoFile.value);
        const result = await api(`/schools/${props.school._id}/branding/logo`, {
          method: 'POST',
          body: data,
        });

        // Refresh school data to get updated branding keys
        if (props.school?._id) {
          const updatedSchool = await api(`/schools/${props.school._id}`);
          logoExistingKey.value = updatedSchool.branding?.logoKey || '';
          if (logoExistingKey.value) {
            logoPreviewUrl.value = props.schoolPortalUrl(updatedSchool, '/api/student/school/branding/logo');
          }
        }

        logoUploadState.value = 'uploaded';
        logoUploadProgress.value = 100;
        logoFile.value = null;
      } catch (error) {
        logoUploadError.value = error.message;
        logoUploadState.value = 'error';
        logoUploadProgress.value = 0;
      }
    };

    const retryLogoUpload = () => {
      if (logoFile.value) {
        uploadLogo();
      }
    };

    // Welcome image handlers
    const onWelcomeSelect = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        welcomeUploadError.value = validation.error;
        welcomeUploadState.value = 'error';
        event.target.value = '';
        return;
      }

      welcomeFile.value = file;
      welcomeUploadError.value = '';
      welcomeUploadState.value = 'selected';

      // Create object URL for preview
      if (welcomePreviewUrl.value && welcomeUploadState.value !== 'existing') {
        URL.revokeObjectURL(welcomePreviewUrl.value);
      }
      welcomePreviewUrl.value = URL.createObjectURL(file);
    };

    const removeWelcomeSelection = () => {
      if (welcomePreviewUrl.value) {
        URL.revokeObjectURL(welcomePreviewUrl.value);
      }
      welcomeFile.value = null;
      welcomePreviewUrl.value = null;
      welcomeUploadError.value = '';
      welcomeUploadState.value = welcomeExistingKey.value ? 'existing' : 'empty';
      if (welcomeInput.value) welcomeInput.value.value = '';

      // Restore existing preview if there was one
      if (welcomeExistingKey.value && props.school) {
        welcomePreviewUrl.value = props.schoolPortalUrl(props.school, '/api/student/school/branding/welcome-image');
      }
    };

    const replaceWelcome = () => {
      welcomeUploadState.value = 'empty';
      welcomePreviewUrl.value = null;
      if (welcomeInput.value) welcomeInput.value.click();
    };

    const uploadWelcome = async () => {
      if (!welcomeFile.value || !props.school?._id) return;

      welcomeUploadState.value = 'uploading';
      welcomeUploadError.value = '';
      welcomeUploadProgress.value = 0;

      try {
        const data = new FormData();
        data.append('file', welcomeFile.value);
        const result = await api(`/schools/${props.school._id}/branding/welcome-image`, {
          method: 'POST',
          body: data,
        });

        // Refresh school data to get updated branding keys
        if (props.school?._id) {
          const updatedSchool = await api(`/schools/${props.school._id}`);
          welcomeExistingKey.value = updatedSchool.branding?.welcomeImageKey || '';
          if (welcomeExistingKey.value) {
            welcomePreviewUrl.value = props.schoolPortalUrl(updatedSchool, '/api/student/school/branding/welcome-image');
          }
        }

        welcomeUploadState.value = 'uploaded';
        welcomeUploadProgress.value = 100;
        welcomeFile.value = null;
      } catch (error) {
        welcomeUploadError.value = error.message;
        welcomeUploadState.value = 'error';
        welcomeUploadProgress.value = 0;
      }
    };

    const retryWelcomeUpload = () => {
      if (welcomeFile.value) {
        uploadWelcome();
      }
    };

    // Form submission
    const handleSubmit = async () => {
      if (submitDisabled.value || submitting.value) return;

      submitting.value = true;
      errorMessage.value = '';

      try {
        if (props.mode === 'create') {
          await emit('submit', { ...form.value });
        } else {
          await emit('submit', { ...form.value, _id: props.school._id });
        }
        emit('close');
      } catch (error) {
        errorMessage.value = error.message;
      } finally {
        submitting.value = false;
      }
    };

    // Watch for modal open/close
    watch(() => props.isOpen, (open) => {
      if (open) {
        previousActiveElement.value = document.activeElement;
        initializeForm();
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      } else {
        // Restore body scroll
        document.body.style.overflow = '';
        // Clean up object URLs
        if (logoPreviewUrl.value && logoUploadState.value === 'selected') {
          URL.revokeObjectURL(logoPreviewUrl.value);
        }
        if (welcomePreviewUrl.value && welcomeUploadState.value === 'selected') {
          URL.revokeObjectURL(welcomePreviewUrl.value);
        }
      }
    });

    // Watch for school/mode changes while modal is open
    watch(() => [props.school, props.mode], () => {
      if (props.isOpen) {
        initializeForm();
      }
    });

    // Keyboard handling
    const handleKeydown = (event) => {
      if (!props.isOpen) return;
      if (event.key === 'Escape') {
        emit('close');
      }
      if (event.key === 'Tab') {
        // Focus trap
        const focusableElements = document.querySelectorAll('.modal-container button, .modal-container input, .modal-container select, .modal-container textarea, .modal-container [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown);
    });

    // Cleanup
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
      if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value);
      if (welcomePreviewUrl.value) URL.revokeObjectURL(welcomePreviewUrl.value);
    };

    return {
      form,
      logoFile,
      logoPreviewUrl,
      logoUploadState,
      logoUploadError,
      logoUploadProgress,
      logoExistingKey,
      welcomeFile,
      welcomePreviewUrl,
      welcomeUploadState,
      welcomeUploadError,
      welcomeUploadProgress,
      welcomeExistingKey,
      submitting,
      errorMessage,
      logoInput,
      welcomeInput,
      logoUploadStateLabel,
      welcomeUploadStateLabel,
      hasPendingUploads,
      submitDisabled,
      showUploadBlockingMessage,
      blockingMessage,
      onLogoSelect,
      removeLogoSelection,
      replaceLogo,
      uploadLogo,
      retryLogoUpload,
      onWelcomeSelect,
      removeWelcomeSelection,
      replaceWelcome,
      uploadWelcome,
      retryWelcomeUpload,
      handleSubmit,
    };
  },
  template,
};