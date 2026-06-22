const mongoose = require('mongoose');

const MarksheetTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    }, // e.g., "Professional", "Simple", "Detailed"
    html_content: {
      type: String,
      required: true
    }, // HTML template with placeholders like {{student_name}}, {{marks}}, etc.
    is_active: {
      type: Boolean,
      default: true
    },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    }
  },
  {
    timestamps: true,
    collection: 'marksheet_templates'
  }
);

module.exports = mongoose.model('MarksheetTemplate', MarksheetTemplateSchema);
