/* eslint-disable camelcase */
const express = require('express');
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
router.get('/verify', (req, res) => {
  const school = findSchoolName(res);
  console.log('res.req.user.school = school: ', res.req.user);
  res.render('verifytoken', { title: 'Email Verification', school });
//   console.log('Line 13 - In Get / route');
});

// This is get route for dashboard
router.get('/dashboard', (req, res) => {
  // console.log('Line 43 dashboard get with {{school}} res.req.user: ', res.req.user.school);
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  console.log('Line 45 res.req.user.first_name = first_name: ', req.user);
  res.render('dashboard', { title: 'Dashboard', school, first_name }); // : 'Make Art, Have Fun!' });
//   console.log('Line 13 - In Get / route');
});

router.get('/gallery', checkAuthenticated, (req, res) => {  // eslint-disable-next-line prefer-destructuring
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
  //let school = findSchoolName(res);
  const first_name = findFirstName(res);
  res.render('homePage', { title: 'Home', school: 'Make Art, Have Fun!', first_name });
//   console.log('Line 13 - In Get / route');
});

module.exports = router;
