import express from 'express';
import mongoose from 'mongoose';
import Auction from '../models/auction.js';

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
const validateAuctionData = (req, res, next) => {
  const errors = [];
  const {
    auctionId, charityName, dateAuctionStart, timeAuctionStart,
    dateAuctionStop, timeAuctionStop, organizer,
  } = req.body;

  // Required field checks
  if (!auctionId) errors.push('Auction ID is required');
  if (!charityName) errors.push('Charity name is required');
  if (!dateAuctionStart) errors.push('Start date is required');
  if (!timeAuctionStart) errors.push('Start time is required');
  if (!dateAuctionStop) errors.push('End date is required');
  if (!timeAuctionStop) errors.push('End time is required');
  if (!organizer) errors.push('Organizer ID is required');

  // Date validation
  const startDate = new Date(`${dateAuctionStart}T${timeAuctionStart}`);
  const endDate = new Date(`${dateAuctionStop}T${timeAuctionStop}`);

  if (isNaN(startDate.getTime())) errors.push('Invalid start date/time');
  if (isNaN(endDate.getTime())) errors.push('Invalid end date/time');
  if (startDate >= endDate) errors.push('End date must be after start date');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

router.post('/api/create-auction', validateAuctionData, async (req, res) => {
  try {
    // Sanitize all inputs
    const sanitizedData = {
      auctionId: sanitize.string(req.body.auctionId, 50),
      charityName: sanitize.string(req.body.charityName, 100),
      dateAuctionStart: sanitize.date(req.body.dateAuctionStart),
      timeAuctionStart: sanitize.time(req.body.timeAuctionStart),
      dateAuctionStop: sanitize.date(req.body.dateAuctionStop),
      timeAuctionStop: sanitize.time(req.body.timeAuctionStop),
      organizer: sanitize.mongoId(req.body.organizer),
      auctionType: 'online',
    };

    // Additional validation after sanitization
    if (!sanitizedData.dateAuctionStart || !sanitizedData.dateAuctionStop) {
      throw new Error('Invalid date format');
    }

    // Create new auction with sanitized data
    const auction = new Auction(sanitizedData);

    // Save to database
    await auction.save();

    res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      data: auction,
    });
  } catch (error) {
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

export default router;
