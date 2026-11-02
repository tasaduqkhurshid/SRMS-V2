const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const AttachmentSchema = new mongoose.Schema(
  {
    file_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    file_url: {
      type: String,
      required: true,
      trim: true,
    },
    file_key: {
      type: String,
      required: true,
      trim: true,
    },
    mime_type: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const SupportTicketMessageSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicket',
      required: true,
      index: true,
    },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender_name: {
      type: String,
      required: true,
      trim: true,
    },
    sender_role: {
      type: String,
      required: true,
      trim: true,
    },
    sender_portal: {
      type: String,
      enum: ['school', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    message_type: {
      type: String,
      enum: ['reply', 'internal_note', 'system_activity'],
      default: 'reply',
      index: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: tableNames.supportTicketMessages,
  }
);

SupportTicketMessageSchema.index({ ticket_id: 1, created_at: 1 });
SupportTicketMessageSchema.index({ school_id: 1, ticket_id: 1 });
SupportTicketMessageSchema.index({ ticket_id: 1, message_type: 1 });

module.exports = mongoose.model('SupportTicketMessage', SupportTicketMessageSchema);