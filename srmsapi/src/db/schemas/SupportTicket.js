const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const SupportTicketSchema = new mongoose.Schema(
  {
    ticket_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicketSubject',
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicketService',
      default: null,
    },
    module: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
    },
    status_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicketStatus',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    created_by: {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      role: {
        type: String,
        required: true,
        trim: true,
      },
      portal: {
        type: String,
        enum: ['school', 'admin'],
        required: true,
      },
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    last_reply_at: {
      type: Date,
      default: null,
    },
    last_reply_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: tableNames.supportTickets,
  }
);

SupportTicketSchema.index({ school_id: 1, created_at: -1 });
SupportTicketSchema.index({ school_id: 1, status_id: 1 });
SupportTicketSchema.index({ subject_id: 1 });
SupportTicketSchema.index({ service_id: 1 });
SupportTicketSchema.index({ status_id: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ updated_at: -1 });
SupportTicketSchema.index({ school_id: 1, updated_at: -1 });
SupportTicketSchema.index({ assigned_to: 1 });
SupportTicketSchema.index({ last_reply_at: -1 });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);