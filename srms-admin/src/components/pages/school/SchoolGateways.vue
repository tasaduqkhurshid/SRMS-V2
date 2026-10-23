<script setup>
import { reactive, ref, watch } from 'vue';

const props = defineProps({ school: { type: Object, required: true }, gateways: { type: Array, required: true }, savingCode: { type: String, default: '' } });
const emit = defineEmits(['back', 'save', 'toggle-enabled', 'validate']);
const editing = ref('');
const forms = reactive({});
const visibleSecrets = reactive({});
const pendingEnable = reactive({});
watch(() => props.gateways, (gateways) => {
  for (const gateway of gateways) {
    if (!forms[gateway.code]) forms[gateway.code] = { environment: gateway.environment || 'test', credentials: {}, configuration: {}, paymentMethods: [...(gateway.paymentMethods || gateway.supportedPaymentMethods || [])] };
  }
}, { immediate: true });
watch(() => props.savingCode, (code, previousCode) => {
  if (previousCode && !code) pendingEnable[previousCode] = false;
});
const edit = (gateway) => {
  editing.value = gateway.code;
  forms[gateway.code] = { environment: gateway.environment || 'test', credentials: {}, configuration: {}, paymentMethods: [...(gateway.paymentMethods || gateway.supportedPaymentMethods || [])] };
};
const fieldsFor = (gateway) => (gateway.configurationFields || []).filter((field) => (field.environmentApplicability || ['test', 'live']).includes(forms[gateway.code]?.environment)).sort((a, b) => a.order - b.order);
const submit = (gateway) => emit('save', { code: gateway.code, form: forms[gateway.code], enableAfterSave: Boolean(pendingEnable[gateway.code]) });
const canEnable = (gateway) => gateway.isEnabled || (gateway.platformEnabled && gateway.integrationStatus === 'implemented' && gateway.credentialsConfigured && gateway.configurationStatus === 'READY' && gateway.validationStatus === 'VALID');
const handleToggle = (gateway, event) => {
  if (event.target.checked) {
    pendingEnable[gateway.code] = true;
    if (editing.value !== gateway.code) edit(gateway);
    return;
  }
  const wasPending = pendingEnable[gateway.code];
  pendingEnable[gateway.code] = false;
  if (wasPending && !gateway.isEnabled) return;
  emit('toggle-enabled', { code: gateway.code, enabled: false });
};
const cancelEdit = () => { if (editing.value) pendingEnable[editing.value] = false; editing.value = ''; };
const initials = (gateway) => gateway.code === 'phonepe' ? 'पे' : gateway.code === 'razorpay' ? 'R' : gateway.code === 'cashfree' ? 'F' : gateway.name?.slice(0, 1) || '?';
</script>

<template>
  <section class="school-gateways-page">
    <header class="gateway-page-heading"><div><p class="eyebrow">SCHOOL DETAILS › GATEWAYS</p><h2>{{ school.school_name }} gateways</h2><p>Manage this school's payment gateways, configure provider credentials, switch between sandbox and live payment modes, and control which gateways are enabled for collecting student fees.</p></div><button class="secondary back-button" type="button" @click="emit('back')"><span aria-hidden="true">←</span> Back to school</button></header>
    <p v-if="!gateways.length" class="muted">No payment gateways are available in the platform catalog.</p>
    <article v-for="gateway in gateways" :key="gateway.code" class="school-gateway-config-card" :class="{ expanded: editing === gateway.code }">
      <header class="gateway-card-heading">
        <button class="gateway-title-button" type="button" :aria-expanded="editing === gateway.code" @click="editing === gateway.code ? editing = '' : edit(gateway)">
          <span class="provider-icon" :class="gateway.code">{{ initials(gateway) }}</span><span class="gateway-title">{{ gateway.name }}</span>
          <span :class="['status', gateway.platformEnabled ? 'on' : 'off']">{{ gateway.platformEnabled ? 'Active' : 'Inactive' }}</span>
        </button>
        <label class="gateway-enable-control" :title="canEnable(gateway) ? '' : 'The server will require configured and validated credentials before enabling this gateway.'">
          <input type="checkbox" :checked="gateway.isEnabled || pendingEnable[gateway.code]" :disabled="savingCode === gateway.code" @change="handleToggle(gateway, $event)" />
          <span class="gateway-switch" aria-hidden="true"></span><b>{{ gateway.isEnabled ? 'Enabled' : pendingEnable[gateway.code] ? 'Save to enable' : 'Disabled' }}</b>
        </label>
      </header>
      <form v-if="editing === gateway.code" class="school-gateway-fields" @submit.prevent="submit(gateway)">
        <div class="gateway-mode-row"><strong>Mode</strong><div class="gateway-environment-toggle" role="group" :aria-label="`${gateway.name} environment`">
          <button type="button" :class="{ selected: forms[gateway.code].environment === 'test' }" @click="forms[gateway.code].environment = 'test'">Sandbox (Test)</button>
          <button type="button" :class="['live-choice', { selected: forms[gateway.code].environment === 'live' }]" @click="forms[gateway.code].environment = 'live'">Live (Production)</button>
        </div></div>
        <label v-for="field in fieldsFor(gateway)" :key="field.srmField" class="gateway-config-field" :class="{ wide: field.type === 'url' || /webhook/i.test(field.label) }">
          <span>{{ field.label }}<em v-if="!field.required"> (Optional)</em></span>
          <span class="gateway-input-wrap"><input v-model="forms[gateway.code].credentials[field.srmField]" :type="field.secret && visibleSecrets[`${gateway.code}:${field.srmField}`] ? 'text' : field.type || (field.secret ? 'password' : 'text')" :placeholder="gateway.configuredFields?.includes(field.srmField) ? (field.secret ? 'Saved securely · enter to replace' : field.placeholder) : field.placeholder" :required="field.required && !gateway.configuredFields?.includes(field.srmField)" :pattern="field.validation?.environmentPatterns?.[forms[gateway.code].environment] || field.validation?.pattern || undefined" :minlength="field.validation?.minLength || undefined" :maxlength="field.validation?.maxLength || undefined" :title="field.validation?.message || undefined" :autocomplete="field.secret ? 'new-password' : 'off'" /><button v-if="field.secret" class="secret-toggle" type="button" :aria-label="visibleSecrets[`${gateway.code}:${field.srmField}`] ? 'Hide secret' : 'Show secret'" @click="visibleSecrets[`${gateway.code}:${field.srmField}`] = !visibleSecrets[`${gateway.code}:${field.srmField}`]">{{ visibleSecrets[`${gateway.code}:${field.srmField}`] ? '◉' : '◎' }}</button></span>
          <small v-if="field.helpText">{{ field.helpText }}</small>
        </label>
        <fieldset v-if="gateway.supportedPaymentMethods?.length" class="gateway-methods"><legend>Payment methods</legend><label v-for="method in gateway.supportedPaymentMethods" :key="method"><input v-model="forms[gateway.code].paymentMethods" type="checkbox" :value="method" />{{ method }}</label></fieldset>
        <p v-if="gateway.validationMessage" class="gateway-validation-message">{{ gateway.validationMessage }}</p>
        <div class="school-gateway-actions"><button v-if="gateway.credentialsConfigured && gateway.integrationStatus === 'implemented' && !pendingEnable[gateway.code]" class="secondary" type="button" :disabled="savingCode === gateway.code" @click="emit('validate', gateway.code)">Validate credentials</button><span class="action-spacer"></span><button class="secondary" type="button" @click="cancelEdit">Cancel</button><button class="primary" type="submit" :disabled="savingCode === gateway.code">{{ savingCode === gateway.code ? 'Saving…' : pendingEnable[gateway.code] ? 'Save and enable' : 'Save' }}</button></div>
      </form>
    </article>
  </section>
</template>

<style scoped>
.school-gateways-page{display:grid;gap:16px;padding:4px 2px}.gateway-page-heading{display:flex;justify-content:space-between;align-items:center;gap:22px;padding:8px 2px 5px}.gateway-page-heading h2{margin:0 0 5px;color:#142344;font-size:21px}.gateway-page-heading p:not(.eyebrow){max-width:920px;margin:0;color:#687997;font-size:13px;line-height:1.5}.eyebrow{margin:0 0 7px;color:#527ce2;font-size:10px;font-weight:800;letter-spacing:.16em}.back-button{white-space:nowrap}.back-button span{margin-right:9px;font-size:18px}.school-gateway-config-card{overflow:hidden;border:1px solid #dce6f6;border-radius:13px;padding:16px 18px;background:#fff;box-shadow:0 3px 12px #31568b08}.school-gateway-config-card.expanded{padding-bottom:12px}.gateway-card-heading{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:43px}.gateway-title-button{display:flex;align-items:center;gap:14px;min-width:0;padding:0;border:0;background:none;text-align:left;cursor:pointer}.provider-icon{display:grid;place-items:center;flex:0 0 50px;width:50px;height:50px;border-radius:11px;background:#0b1740;color:#36d2ad;font-size:24px;font-weight:800;box-shadow:0 2px 7px #19244736}.provider-icon.phonepe{background:#5939b4;color:white;font-size:29px}.provider-icon.razorpay{background:#102449;color:#50a5ff;font-style:italic}.gateway-title{color:#111f43;font-size:19px;font-weight:750;letter-spacing:-.02em}.gateway-title-button .status{margin-left:8px;padding:7px 13px;font-size:13px;text-transform:none}.gateway-enable-control{display:flex;align-items:center;gap:11px;flex-shrink:0;color:#17264a;font-size:14px;cursor:pointer}.gateway-enable-control input{position:absolute;opacity:0;width:1px;height:1px}.gateway-switch{position:relative;width:54px;height:32px;border-radius:18px;background:#c8d0df;transition:background .18s}.gateway-switch:after{content:"";position:absolute;top:4px;left:4px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 4px #18254335;transition:transform .18s}.gateway-enable-control input:checked+.gateway-switch{background:#1468f5}.gateway-enable-control input:checked+.gateway-switch:after{transform:translateX(22px)}.gateway-enable-control input:disabled+.gateway-switch{opacity:.7;cursor:not-allowed}.school-gateway-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 30px;margin-top:10px;padding:18px 20px 3px;border-radius:10px;background:linear-gradient(110deg,#f3f8fd,#f0f6fc)}.gateway-mode-row{grid-column:1/-1;display:flex;align-items:center;gap:20px;color:#536585;font-size:13px}.gateway-environment-toggle{display:inline-flex;gap:2px;padding:3px;border:1px solid #d9e2f0;border-radius:24px;background:#fff}.gateway-environment-toggle button{padding:7px 14px;border:0;border-radius:20px;background:transparent;color:#29395b;font:inherit;cursor:pointer}.gateway-environment-toggle button.selected{background:#1269f6;color:#fff;box-shadow:0 2px 6px #1269f633}.gateway-config-field{display:grid;align-content:start;gap:6px;color:#4d5d7e;font-size:13px;font-weight:700}.gateway-config-field.wide{grid-column:1/-1}.gateway-config-field em{color:#8190ad;font-style:normal;font-weight:400}.gateway-input-wrap{position:relative;display:block}.gateway-input-wrap input{box-sizing:border-box;width:100%;height:38px;padding:8px 42px 8px 14px;border:1px solid #d3deef;border-radius:7px;background:#fff;color:#243453;font:inherit;font-weight:500}.gateway-input-wrap input:focus{outline:2px solid #1768f533;border-color:#1768f5}.gateway-config-field small{color:#71819f;font-weight:400}.secret-toggle{position:absolute;top:0;right:4px;height:100%;padding:0 9px;border:0;background:transparent;color:#273653;font-size:18px;cursor:pointer}.gateway-methods{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:12px;border:1px solid #dce5f2;border-radius:8px}.gateway-methods legend{padding:0 5px;font-weight:700}.gateway-methods label{display:inline-flex;align-items:center;gap:6px;text-transform:capitalize}.gateway-validation-message{grid-column:1/-1;margin:0;color:#b53d37;font-size:13px}.school-gateway-actions{grid-column:1/-1;display:flex;align-items:center;gap:9px}.action-spacer{flex:1}.school-gateway-actions .primary,.school-gateway-actions .secondary{min-height:38px}.muted{color:#687997}
@media(max-width:720px){.gateway-page-heading{align-items:flex-start;flex-direction:column}.gateway-card-heading{align-items:flex-start;flex-direction:column}.gateway-enable-control{align-self:flex-end}.gateway-title-button{flex-wrap:wrap}.gateway-title{font-size:16px}.school-gateway-fields{grid-template-columns:1fr;padding:14px}.gateway-config-field.wide{grid-column:auto}.gateway-mode-row{align-items:flex-start;flex-direction:column;gap:9px}.school-gateway-actions{flex-wrap:wrap}}
</style>
