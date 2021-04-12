/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
/* Requiring bcryptjs for password hashing */
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const uniqueValidator = require('mongoose-unique-validator');
// Get the Schema constructor
const { Schema } = mongoose;
// eslint-disable-next-line prefer-destructuring

// Creating our School Schema
const schoolSchema = new Schema({
  updated: { type: Date, default: Date.now },
<<<<<<< HEAD
  SchoolName: {
    type: [String],
    text: true,
=======
  unique_id: { type: Number, index: true },
  schoolName: {
    type: String,
>>>>>>> 4279c328447873f4f73dcf12d98fd1ac51127ddf
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: '{VALUE} is not a valid phone number!',
    },
    required: [true, 'User phone number required'],
  },
  address: {
    type: String,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    required: true,
  },
  county: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
    min: 2,
  },
  zip: {
    type: String,
    trim: true,
    required: true,
    min: 5,
  },
});

const School = mongoose.model('School', schoolSchema);
<<<<<<< HEAD
const schoolname = new School({ type: 'schoolname' });
=======
>>>>>>> 4279c328447873f4f73dcf12d98fd1ac51127ddf

module.exports = (School, schoolSchema);
