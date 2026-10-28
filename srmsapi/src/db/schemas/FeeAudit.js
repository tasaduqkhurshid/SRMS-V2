const mongoose = require('mongoose');

const FeeAuditSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School', index: true },
  actor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, maxlength: 64 },
  entity_type: { type: String, required: true, maxlength: 64 },
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, collection: 'fee_audit_logs' });
module.exports = mongoose.model('FeeAudit', FeeAuditSchema);
