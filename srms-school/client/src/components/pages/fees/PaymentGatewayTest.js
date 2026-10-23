import { api } from '../../../Services/api.js';

const readData = (response) => response.data?.data || response.data;
const loadCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = resolve;
  script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.'));
  document.head.appendChild(script);
});

export default {
  name: 'PaymentGatewayTest',
  data: () => ({ gateway: null, loading: true, busy: false, error: '', success: null }),
  async mounted() {
    try {
      const { data } = await api.get('/fees/payment-gateways');
      this.gateway = (data?.data || data || []).find((item) => item.code === this.$route.params.code) || null;
    } catch (error) { this.error = error.response?.data?.message || 'Gateway status could not be loaded.'; }
    finally { this.loading = false; }
  },
  methods: {
    async startTest() {
      if (this.busy || !this.gatewayReady) return;
      this.busy = true; this.error = ''; this.success = null;
      try {
        const { data } = await api.post(`/fees/payment-gateways/${this.gateway.code}/test-orders`);
        const order = readData({ data });
        await loadCheckout();
        const Checkout = window.Razorpay;
        if (!Checkout) throw new Error('Razorpay Checkout is unavailable.');
        const instruments = (order.payment_methods || ['upi', 'card', 'netbanking', 'wallet']).map((method) => ({ method }));
        const checkout = new Checkout({
          key: order.key_id, order_id: order.order_id, amount: order.amount_minor, currency: order.currency,
          name: this.gateway.name, description: 'Sandbox gateway connectivity test',
          config: { display: { blocks: { schoolMethods: { name: 'Payment methods', instruments } }, sequence: ['block.schoolMethods'], preferences: { show_default_blocks: false } } },
          handler: async (payment) => {
            try {
              const result = await api.post(`/fees/payment-gateways/${this.gateway.code}/test-orders/verify`, payment);
              this.success = readData(result);
            } catch (error) { this.error = error.response?.data?.message || 'The sandbox payment could not be verified.'; }
            finally { this.busy = false; }
          },
          modal: { ondismiss: () => { this.busy = false; } },
          theme: { color: '#4f46e5' },
        });
        checkout.on('payment.failed', () => { this.error = 'The sandbox payment attempt failed. Check the Razorpay test credentials and try again.'; this.busy = false; });
        checkout.open();
      } catch (error) { this.error = error.response?.data?.message || error.message || 'The sandbox test could not be started.'; this.busy = false; }
    },
  },
  computed: {
    gatewayReady() { return Boolean(this.gateway?.code === 'razorpay' && this.gateway.isEnabled && this.gateway.environment === 'test' && this.gateway.configurationStatus === 'READY' && this.gateway.validationStatus === 'VALID'); },
  },
  template: `<main class="gateway-page"><router-link class="gateway-back" to="/payment-gateways">← Back to Payment Gateways</router-link><header class="gateway-heading"><div><p class="gateway-eyebrow">SANDBOX DIAGNOSTICS</p><h1>Test payment</h1><p>Confirm that this school's enabled test gateway can create and receive a payment.</p></div></header><p v-if="error" class="gateway-notice danger" role="alert">{{ error }}</p><section class="gateway-test-card"><div v-if="loading">Checking gateway readiness…</div><template v-else><div class="gateway-test-state"><span class="gateway-pill" :class="gatewayReady ? 'ready' : 'idle'">{{ gatewayReady ? 'Ready for sandbox test' : 'Not ready' }}</span><span>{{ gateway?.name || 'Gateway unavailable' }}</span><span>Mode: Sandbox</span></div><p class="gateway-test-description">The test opens Razorpay Checkout for ₹1.00 using the school's test credentials. It verifies the signed Checkout response and provider payment status. This test does not create a fee transaction, issue a receipt, or change student balances.</p><p v-if="!gatewayReady" class="gateway-unavailable">Enable this school's gateway in sandbox mode and validate its test credentials before starting the test.</p><section v-if="success" class="gateway-test-result" role="status"><span class="gateway-pill ready">Payment received and verified</span><p>Razorpay confirmed a ₹1.00 sandbox payment for this school's merchant account.</p><small>Verified {{ new Date(success.verified_at).toLocaleString() }}</small></section><button class="gateway-primary gateway-test-button" :disabled="!gatewayReady || busy" @click="startTest">{{ busy ? 'Waiting for secure Checkout…' : success ? 'Run another sandbox test' : 'Start ₹1.00 sandbox payment' }}</button></template></section></main>`,
};
