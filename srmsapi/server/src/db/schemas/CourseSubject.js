const mongoose = require('mongoose');

const CourseSubjectSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course'
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Subject'
    },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School'
    }
  },
  {
    timestamps: true,
    collection: 'course_subjects'
  }
);

module.exports = mongoose.model('CourseSubject', CourseSubjectSchema);
