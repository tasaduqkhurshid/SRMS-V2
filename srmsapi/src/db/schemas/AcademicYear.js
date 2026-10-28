const mongoose = require('mongoose');
const tableNames = require("../tableNames");

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
    collection: tableNames.academicYears
  }
);

module.exports = mongoose.model('AcademicYear', AcademicYearSchema);
