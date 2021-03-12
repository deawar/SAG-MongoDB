/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
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
  approved: {
    type: Boolean,
  },
  artist_email_input: {
    type: String,
    trim: true,
    lowercase: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  art_name_input: {
    type: String,
    trim: true,
    required: true,
  },
  medium_input: {
    type: String,
    trim: true,
  },
  description_input: {
    type: String,
    trim: true,
  },
  depth: {
    type: Number,
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
  school: {
    type: String,
    trim: true,
    required: true,
  },
  img: {
    data: Buffer,
    contentType: String,
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
const artwork = new Artwork({ type: 'artwork' });
module.exports.getArtByEmail = function (email, callback) {
  const query = { email };
  Artwork.findOne(query, callback);
};

module.exports.getArtworkById = function (id, callback) {
  Artwork.findById(id, callback);
};

module.exports.getArtworkBySchool = function (id, callback) {
  Artwork.findById(id, callback);
};

artworkSchema.plugin(uniqueValidator, {
  message: 'Sorry, {PATH} needs to be unique',
});

module.exports = mongoose.model('artwork', artworkSchema);
