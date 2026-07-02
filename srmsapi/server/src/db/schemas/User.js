const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true
    },
    email: String,
    password: String,
    pin: String,
    role: String,
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School'
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

module.exports = mongoose.model('User', UserSchema);
