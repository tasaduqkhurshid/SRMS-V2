const mongoose = require('mongoose');
const tableNames = require("../tableNames");

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
    collection: tableNames.courseSubjects
  }
);

// Virtual for Subject relationship
CourseSubjectSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subject_id',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('CourseSubject', CourseSubjectSchema);
