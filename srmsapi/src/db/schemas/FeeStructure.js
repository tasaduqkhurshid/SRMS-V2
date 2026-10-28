const mongoose = require('mongoose');

const InstallmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  due_date: { type: Date, required: true },
  amount_minor: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
}, { _id: false });

const LineSchema = new mongoose.Schema({
  fee_type_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'FeeType' },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  amount_minor: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  billing_period: { type: String, enum: ['MONTHLY', 'ANNUAL'], default: 'MONTHLY' },
  required: { type: Boolean, default: true },
}, { _id: false });

const FeeStructureSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School', index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  course_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course', index: true },
  academic_year_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'AcademicYear', index: true },
  due_day: { type: Number, min: 1, max: 31, default: 10 },
  monthly_model: { type: Boolean, default: false },
  lines: { type: [LineSchema], required: true, validate: (rows) => rows.length > 0 },
  installments: { type: [InstallmentSchema], default: [] },
  total_minor: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  active: { type: Boolean, default: true, index: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'fee_structures' });

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
