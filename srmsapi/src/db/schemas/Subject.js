const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const SubjectSchema = new mongoose.Schema(
  {
    subject_name: {
      type: String,
      required: true
    },
    subject_code: String,
    has_theory: {
      type: Boolean,
      default: true
    },
    has_lab: {
      type: Boolean,
      default: false
    },
    has_attendance: {
      type: Boolean,
      default: false
    },
    has_activity: {
      type: Boolean,
      default: false
    },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    }
  },
  {
    timestamps: true,
    collection: tableNames.subjects
  }
);

module.exports = mongoose.model('Subject', SubjectSchema);
