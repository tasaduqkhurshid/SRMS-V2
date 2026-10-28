const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const ResultSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School',
      index: true
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student'
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Subject'
    },
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Exam'
    },
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'AcademicYear'
    },
    theory_marks: Number,
    lab_marks: Number,
    attendance_marks: Number,
    activity_marks: Number,
    total_marks: Number
  },
  {
    timestamps: true,
    collection: tableNames.results
  }
);

// Create a unique compound index
ResultSchema.index(
  { student_id: 1, subject_id: 1, exam_id: 1, academic_year_id: 1 },
  { unique: true, name: 'unique_student_subject_exam_year' }
);

module.exports = mongoose.model('Result', ResultSchema);
