const express = require('express');
const flash = require('express-flash-notification');

const { checkAuthenticated } = require('../config/middleware/isAuthenticated');

const router = express.Router();

// Find school Fx
function findSchoolName(res) {
  // eslint-disable-next-line prefer-destructuring
  let school = res.req.user.school;
  if (school === null || school === undefined) {
    school = 'Make Art, Have Fun!';
    return school;
  }
  // eslint-disable-next-line prefer-destructuring
  school = res.req.user.school;
  return school;
}

// This is get route for VERIFY
router.get('/verify', (req, res) => {
  const school = findSchoolName(res);
  console.log('res.req.user.school = school: ', res.req.user.school);
  res.render('verifytoken', { title: 'Email Verification', school });
//   console.log('Line 13 - In Get / route');
});

// This is get route for dashboard
router.get('/dashboard', (req, res) => {
  // console.log('Line 28 dashboard get with {{school}} res.req.user: ', res.req.user.school);
  let school = findSchoolName(res);
  // console.log('res.req.user.school = school: ', school);
  res.render('dashboard', { title: 'Dashboard', school }); // : 'Make Art, Have Fun!' });
//   console.log('Line 13 - In Get / route');
});

router.get('/gallery', checkAuthenticated, (req, res) => {  // eslint-disable-next-line prefer-destructuring
  let school = findSchoolName(res); // res.req.user.school;
  console.log('res.req.user.school = school: ', school);
  res.render('artGallery', { title: 'Art Gallery', school });
//   console.log('Line 13 - In Get / route');
});

router.get('/privacypolicy', checkAuthenticated, (req, res) => {
  let school = findSchoolName(res); // res.req.user.school;
  res.render('newPrivacyPolicy', { title: 'Privacy Policy', school });
//   console.log('Line 13 - In Get / route');
});

router.get('/about', checkAuthenticated, (req, res) => {
  let school = findSchoolName(res); // res.req.user.school;
  res.render('about', { title: 'About', school });
//   console.log('Line 13 - In Get / route');
});

router.get('/', (req, res) => {
  console.log('Line 50 dashboard get with {{school}}: ', req.res.user);
  //let school = findSchoolName(res);
  res.render('homePage', { title: 'Home', school: 'Make Art, Have Fun!' });
//   console.log('Line 13 - In Get / route');
});

module.exports = router;
