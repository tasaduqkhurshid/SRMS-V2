const mongoose = require('mongoose');
const tableNames = require("../tableNames");

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
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null
    },
    linked_student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School'
    }
  },
  {
    timestamps: true,
    collection: tableNames.users
  }
);

module.exports = mongoose.model('User', UserSchema);
