export default `
<section class="platform-gateway-list">
  <article v-for="gateway in platformGateways" :key="gateway._id" class="platform-gateway-card">
    <header><div><p class="eyebrow">{{ gateway.integrationStatus === 'implemented' ? 'INTEGRATION AVAILABLE' : 'NOT YET INTEGRATED' }}</p><h2>{{ gateway.name }}</h2><p>{{ gateway.description }}</p></div><span :class="['status', gateway.isEnabled ? 'on' : 'off']">{{ gateway.isEnabled ? 'Platform enabled' : 'Platform disabled' }}</span></header>
    <button class="primary" :disabled="gatewaySaving === gateway.code || (!gateway.isEnabled && gateway.integrationStatus !== 'implemented')" @click="togglePlatformGateway(gateway)">{{ gatewaySaving === gateway.code ? 'Saving…' : gateway.integrationStatus !== 'implemented' ? 'Integration unavailable' : gateway.isEnabled ? 'Disable provider' : 'Enable provider' }}</button>
    <div class="platform-gateway-schools"><h3>School configurations</h3><p v-if="!gateway.schools?.length" class="muted">No schools have configured this gateway.</p><div v-for="schoolConfig in gateway.schools" :key="schoolConfig._id" class="platform-gateway-row"><span>{{ schoolConfig.school_id?.school_name || 'School' }}</span><span>{{ schoolConfig.credentialsConfigured ? 'Credentials configured' : 'Credentials missing' }}</span><span>{{ schoolConfig.configurationStatus }} · {{ schoolConfig.validationStatus }}</span><span>{{ schoolConfig.isEnabled ? 'Enabled' : 'Disabled' }}</span></div></div>
  </article>
</section>`;
