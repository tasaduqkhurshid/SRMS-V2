const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    school_name: {
      type: String,
      required: true
    },
    name: String, // alias for school_name
    school_code: {
      type: String,
      unique: true,
      sparse: true
    },
    abbreviation: String,
    email: String,
    phone: String,
    contact_number: String, // alias for phone
    address: String,
    city: String,
    state: String,
    pincode: String,
    logo_path: String,
    logo_url: String,
    website: String,
    principal_name: String,
    principal_email: String,
    year_established: Number,
    board: String
  },
  {
    timestamps: true,
    collection: 'schools'
  }
);

module.exports = mongoose.model('School', SchoolSchema);
