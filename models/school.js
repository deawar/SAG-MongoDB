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
  SchoolName: {
    type: [String], 
    text: true,
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
    required: [false, 'User phone number required'],
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
  },
  county: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
    min: 2,
  },
  zip: {
    type: String,
    trim: true,
    min: 5,
  },
  CollegeBoardID: {
    type: Number,
  },
});

const School = mongoose.model('School', schoolSchema);
const schoolname = new School({type: 'schoolname'});

// module.exports.findSchoolName = function (SchoolName, callback) {
//   const query = { SchoolName };
//   School.find(query, callback);
// };
module.exports = School;
