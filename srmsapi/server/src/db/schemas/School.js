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
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      immutable: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
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
    campus_image_url: String,
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

SchoolSchema.pre('validate', function (next) {
  if (!this.slug) {
    const source = this.school_code || this.school_name || this.name || '';
    this.slug = source
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (['admin', 'api', 'www', 'mail', 'smtp', 'cdn', 'assets'].includes(this.slug)) {
    return next(new Error('This school slug is reserved'));
  }
  next();
});

module.exports = mongoose.model('School', SchoolSchema);
