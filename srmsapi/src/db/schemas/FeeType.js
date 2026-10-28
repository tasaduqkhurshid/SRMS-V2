const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const FeeTypeSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School', index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  code: { type: String, required: true, trim: true, uppercase: true, maxlength: 32 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true, collection: tableNames.feeTypes });

module.exports = mongoose.model('FeeType', FeeTypeSchema);
