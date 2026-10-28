const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const StudentSubjectSchema = new mongoose.Schema(
  {
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
    collection: tableNames.studentSubjects
  }
);

module.exports = mongoose.model('StudentSubject', StudentSubjectSchema);
