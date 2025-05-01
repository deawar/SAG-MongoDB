import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const { Schema } = mongoose;

// Email Validator function
const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const artworkSchema = new Schema({
  updated: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  artist_firstname_input: {
    type: String,
    trim: true,
    required: 'First name is required',
  },
  artist_lastname_input: {
    type: String,
    trim: true,
    required: 'Last name is required',
  },
  artist_email_input: {
    type: String,
    trim: true,
    lowercase: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  artistId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  auctionId: {
    type: Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  art_name_input: {
    type: String,
    trim: true,
    required: 'Artwork name is required',
  },
  medium_input: {
    type: String,
    trim: true,
    required: 'Medium is required',
  },
  description_input: {
    type: String,
    trim: true,
    required: 'Description is required',
  },
  depth: {
    type: Number,
    trim: true,
    get: (v) => (v ? v.toFixed(2) : null),
  },
  height: {
    type: Number,
    trim: true,
    required: 'Height is required',
    get: (v) => v.toFixed(2),
  },
  width: {
    type: Number,
    trim: true,
    required: 'Width is required',
    get: (v) => v.toFixed(2),
  },
  price: {
    type: Number,
    required: 'Price is required',
    get: (v) => (v / 100).toFixed(2),
    set: (v) => v * 100,
  },
  school: {
    type: String,
    trim: true,
    required: 'School is required',
  },
  img: {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
  },
  startingBid: {
    type: Number,
    get: (v) => (v ? (v / 100).toFixed(2) : null),
    set: (v) => (v ? v * 100 : null),
    default: 0,
  },
  currentbid: {
    type: Number,
    get: (v) => (v ? (v / 100).toFixed(2) : null),
    set: (v) => (v ? v * 100 : null),
  },
  lastbid: {
    type: Number,
    get: (v) => (v ? (v / 100).toFixed(2) : null),
    set: (v) => (v ? v * 100 : null),
  },
  bids: [{
    bidder: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'sold', 'unsold'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { getters: true }, // Ensure getters are applied when converting to JSON
  toObject: { getters: true }, // Ensure getters are applied when converting to Object
});

// Apply the uniqueValidator plugin once
artworkSchema.plugin(uniqueValidator, {
  message: 'Sorry, {PATH} needs to be unique',
});

// Define static methods
artworkSchema.statics.getArtByEmail = function (email) {
  return this.findOne({ artist_email_input: email });
};

artworkSchema.statics.getArtworkById = function (id) {
  return this.findById(id);
};

artworkSchema.statics.getArtworkBySchool = function (school) {
  return this.find({ school });
};

// Update the updatedAt field on save
artworkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the model
const Artwork = mongoose.model('Artwork', artworkSchema);
export default Artwork;
