import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import mongoose from 'mongoose';
import flash from 'express-flash-notification';
import Auction from '../models/auction.js';
import Artwork from '../models/artwork.js';
import db from '../models/index.js';
import User from '../models/index.js';
import { checkAuthenticated } from '../config/middleware/isAuthenticated.js';

const router = express.Router();

// Find school Fx
function findSchoolName(res) {
  let school;
  if (res.req.user === null || res.req.user === undefined) {
    school = 'Make Art, Have Fun!';
    return school;
  }
  school = res.req.user.school;
  return school;
}

function findFirstName(res) {
  let first_name;
  if (res.req.user === null || res.req.user === undefined) {
    first_name = 'Your';
    return first_name;
  }
  first_name = (res.req.user.first_name);
  first_name = (`${first_name}'s`);
  return first_name;
}

// Get Current User Role
function findRole(res) {
  let role;
  if (res.req.user === null || res.req.user === undefined) {
    role = '';
    return role;
  }
  role = res.req.user.role;
  return role;
}

// This is get route for VERIFY
router.get('/verify:secretToken', (req, res) => {
  const school = findSchoolName(res);
  const { secretToken } = req.params;
  console.log('Line 42 dashboard_controller: secretToken: ', secretToken);
  res.render('verifytoken', { title: 'Email Verification', school });
  const filter = secretToken;
  const update = { secretToken: '', active: true };
  db.User.findOne(filter, (err, user) => {
    if (user.local.secretToken === secretToken) {
      console.log('Tokens match- Verify this user.');
      User.findOneAndUpdate(filter, update, (err, resp) => {
        if (err) {
          throw err;
        } else {
          console.log('User has been verified in DB!', resp);
        }
      });
      res.redirect('/login');
    } else {
      console.log('secretToken did not match. Suer is rejected. Token should be: ', user.local.secretToken);
    }
  });
});

// This is get route for dashboard
router.get('/dashboard', checkAuthenticated, (req, res) => {
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  const role = findRole(res);
  console.log('Line 72 req.user.first_name = first_name: ', req.user.first_name);
  res.render('dashboard', {
    title: 'Dashboard',
    school,
    first_name,
    role,
  });
});

router.get('/gallery', checkAuthenticated, (req, res) => {
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  const role = findRole(res);
  console.log('res.req.user.school = school: ', school);
  res.render('artGallery', {
    title: 'Art Gallery',
    school,
    first_name,
    role,
  });
});

router.get('/bid', checkAuthenticated, (req, res) => {
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  const role = findRole(res);
  console.log('res.req.user.school = school: ', school);
  res.render('bid', {
    title: 'Auction Page',
    school,
    first_name,
    role,
  });
});

router.get('/privacypolicy', checkAuthenticated, (req, res) => {
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  res.render('newPrivacyPolicy', { title: 'Privacy Policy', school, first_name });
});

router.get('/about', checkAuthenticated, (req, res) => {
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  res.render('about', { title: 'About', school, first_name });
});

router.get('/', (req, res) => {
  console.log('Line 50 dashboard get with {{school}}: ', req.res.user);
  const first_name = findFirstName(res);
  res.render('homePage', { title: 'Home', school: 'Make Art, Have Fun!', first_name });
});

// Get Route to retrieve all artworks from the database
router.get('/artworks', async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { artistId, auctionId, limit = 50 } = req.query;

    // Build query object
    const query = {};
    if (artistId) query.artistId = artistId;
    if (auctionId) query.auctionId = auctionId;

    // Query the database, sort by newest first, limit results
    const artworks = await Artwork.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    // Map to include only necessary fields
    const mappedArtworks = artworks.map((artwork) => ({
      _id: artwork._id,
      title: artwork.art_name_input,
      description: artwork.description_input || '',
      artist_firstname: artwork.artist_firstname || 'Unknown Artist',
      artist_lastname: artwork.artist_lastname || '',
      artistId: artwork.artistId,
      auctionId: artwork.auctionId,
      imageUrl: artwork.img.data,
      startingBid: artwork.startingBid,
      currentBid: artwork.currentBid,
      createdAt: artwork.createdAt,
    }));

    return res.json({
      success: true,
      count: mappedArtworks.length,
      artworks: mappedArtworks,
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching artwork data',
    });
  }
});

/**
 * GET /api/artworks/:id
 * Retrieves a specific artwork by ID
 */
router.get('/artworks/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    return res.json({
      success: true,
      artwork,
    });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching artwork data',
    });
  }
});

export default router;
