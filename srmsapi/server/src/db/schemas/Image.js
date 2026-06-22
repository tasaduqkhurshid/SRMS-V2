const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    entity: {
      type: String,
      required: true
    }, // 'SCHOOL' | 'STUDENT'
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }, // linked record id
    entity_type: {
      type: String,
      required: true
    }, // 'LOGO' | 'PROFILE'
    image_data: {
      type: Buffer,
      required: true
    },
    file_name: String,
    mime_type: String
  },
  {
    timestamps: true,
    collection: 'images'
  }
);

module.exports = mongoose.model('Image', ImageSchema);
