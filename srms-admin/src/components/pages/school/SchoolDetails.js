import template from './SchoolDetailsTemplate.js';

export default {
  name: 'SchoolDetails',
  props: {
    school: { type: Object, required: true },
    administrators: { type: Array, required: true },
    passwordResetAdmin: { type: Object, default: null },
    adminNewPassword: { type: String, default: '' },
    adminForm: { type: Object, required: true },
    saving: { type: Boolean, default: false },
    schoolPortalUrl: { type: Function, required: true },
    paymentSettings: { type: Object, default: null },
    paymentSettingsSaving: { type: Boolean, default: false },
  },
  emits: [
    'back', 'edit', 'upload-branding',
    'start-password-reset', 'cancel-password-reset', 'update-password',
    'update-admin-password', 'create-administrator', 'toggle-online-payments',
  ],
  template,
};
