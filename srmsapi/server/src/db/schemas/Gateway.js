const mongoose = require('mongoose');

const GatewaySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, lowercase: true, trim: true, immutable: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isEnabled: { type: Boolean, default: false, index: true },
  integrationStatus: { type: String, enum: ['implemented', 'unavailable'], default: 'unavailable', index: true },
  supportedPaymentMethods: { type: [String], default: [] },
  capabilities: {
    canFilterPaymentMethods: { type: Boolean, default: false },
    canRestrictIndividualUpiApps: { type: Boolean, default: false },
    canSeparateCreditAndDebitCards: { type: Boolean, default: false },
    supportsTestMode: { type: Boolean, default: false },
    supportsLiveMode: { type: Boolean, default: false },
  },
}, { timestamps: true, collection: 'gateways' });

module.exports = mongoose.model('Gateway', GatewaySchema);
