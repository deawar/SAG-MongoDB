/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
/* Requiring bcryptjs for password hashing */
const mongoose = require('mongoose');

// Get the Schema constructor
const { Schema } = mongoose;

// Creating our School Schema
const bidSchema = new Schema({
  updated: { type: Date, default: Date.now },
  unique_bid_id: {
    type: Number,
    index: true,
  },
  first_name: {
    type: String,
    trim: true,
    required: true,
  },
  last_name: {
    type: String,
    trim: true,
    required: true,
  },
  schoolName: {
    type: String,
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
  artwork_unique_id: {
    type: mongoose.ObjectId,
    ref: 'artwork',
  },
});

// https://stackoverflow.com/questions/13304129/how-should-i-store-a-price-in-mongoose to store price in Mongoose
// Getter
bidSchema.path('price').get((num) => (num / 100).toFixed(2));

// Setter
bidSchema.path('price').set((num) => num * 100);

const Bid = mongoose.model('Bid', bidSchema);

module.exports = (Bid, bidSchema);
