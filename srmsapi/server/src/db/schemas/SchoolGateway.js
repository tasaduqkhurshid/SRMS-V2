const mongoose = require('mongoose');

const SchoolGatewaySchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School', index: true },
  gateway_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Gateway', index: true },
  isEnabled: { type: Boolean, default: false, index: true },
  environment: { type: String, enum: ['test', 'live'], default: 'test' },
  paymentMethods: { type: [String], default: [] },
  key_id: { type: String, trim: true, default: '' },
  key_secret_encrypted: { type: String, default: '' },
  webhook_secret_encrypted: { type: String, default: '' },
  credentialsConfigured: { type: Boolean, default: false, index: true },
  configurationStatus: { type: String, enum: ['NOT_CONFIGURED', 'VALIDATION_REQUIRED', 'READY', 'VALIDATION_FAILED', 'DISCONNECTED'], default: 'NOT_CONFIGURED', index: true },
  validationStatus: { type: String, enum: ['NOT_VALIDATED', 'VALID', 'INVALID'], default: 'NOT_VALIDATED' },
  lastValidatedAt: Date,
  validationMessage: { type: String, maxlength: 180, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'school_gateways' });

module.exports = mongoose.model('SchoolGateway', SchoolGatewaySchema);
