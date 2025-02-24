import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Auction schema definition.
 */
const auctionSchema = new Schema({
  auctionId: {
    type: String,
    required: true,
    unique: true,
  },
  charityName: {
    type: String,
    required: true,
  },
  dateAuctionStart: {
    type: Date,
    required: true,
  },
  timeAuctionStart: {
    type: String, // HH:mm format
    required: true,
  },
  dateAuctionStop: {
    type: Date,
    required: true,
  },
  timeAuctionStop: {
    type: String, // HH:mm format
    required: true,
  },
  auctionTotalTime: {
    type: Number, // in hours
    default: null,
  },
  // Additional suggested fields:
  auctionType: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online',
  },
  location: { // Location like the Address of the auction
    type: String,
    default: 'any',
  },
  organizer: { // ID of the user who created the auction
    type: String,
  },
  description: {
    type: String,
  },
  items: [{ // Array of auction items (if needed)
    type: { type: Schema.Types.ObjectId, ref: 'AuctionItem' },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to calculate auctionTotalTime
auctionSchema.pre('save', function (next) {
  const startTime = new Date(`${this.dateAuctionStart.toISOString().split('T')[0]} ${this.timeAuctionStart}`);
  const stopTime = new Date(`${this.dateAuctionStop.toISOString().split('T')[0]} ${this.timeAuctionStop}`);
  this.auctionTotalTime = (stopTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // in hours
  next();
});

const Auction = mongoose.model('Auction', auctionSchema);

export default Auction;
