const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const SupportTicketCounterSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: tableNames.supportTicketCounters,
  }
);

module.exports = mongoose.model('SupportTicketCounter', SupportTicketCounterSchema);