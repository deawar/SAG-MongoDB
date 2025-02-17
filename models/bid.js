import mongoose from 'mongoose';

// Get the Schema constructor
const { Schema } = mongoose;

// Creating our School Schema
const bidSchema = new Schema({
  updated: { type: Date, default: Date.now },
  unique_bid_id: {
    type: Number,
    index: true,
  },
  startBid: {
    type: Number,
  },
  bids: {
    type: Number,
  },
  schoolName: {
    type: String,
    trim: true,
    required: true,
  },
  status: {
    type: String,
  },
  artwork_unique_id: {
    type: mongoose.ObjectId,
    ref: 'artwork',
  },
});

// Getter for Currency adjustment
bidSchema.path('bids').get((num) => (num / 100).toFixed(2));
bidSchema.path('startBid').get((num) => (num / 100).toFixed(2));

// Setter for Currency adjustment
bidSchema.path('bids').set((num) => (num * 100));
bidSchema.path('startBid').set((num) => (num * 100));

const Bid = mongoose.model('Bid', bidSchema);
const bid = new Bid({ type: 'bid ' });

export default mongoose.model('bid', bidSchema);
