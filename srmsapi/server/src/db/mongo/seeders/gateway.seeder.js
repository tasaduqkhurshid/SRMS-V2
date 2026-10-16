"use strict";

const GATEWAY_CATALOG = Object.freeze([
  {
    code: 'razorpay',
    name: 'Razorpay',
    description: 'Razorpay Standard Checkout for UPI, cards, net banking, and wallets.',
    isEnabled: true,
    integrationStatus: 'implemented',
    supportedPaymentMethods: ['upi', 'card', 'netbanking', 'wallet'],
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
    capabilities: { supportsTestMode: true, supportsLiveMode: true },
  },
  {
    code: 'phonepe',
    name: 'PhonePe Payment Gateway',
    description: 'PhonePe gateway catalog entry. This provider is not integrated yet.',
    isEnabled: false,
    integrationStatus: 'unavailable',
    supportedPaymentMethods: [],
    capabilities: { supportsTestMode: true, supportsLiveMode: true },
  },
]);

async function seedGatewayCatalog(db) {
  for (const gateway of GATEWAY_CATALOG) {
    await db.Gateway.findOneAndUpdate(
      { code: gateway.code },
      { $setOnInsert: gateway },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
  return GATEWAY_CATALOG.length;
}

module.exports = { GATEWAY_CATALOG, seedGatewayCatalog };
