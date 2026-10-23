const mongoose = require('mongoose');

const AccountLineSchema = new mongoose.Schema({
  fee_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeType' },
  name: { type: String, required: true },
  amount_minor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  billing_period: { type: String, enum: ['MONTHLY', 'ANNUAL'], default: 'MONTHLY' },
  concession_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
}, { _id: false });
const AccountInstallmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  due_date: { type: Date, required: true },
  amount_minor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  paid_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  reserved_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  lines: { type: [{ fee_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeType' }, name: String, billing_period: { type: String, enum: ['MONTHLY', 'ANNUAL'], default: 'MONTHLY' }, amount_minor: { type: Number, min: 0, validate: Number.isSafeInteger }, gross_amount_minor: { type: Number, min: 0, validate: Number.isSafeInteger }, concession_minor: { type: Number, min: 0, validate: Number.isSafeInteger } }], default: [] },
}, { _id: true });
const AdjustmentSchema = new mongoose.Schema({
  kind: { type: String, enum: ['CONCESSION', 'ADJUSTMENT'], required: true },
  amount_minor: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  idempotency_key: { type: String, required: true, maxlength: 160 },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
}, { _id: true });

const StudentFeeAccountSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School', index: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student', index: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course', index: true },
  academic_year_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'AcademicYear', index: true },
  fee_structure_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'FeeStructure' },
  structure_name: { type: String, required: true },
  lines: { type: [AccountLineSchema], default: [] },
  monthly_total_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  monthly_concession_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  annual_total_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  annual_concession_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  months_remaining: { type: Number, default: 0, min: 0 },
  assigned_at: { type: Date, default: Date.now },
  due_day: { type: Number, min: 1, max: 31, default: 10 },
  installments: { type: [AccountInstallmentSchema], default: [] },
  gross_minor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  concession_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  scheduled_concession_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  adjustment_minor: { type: Number, default: 0, validate: Number.isSafeInteger },
  paid_minor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE', index: true },
  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adjustments: { type: [AdjustmentSchema], default: [] },
}, { timestamps: true, collection: 'student_fee_accounts' });

module.exports = mongoose.model('StudentFeeAccount', StudentFeeAccountSchema);
