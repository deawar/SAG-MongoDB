/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
/* Requiring bcryptjs for password hashing */
const mongoose = require('mongoose');

// Get the Schema constructor
const { Schema } = mongoose;
// eslint-disable-next-line prefer-destructuring

// Creating our Role schema
const roleSchema = new Schema({
  unique_id: {
    type: Number,
    index: true,
  },
  role: {
    type: String,
    trim: true,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = (Role, roleSchema);
