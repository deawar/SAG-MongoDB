/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// Get the Schema constructor
const { Schema } = mongoose;

// Email Validator fx
const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const artworkSchema = new Schema({
  updated: { type: Date, default: Date.now },
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
  currentbid: {
    type: Number,
  },
  lastbid: {
    type: Number,
  },
});

// Apply the uniqueValidator plugin to userDataSchema.
artworkSchema.plugin(uniqueValidator, {
  message: 'Sorry, {PATH} needs to be valid.',
});

// Getter for Currency adjustment
artworkSchema.path('price').get((num) => (num / 100).toFixed(2));

// Setter for Currency adjustment
artworkSchema.path('price').get((num) => (num * 100));

const Artwork = mongoose.model('Artwork', artworkSchema);

export function getArtByEmail(email, callback) {
  const query = { email };
  Artwork.findOne(query, callback);
}

export function getArtworkById(id, callback) {
  Artwork.findById(id, callback);
}

export function getArtworkBySchool(id, callback) {
  Artwork.findById(id, callback);
}

artworkSchema.plugin(uniqueValidator, {
  message: 'Sorry, {PATH} needs to be unique',
});

export default mongoose.model('artwork', artworkSchema);
