export default `<section class="school-gateways-page">
  <header class="gateway-page-heading">
    <div>
      <p class="eyebrow">SCHOOL DETAILS › GATEWAYS</p>
      <h2>{{ school.school_name }} gateways</h2>
      <p>Manage this school's payment gateways, configure provider credentials, switch between sandbox and live payment modes, and control which gateways are enabled for collecting student fees.</p>
    </div>
    <button class="secondary back-button" type="button" @click="$emit('back')"><span aria-hidden="true">←</span> Back to school</button>
  </header>
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
      <div class="gateway-mode-row"><strong>Mode</strong><div class="gateway-environment-toggle" role="group" :aria-label="\`\${gateway.name} environment\`">
        <button type="button" :class="{ selected: forms[gateway.code].environment === 'test' }" @click="forms[gateway.code].environment = 'test'">Sandbox (Test)</button>
        <button type="button" :class="['live-choice', { selected: forms[gateway.code].environment === 'live' }]" @click="forms[gateway.code].environment = 'live'">Live (Production)</button>
      </div></div>
      <label v-for="field in fieldsFor(gateway)" :key="field.srmField" class="gateway-config-field" :class="{ wide: field.type === 'url' || /webhook/i.test(field.label) }">
        <span>{{ field.label }}<em v-if="!field.required"> (Optional)</em></span>
        <span class="gateway-input-wrap"><input v-model="forms[gateway.code].credentials[field.srmField]" :type="field.secret && visibleSecrets[\`\${gateway.code}:\${field.srmField}\`] ? 'text' : field.type || (field.secret ? 'password' : 'text')" :placeholder="gateway.configuredFields?.includes(field.srmField) ? (field.secret ? 'Saved securely · enter to replace' : field.placeholder) : field.placeholder" :required="field.required && !gateway.configuredFields?.includes(field.srmField)" :pattern="field.validation?.environmentPatterns?.[forms[gateway.code].environment] || field.validation?.pattern || undefined" :minlength="field.validation?.minLength || undefined" :maxlength="field.validation?.maxLength || undefined" :title="field.validation?.message || undefined" :autocomplete="field.secret ? 'new-password' : 'off'" /><button v-if="field.secret" class="secret-toggle" type="button" :aria-label="visibleSecrets[\`\${gateway.code}:\${field.srmField}\`] ? 'Hide secret' : 'Show secret'" @click="visibleSecrets[\`\${gateway.code}:\${field.srmField}\`] = !visibleSecrets[\`\${gateway.code}:\${field.srmField}\`]">{{ visibleSecrets[\`\${gateway.code}:\${field.srmField}\`] ? '◉' : '◎' }}</button></span>
        <small v-if="field.helpText">{{ field.helpText }}</small>
      </label>
      <fieldset v-if="gateway.supportedPaymentMethods?.length" class="gateway-methods"><legend>Payment methods</legend><label v-for="method in gateway.supportedPaymentMethods" :key="method"><input v-model="forms[gateway.code].paymentMethods" type="checkbox" :value="method" />{{ method }}</label></fieldset>
      <p v-if="gateway.validationMessage" class="gateway-validation-message">{{ gateway.validationMessage }}</p>
      <div class="school-gateway-actions"><button v-if="gateway.credentialsConfigured && gateway.integrationStatus === 'implemented' && !pendingEnable[gateway.code]" class="secondary" type="button" :disabled="savingCode === gateway.code" @click="$emit('validate', gateway.code)">Validate credentials</button><span class="action-spacer"></span><button class="secondary" type="button" @click="cancelEdit">Cancel</button><button class="primary" type="submit" :disabled="savingCode === gateway.code">{{ savingCode === gateway.code ? 'Saving…' : pendingEnable[gateway.code] ? 'Save and enable' : 'Save' }}</button></div>
    </form>
  </article>
</section>`;
