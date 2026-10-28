const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const ExamSchema = new mongoose.Schema(
  {
    exam_name: {
      type: String,
      required: true
    },
    max_marks: {
      type: Number,
      default: 100
    },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    },
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear'
    }
  },
  {
    timestamps: true,
    collection: tableNames.exams
  }
);

module.exports = mongoose.model('Exam', ExamSchema);
