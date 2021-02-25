/* eslint-disable camelcase */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const db = require('../models/index.js');
const User = require('../models/index.js');
const flash = require('express-flash-notification');

const { checkAuthenticated } = require('../config/middleware/isAuthenticated');

const router = express.Router();

// Find school Fx
function findSchoolName(res) {
  // eslint-disable-next-line prefer-destructuring
  let school;
  // school = res.req.user.school;
  if (res.req.user === null || res.req.user === undefined) {
    school = 'Make Art, Have Fun!';
    return school;
  }
  // eslint-disable-next-line prefer-destructuring
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

// This is get route for VERIFY
router.get('/verify:secretToken', (req, res) => {
  const school = findSchoolName(res);
  // eslint-disable-next-line prefer-destructuring
  const secretToken = req.params.secretToken;
  console.log('Line 42 dashboard_controller: secretToken: ', secretToken);
  // eslint-disable-next-line prefer-destructuring
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
//   console.log('Line 13 - In Get / route');
});

// This is get route for dashboard
router.get('/dashboard', (req, res) => {
  // console.log('Line 43 dashboard get with {{school}} res.req.user: ', res.req.user.school);
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  console.log('Line 72 req.user.first_name = first_name: ', req.user.first_name);
  res.render('dashboard', { title: 'Dashboard', school, first_name }); // : 'Make Art, Have Fun!' });
//   console.log('Line 13 - In Get / route');
});

router.get('/gallery', checkAuthenticated, (req, res) => { // eslint-disable-next-line prefer-destructuring
  let school = findSchoolName(res); // res.req.user.school;
  const first_name = findFirstName(res);
  console.log('res.req.user.school = school: ', school);
  res.render('artGallery', { title: 'Art Gallery', school, first_name });
//   console.log('Line 13 - In Get / route');
});

router.get('/privacypolicy', checkAuthenticated, (req, res) => {
  let school = findSchoolName(res); // res.req.user.school;
  const first_name = findFirstName(res);
  res.render('newPrivacyPolicy', { title: 'Privacy Policy', school, first_name });
//   console.log('Line 13 - In Get / route');
});

router.get('/about', checkAuthenticated, (req, res) => {
  let school = findSchoolName(res); // res.req.user.school;
  const first_name = findFirstName(res);
  res.render('about', { title: 'About', school, first_name });
//   console.log('Line 13 - In Get / route');
});

router.get('/', (req, res) => {
  console.log('Line 50 dashboard get with {{school}}: ', req.res.user);
  // let school = findSchoolName(res);
  const first_name = findFirstName(res);
  res.render('homePage', { title: 'Home', school: 'Make Art, Have Fun!', first_name });
//   console.log('Line 13 - In Get / route');
});

module.exports = router;
