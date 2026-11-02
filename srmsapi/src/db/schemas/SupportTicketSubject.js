const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const SupportTicketSubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
      match: /^[a-z0-9_]+$/,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: tableNames.supportTicketSubjects,
  }
);

SupportTicketSubjectSchema.index({ is_active: 1, sort_order: 1, name: 1 });

module.exports = mongoose.model('SupportTicketSubject', SupportTicketSubjectSchema);