const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const SupportTicketStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '#6B7280',
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    is_terminal: {
      type: Boolean,
      default: false,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    is_system: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: tableNames.supportTicketStatuses,
  }
);

SupportTicketStatusSchema.index({ is_active: 1, sort_order: 1, name: 1 });

module.exports = mongoose.model('SupportTicketStatus', SupportTicketStatusSchema);