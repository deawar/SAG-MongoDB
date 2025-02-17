const express = require('express');

const router = express.Router();
const Auction = require('./models/auction');

router.post('/create-auction', async (req, res) => {
  try {
    const auctionData = req.body;
    const auction = new Auction(auctionData);
    await auction.save();
    res.redirect('/auctions'); // or render a success page
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating auction');
  }
});

module.exports = router;
