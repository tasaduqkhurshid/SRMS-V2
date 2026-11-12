import { ref, watch } from 'vue';

import template from './SchoolGateways.template.js';

export default {
  name: 'SchoolGateways',
  props: {
    school: { type: Object, required: true },
    gateways: { type: Array, required: true },
    savingCode: { type: String, default: '' },
  },
  emits: ['back', 'save', 'toggle-enabled', 'validate'],
  template,
  setup(props, { emit }) {
    const editing = ref('');
    const forms = ref({});
    const visibleSecrets = ref({});
    const pendingEnable = ref({});

    watch(() => props.gateways, (gateways) => {
      for (const gateway of gateways) {
        if (!forms.value[gateway.code]) {
          forms.value[gateway.code] = {
            environment: gateway.environment || 'test',
            credentials: {},
            configuration: {},
            paymentMethods: [...(gateway.paymentMethods || gateway.supportedPaymentMethods || [])],
          };
        }
      }
    }, { immediate: true });

    watch(() => props.savingCode, (code, previousCode) => {
      if (previousCode && !code) pendingEnable.value[previousCode] = false;
    });

    const edit = (gateway) => {
      editing.value = gateway.code;
      forms.value[gateway.code] = {
        environment: gateway.environment || 'test',
        credentials: {},
        configuration: {},
        paymentMethods: [...(gateway.paymentMethods || gateway.supportedPaymentMethods || [])],
      };
    };

    const fieldsFor = (gateway) => (gateway.configurationFields || [])
      .filter((field) => (field.environmentApplicability || ['test', 'live']).includes(forms.value[gateway.code]?.environment))
      .sort((a, b) => a.order - b.order);

    const submit = (gateway) => emit('save', {
      code: gateway.code,
      form: forms.value[gateway.code],
      enableAfterSave: Boolean(pendingEnable.value[gateway.code]),
    });

    const canEnable = (gateway) => gateway.isEnabled || (gateway.platformEnabled && gateway.integrationStatus === 'implemented' && gateway.credentialsConfigured && gateway.configurationStatus === 'READY' && gateway.validationStatus === 'VALID');

    const handleToggle = (gateway, event) => {
      if (event.target.checked) {
        pendingEnable.value[gateway.code] = true;
        if (editing.value !== gateway.code) edit(gateway);
        return;
      }
      const wasPending = pendingEnable.value[gateway.code];
      pendingEnable.value[gateway.code] = false;
      if (wasPending && !gateway.isEnabled) return;
      emit('toggle-enabled', { code: gateway.code, enabled: false });
    };

    const cancelEdit = () => { if (editing.value) pendingEnable.value[editing.value] = false; editing.value = ''; };

    const initials = (gateway) => gateway.code === 'phonepe' ? 'पे' : gateway.code === 'razorpay' ? 'R' : gateway.code === 'cashfree' ? 'F' : gateway.name?.slice(0, 1) || '?';

    return { editing, forms, visibleSecrets, pendingEnable, edit, fieldsFor, submit, canEnable, handleToggle, cancelEdit, initials };
  },
};
