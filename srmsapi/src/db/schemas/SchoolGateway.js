const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const SchoolGatewaySchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School' },
  gateway_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Gateway' },
  isEnabled: { type: Boolean, default: false, index: true },
  environment: { type: String, enum: ['test', 'live'], default: 'test' },
  paymentMethods: { type: [String], default: [] },
  // Environment keys keep Sandbox and Live merchant credentials isolated.
  configuration_encrypted: { type: String, default: '' },
  credentialsConfigured: { type: Boolean, default: false, index: true },
  configurationStatus: { type: String, enum: ['NOT_CONFIGURED', 'VALIDATION_REQUIRED', 'READY', 'VALIDATION_FAILED', 'DISCONNECTED'], default: 'NOT_CONFIGURED', index: true },
  validationStatus: { type: String, enum: ['NOT_VALIDATED', 'VALID', 'INVALID'], default: 'NOT_VALIDATED' },
  lastValidatedAt: Date,
  validationMessage: { type: String, maxlength: 180, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: tableNames.schoolGateways });

SchoolGatewaySchema.index({ school_id: 1, gateway_id: 1 }, { unique: true, name: 'unique_school_gateway_provider' });
SchoolGatewaySchema.index({ school_id: 1, isEnabled: 1, configurationStatus: 1 }, { name: 'school_gateway_readiness' });

module.exports = mongoose.model('SchoolGateway', SchoolGatewaySchema);
