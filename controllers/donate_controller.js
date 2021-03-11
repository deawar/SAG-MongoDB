const express = require('express');
const flash = require('express-flash-notification');

const { checkAuthenticated } = require('../config/middleware/isAuthenticated');

const router = express.Router();

// Import the model (index.js) to use its database functions.
// eslint-disable-next-line no-unused-vars
const sag = require('../models/user');

// Find school Fx
function findSchoolName(res) {
  if (res.req.user.school === null) {
    const school = { school: 'Make Art, Have Fun!' };
    return school;
  }
  // eslint-disable-next-line prefer-destructuring
  const school = res.req.user.school;
  return school;
}

// This is get route for login page
router.get('/donate', checkAuthenticated, (req, res) => {
  req.headers.logged = 'true';
  const school = findSchoolName(res);
  res.render('donationsPage', { title: 'Donations Page', school, logged: req.isAuthenticated() });
});

// Export routes for server.js to use.
module.exports = router;
