const mongoose = require('mongoose');

const FeePaymentSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School', index: true },
  account_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'StudentFeeAccount', index: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student', index: true },
  amount_minor: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  kind: { type: String, enum: ['COLLECTION', 'REFUND', 'REVERSAL'], default: 'COLLECTION', index: true },
  method: { type: String, enum: ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'ONLINE'], required: true },
  status: { type: String, enum: ['INITIATED', 'PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'REFUNDED'], default: 'CONFIRMED', index: true },
  reference: { type: String, trim: true, maxlength: 160, default: '' },
  idempotency_key: { type: String, required: true, maxlength: 160 },
  provider_order_id: { type: String, default: '' },
  gateway_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gateway' },
  gateway_code: { type: String, trim: true, default: '' },
  gateway_environment: { type: String, enum: ['test', 'live'] },
  provider_expires_at: Date,
  provider_payment_id: { type: String },
  provider_refund_id: { type: String },
  refund_reserved_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  provider_failed_payment_ids: { type: [String], default: [] },
  receipt_number: { type: String },
  received_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  related_payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FeePayment' },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  confirmed_at: Date,
}, { timestamps: true, collection: 'fee_payments' });

module.exports = mongoose.model('FeePayment', FeePaymentSchema);
