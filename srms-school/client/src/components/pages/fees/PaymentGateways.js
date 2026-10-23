import { api } from '../../../Services/api.js';

export default {
  name: 'PaymentGateways',
  data: () => ({ gateways: [], loading: true, saving: '', validating: '', message: '', error: '', forms: {}, editing: '' }),
  async mounted() { await this.load(); },
  methods: {
    blankForm(gateway) { return { environment: gateway.environment || 'test', credentials: {}, configuration: {}, paymentMethods: [...(gateway.paymentMethods || gateway.supportedPaymentMethods || [])] }; },
    async load() {
      this.loading = true; this.error = '';
      try {
        const response = await api.get('/fees/payment-gateways');
        this.gateways = response.data?.data || response.data || [];
        this.gateways.forEach((gateway) => { this.forms[gateway.code] = this.blankForm(gateway); });
      } catch (error) { this.error = error.response?.data?.message || 'Could not load payment gateways.'; }
      finally { this.loading = false; }
    },
    fields(gateway) { return (gateway.configurationFields || []).filter((field) => (field.environmentApplicability || ['test', 'live']).includes(this.forms[gateway.code]?.environment)).sort((a, b) => a.order - b.order); },
    async save(gateway) {
      this.saving = gateway.code; this.error = ''; this.message = '';
      try {
        const form = this.forms[gateway.code];
        await api.put(`/fees/payment-gateways/${gateway.code}`, { environment: form.environment, credentials: form.credentials, configuration: form.configuration, paymentMethods: form.paymentMethods });
        this.message = `${gateway.name} configuration saved.`; this.editing = ''; await this.load();
      } catch (error) { this.error = error.response?.data?.message || 'Configuration could not be saved.'; }
      finally { this.saving = ''; }
    },
    async validate(gateway) {
      this.validating = gateway.code; this.error = ''; this.message = '';
      try { await api.post(`/fees/payment-gateways/${gateway.code}/validate`); this.message = `${gateway.name} credentials validated.`; await this.load(); }
      catch (error) { this.error = error.response?.data?.message || 'Credentials could not be validated.'; await this.load(); }
      finally { this.validating = ''; }
    },
    async toggle(gateway) {
      this.saving = gateway.code; this.error = ''; this.message = '';
      try { await api.patch(`/fees/payment-gateways/${gateway.code}/enabled`, { enabled: !gateway.isEnabled }); this.message = `${gateway.name} ${gateway.isEnabled ? 'disabled' : 'enabled'}.`; await this.load(); }
      catch (error) { this.error = error.response?.data?.message || 'Gateway status could not be updated.'; }
      finally { this.saving = ''; }
    },
    async disconnect(gateway) {
      if (!window.confirm(`Disconnect ${gateway.name}? This removes saved credentials but keeps payment history.`)) return;
      this.saving = gateway.code; this.error = '';
      try { await api.delete(`/fees/payment-gateways/${gateway.code}`); this.message = `${gateway.name} disconnected.`; await this.load(); }
      catch (error) { this.error = error.response?.data?.message || 'Gateway could not be disconnected.'; }
      finally { this.saving = ''; }
    },
  },
  template: `<main class="gateway-page"><header class="gateway-heading"><div><p class="gateway-eyebrow">FEE OPERATIONS</p><h1>Payment Gateways</h1><p>Connect your merchant account to accept secure online fee payments.</p></div></header><p v-if="message" class="gateway-notice success" role="status">{{ message }}</p><p v-if="error" class="gateway-notice danger" role="alert">{{ error }}</p><div v-if="loading" class="gateway-card">Loading payment gateways…</div><section v-else class="gateway-grid"><article v-for="gateway in gateways" :key="gateway.code" class="gateway-card"><div class="gateway-card-head"><div><h2>{{ gateway.name }}</h2><p>{{ gateway.description }}</p></div><span class="gateway-pill" :class="gateway.isEnabled ? 'ready' : 'idle'">{{ gateway.isEnabled ? 'Enabled' : 'Disabled' }}</span></div><div class="gateway-meta"><span>Credentials: <b>{{ gateway.credentialsConfigured ? 'Configured' : 'Missing' }}</b></span><span>Status: <b>{{ gateway.configurationStatus }}</b></span><span>Environment: <b>{{ gateway.environment === 'live' ? 'Live' : 'Sandbox' }}</b></span><span>Validation: <b>{{ gateway.validationStatus }}</b></span></div><p v-if="gateway.integrationStatus !== 'implemented'" class="gateway-unavailable">Credentials can be saved, but payment processing is not integrated for this provider yet.</p><button v-if="editing !== gateway.code" class="gateway-primary" type="button" @click="editing = gateway.code">Edit {{ gateway.name }}</button><div v-else class="gateway-form"><div class="gateway-environment-switch"><button type="button" :class="{ selected: forms[gateway.code].environment === 'test' }" @click="forms[gateway.code].environment = 'test'">Sandbox</button><button type="button" :class="['live-option', { selected: forms[gateway.code].environment === 'live' }]" @click="forms[gateway.code].environment = 'live'"><i></i>Live</button></div><p class="gateway-help">Sandbox and Live credentials are stored separately. Switching environments keeps the other environment's credentials.</p><label v-for="field in fields(gateway)" :key="field.srmField">{{ field.label }}<input v-model="forms[gateway.code][field.secret ? 'credentials' : 'configuration'][field.srmField]" :type="field.type || (field.secret ? 'password' : 'text')" :placeholder="gateway.configuredFields?.includes(field.srmField) ? (field.secret ? 'Saved securely · enter to replace' : field.placeholder) : field.placeholder" :required="field.required && !gateway.configuredFields?.includes(field.srmField)" :pattern="field.validation?.environmentPatterns?.[forms[gateway.code].environment] || field.validation?.pattern || undefined" :minlength="field.validation?.minLength || undefined" :maxlength="field.validation?.maxLength || undefined" :title="field.validation?.message || undefined" :autocomplete="field.secret ? 'new-password' : 'off'" /><small v-if="field.helpText">{{ field.helpText }}</small></label><fieldset v-if="gateway.supportedPaymentMethods?.length"><legend>Payment methods</legend><label v-for="method in gateway.supportedPaymentMethods" :key="method" class="gateway-check"><input v-model="forms[gateway.code].paymentMethods" type="checkbox" :value="method" />{{ method }}</label></fieldset><div class="gateway-actions"><button class="gateway-secondary" @click="editing = ''">Cancel</button><button class="gateway-primary" :disabled="saving === gateway.code" @click="save(gateway)">{{ saving === gateway.code ? 'Saving…' : 'Save configuration' }}</button></div></div><div v-if="gateway.integrationStatus === 'implemented'" class="gateway-actions"><button class="gateway-secondary" :disabled="validating === gateway.code || !gateway.credentialsConfigured" @click="validate(gateway)">{{ validating === gateway.code ? 'Validating…' : 'Validate credentials' }}</button><button class="gateway-secondary" :disabled="saving === gateway.code || !gateway.credentialsConfigured" @click="toggle(gateway)">{{ gateway.isEnabled ? 'Disable' : 'Enable' }}</button><button v-if="gateway.credentialsConfigured" class="gateway-link" :disabled="saving === gateway.code" @click="disconnect(gateway)">Disconnect</button></div><router-link v-if="gateway.code === 'razorpay' && gateway.environment === 'test' && gateway.isEnabled && gateway.configurationStatus === 'READY'" class="gateway-test-link" :to="'/payment-gateways/test/' + gateway.code">Open sandbox test page</router-link></article></section></main>`,
};
