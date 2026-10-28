"use strict";

const GATEWAY_CATALOG = Object.freeze([
  {
    code: 'razorpay',
    name: 'Razorpay',
    description: 'Razorpay Standard Checkout for UPI, cards, net banking, and wallets.',
    isEnabled: true,
    integrationStatus: 'implemented',
    supportedPaymentMethods: ['upi', 'card', 'netbanking', 'wallet'],
    configurationFields: [
      { providerField: 'key_id', srmField: 'keyId', label: 'Key ID', type: 'text', required: true, secret: false, placeholder: 'rzp_test_… or rzp_live_…', helpText: 'Use the key issued for the selected environment.', validation: { pattern: '^rzp_(test|live)_.+$', environmentPatterns: { test: '^rzp_test_.+$', live: '^rzp_live_.+$' }, message: 'Enter a Key ID for the selected Razorpay environment.' }, environmentApplicability: ['test', 'live'] },
      { providerField: 'key_secret', srmField: 'keySecret', label: 'Key Secret', type: 'password', required: true, secret: true, placeholder: 'Enter the school merchant secret', helpText: 'Stored encrypted and isolated by environment.', environmentApplicability: ['test', 'live'] },
      { providerField: 'webhook_secret', srmField: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true, placeholder: 'Enter the school webhook secret', helpText: 'Must match the webhook secret configured for this environment.', environmentApplicability: ['test', 'live'] },
    ],
    capabilities: {
      canFilterPaymentMethods: true,
      canRestrictIndividualUpiApps: false,
      canSeparateCreditAndDebitCards: false,
      supportsTestMode: true,
      supportsLiveMode: true,
    },
  },
  {
    code: 'cashfree',
    name: 'Cashfree Payments',
    description: 'Cashfree gateway catalog entry. This provider is not integrated yet.',
    isEnabled: false,
    integrationStatus: 'unavailable',
    supportedPaymentMethods: [],
    configurationFields: [
      { providerField: 'app_id', srmField: 'keyId', label: 'App ID', type: 'text', required: true, secret: false, placeholder: 'Cashfree App ID', helpText: 'Enter the App ID for this environment.', environmentApplicability: ['test', 'live'] },
      { providerField: 'secret_key', srmField: 'keySecret', label: 'Secret Key', type: 'password', required: true, secret: true, placeholder: 'Cashfree Secret Key', helpText: 'Stored encrypted and isolated by environment.', environmentApplicability: ['test', 'live'] },
      { providerField: 'webhook_secret', srmField: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true, placeholder: 'Cashfree Webhook Secret', helpText: 'Webhook secret for this environment.', environmentApplicability: ['test', 'live'] },
    ],
    capabilities: { supportsTestMode: true, supportsLiveMode: true },
  },
  {
    code: 'phonepe',
    name: 'PhonePe Payment Gateway',
    description: 'PhonePe gateway catalog entry. This provider is not integrated yet.',
    isEnabled: false,
    integrationStatus: 'unavailable',
    supportedPaymentMethods: [],
    configurationFields: [
      { providerField: 'merchant_id', srmField: 'merchantId', label: 'Merchant ID', type: 'text', required: true, secret: false, placeholder: 'PhonePe Merchant ID', helpText: 'Merchant ID for this environment.', environmentApplicability: ['test', 'live'] },
      { providerField: 'salt_key', srmField: 'saltKey', label: 'Salt Key', type: 'password', required: true, secret: true, placeholder: 'PhonePe Salt Key', helpText: 'Stored encrypted and isolated by environment.', environmentApplicability: ['test', 'live'] },
      { providerField: 'salt_index', srmField: 'saltIndex', label: 'Salt Index', type: 'text', required: true, secret: false, placeholder: 'PhonePe Salt Index', helpText: 'Salt index issued for this environment.', environmentApplicability: ['test', 'live'] },
    ],
    capabilities: { supportsTestMode: true, supportsLiveMode: true },
  },
]);

async function seedGatewayCatalog(db) {
  for (const gateway of GATEWAY_CATALOG) {
    const { isEnabled, ...catalogMetadata } = gateway;
    catalogMetadata.gatewayId = gateway.code;
    catalogMetadata.schemaVersion = 1;
    catalogMetadata.customizationPolicy = ['environment', 'paymentMethods'];
    catalogMetadata.defaultConfiguration = { environment: 'test' };
    catalogMetadata.configurationFields = (gateway.configurationFields || []).map((field, index) => ({
      ...field, fieldKey: field.providerField, order: field.order ?? index + 1,
      helpText: field.helpText || '', environmentApplicability: field.environmentApplicability || ['test', 'live'],
      validation: field.validation || {},
    }));
    await db.Gateway.findOneAndUpdate(
      { code: gateway.code },
      { $set: catalogMetadata, $setOnInsert: { isEnabled } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
  return GATEWAY_CATALOG.length;
}

module.exports = { GATEWAY_CATALOG, seedGatewayCatalog };
