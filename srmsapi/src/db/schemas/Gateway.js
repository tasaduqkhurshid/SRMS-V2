const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const GatewaySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, lowercase: true, trim: true, immutable: true },
  gatewayId: { type: String, immutable: true, trim: true, default: function () { return this.code; } },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isEnabled: { type: Boolean, default: false, index: true },
  integrationStatus: { type: String, enum: ['implemented', 'unavailable'], default: 'unavailable', index: true },
  supportedPaymentMethods: { type: [String], default: [] },
  configurationFields: [{
    fieldKey: { type: String, trim: true, default: '' },
    providerField: { type: String, required: true, trim: true },
    srmField: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ['text', 'password', 'email', 'url', 'number'], default: 'text' },
    required: { type: Boolean, default: false },
    secret: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    helpText: { type: String, default: '' },
    order: { type: Number, default: 0 },
    environmentApplicability: { type: [String], enum: ['test', 'live'], default: ['test', 'live'] },
    validation: {
      pattern: { type: String, default: '' },
      environmentPatterns: {
        test: { type: String, default: '' },
        live: { type: String, default: '' },
      },
      minLength: { type: Number, min: 0 },
      maxLength: { type: Number, min: 0 },
      message: { type: String, default: '' },
    },
    options: [{ value: String, label: String }],
  }],
  capabilities: {
    canFilterPaymentMethods: { type: Boolean, default: false },
    canRestrictIndividualUpiApps: { type: Boolean, default: false },
    canSeparateCreditAndDebitCards: { type: Boolean, default: false },
    supportsTestMode: { type: Boolean, default: false },
    supportsLiveMode: { type: Boolean, default: false },
  },
  defaultConfiguration: { type: mongoose.Schema.Types.Mixed, default: {} },
  customizationPolicy: { type: [String], default: ['environment', 'paymentMethods'] },
  schemaVersion: { type: Number, min: 1, default: 1 },
}, { timestamps: true, collection: tableNames.gateways });

module.exports = mongoose.model('Gateway', GatewaySchema);
