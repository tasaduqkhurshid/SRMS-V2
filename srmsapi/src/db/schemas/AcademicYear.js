const mongoose = require('mongoose');

const AcademicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    start_date: Date,
    end_date: Date,
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    }
  },
  {
    timestamps: true,
    collection: 'academic_years'
  }
);

module.exports = mongoose.model('AcademicYear', AcademicYearSchema);
