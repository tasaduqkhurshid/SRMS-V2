export default `
<p v-if="error" class="alert error">{{ error }}</p>
<p v-if="success" class="alert success">{{ success }}</p>
<PlatformStats :statistics="statistics" />
<StatsChart :statistics="statistics" />`;
