import express from 'express';
import mongoose from 'mongoose';
import Bid from '../models/bid.js';
import { checkAuthenticated } from '../config/middleware/isAuthenticated.js';

const router = express.Router();

// Server-side sanitization utilities
const sanitize = {
  // Basic HTML escape function
  escapeHTML: (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;'),

  string: (str, maxLength = 100) => {
    if (typeof str !== 'string') return '';
    // Trim, limit length, escape HTML, and remove any remaining dangerous characters
    return sanitize.escapeHTML(str.trim())
      .slice(0, maxLength)
      .replace(/[^\w\s-,.]/gi, ''); // Only allow letters, numbers, spaces, and basic punctuation
  },

  date: (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  },

  time: (timeStr) => {
    if (typeof timeStr !== 'string') return '';
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr) ? timeStr : '';
  },

  mongoId: (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return id;
  },
};

// Validation middleware
const validateBidData = (req, res, next) => {
  const errors = [];
  const {
    auctionId, bidderId, amount,
  } = req.body;

  // Required field checks
  if (!auctionId) errors.push('Auction ID is required');
  if (!bidderId) errors.push('Bidder ID is required');
  if (!amount) errors.push('Amount is required');

  // Data type checks
  if (typeof auctionId !== 'string') errors.push('Auction ID must be a string');
  if (typeof bidderId !== 'string') errors.push('Bidder ID must be a string');
  if (typeof amount !== 'string') errors.push('Amount must be a string');

  // Sanitize data
  req.body.auctionId = sanitize.mongoId(auctionId);
  req.body.bidderId = sanitize.mongoId(bidderId);
  req.body.amount = sanitize.string(amount);

  // Return errors or proceed to next middleware
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  return next();
};

// ROUTE TO CREATE A NEW BID
router.post('/api/create-bid', checkAuthenticated, validateBidData, (req, res) => {
  console.log('Received bid data:', req.body);
  try {
    // Sanitize all data
    const {
      auctionId, bidderId, amount,
    } = req.body;

    const newBid = new Bid({
      auctionId,
      bidderId,
      amount,
    });

    newBid.save()
      .then((savedBid) => {
        res.status(201).json(savedBid);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  } catch (err) {
    console.error('Error creating auction:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An auction with this ID already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating auction',
    });
  }
});

// ROUTE TO GET ALL BIDS FOR A SPECIFIC AUCTION
router.get('/api/bids/:auctionId', checkAuthenticated, (req, res) => {
  const { auctionId } = req.params;

  bid.find({ auctionId })
    .then((bids) => {
      res.status(200).json(bids);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// ROUTE TO GET ALL BIDS FOR A SPECIFIC BIDDER
router.get('/api/bids/bidder/:bidderId', checkAuthenticated, (req, res) => {
  const { bidderId } = req.params;

  bid.find({ bidderId })
    .then((bids) => {
      res.status(200).json(bids);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// ROUTE TO GET ALL BIDS
router.get('/api/bids', checkAuthenticated, (req, res) => {
  bid.find()
    .then((bids) => {
      res.status(200).json(bids);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// ROUTE TO UPDATE A BID
router.put('/api/update-bid/:bidId', checkAuthenticated, (req, res) => {
  const { bidId } = req.params;

  bid.findByIdAndUpdate(
    bidId,
    req.body,
    { new: true },
  )
    .then((updatedBid) => {
      res.status(200).json(updatedBid);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// ROUTE TO DELETE A BID
router.delete('/api/delete-bid/:bidId', checkAuthenticated, (req, res) => {
  const { bidId } = req.params;

  bid.findByIdAndDelete(bidId)
    .then((deletedBid) => {
      res.status(200).json(deletedBid);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

export default router;
