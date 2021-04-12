/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
/* Requiring bcryptjs for password hashing */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
// Get the Schema constructor
const { Schema } = mongoose;
// Email Validator fx
const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// eslint-disable-next-line prefer-destructuring
const artworkSchema = new Schema({
  updated: { type: Date, default: Date.now },
<<<<<<< HEAD
  approved: {
    type: Boolean, default: false,
  },
  artist_firstname_input: {
    type: String,
    trim: true,
    required: true,
  },
  artist_lastname_input: {
    type: String,
    trim: true,
    required: true,
=======
  artwork_unique_id: {
    type: Number,
    index: true,
>>>>>>> 4279c328447873f4f73dcf12d98fd1ac51127ddf
  },
  artist_email: {
    type: String,
    trim: true,
    lowercase: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  art_name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  height: {
    type: Number,
    trim: true,
  },
  width: {
    type: Number,
    trim: true,
  },
  price: {
    type: Number,
  },
  picture_link: {
    type: String,
    required: 'Photo of artwork is required.',
  },
});

// Apply the uniqueValidator plugin to userDataSchema.
artworkSchema.plugin(uniqueValidator, {
  // eslint-disable-next-line comma-dangle
  message: 'Sorry, {PATH} needs to be valid.'
});

// Getter for Currency adjustment
artworkSchema.path('price').get((num) => (num / 100).toFixed(2));

// Setter for Currency adjustment
artworkSchema.path('price').get((num) => (num * 100));

const Artwork = mongoose.model('Artwork', artworkSchema);

module.exports = (Artwork, artworkSchema);
