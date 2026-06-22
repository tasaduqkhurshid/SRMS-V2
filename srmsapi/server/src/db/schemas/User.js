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
    school_id: mongoose.Schema.Types.ObjectId
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

module.exports = mongoose.model('User', UserSchema);
