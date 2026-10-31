const mongoose = require('mongoose');
const tableNames = require("../tableNames");

const CourseSchema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true
    },
    course_code: String,
    description: String,
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School'
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ]
  },
  {
    timestamps: true,
    collection: tableNames.courses
  }
);

// Virtual for CourseSubject relationship
CourseSchema.virtual('courseSubjects', {
  ref: 'CourseSubject',
  localField: '_id',
  foreignField: 'course_id',
  justOne: false
});

module.exports = mongoose.model('Course', CourseSchema);
