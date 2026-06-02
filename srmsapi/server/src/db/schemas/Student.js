const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    roll_number: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    class: String,
    section: String,
    gender: String,
    dob: Date,
    admission_number: String,
    father_name: String,
    mother_name: String,
    address: String,
    pincode: String,
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
    collection: 'students'
  }
);

module.exports = mongoose.model('Student', StudentSchema);
