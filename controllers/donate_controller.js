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

// Find First Name
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
  // eslint-disable-next-line prefer-destructuring
  let role;
  // school = res.req.user.school;
  if (res.req.user === null || res.req.user === undefined) {
    role = '';
    return role;
  }
  // eslint-disable-next-line prefer-destructuring
  role = res.req.user.role;
  return role;
}

// This is get route for login page
router.get('/donate', checkAuthenticated, (req, res) => {
  req.headers.logged = 'true';
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  const role = findRole(res);
  res.render('donationsPage', {
    title: 'Donations Page',
    school,
    first_name,
    role,
    logged: req.isAuthenticated(),
  });
});

// Export routes for server.js to use.
module.exports = router;
