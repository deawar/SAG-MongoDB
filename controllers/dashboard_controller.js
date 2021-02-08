const express = require('express');

const { checkAuthenticated } = require('../config/middleware/isAuthenticated');

const router = express.Router();

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

// This is get route for VERIFY
router.get('/verify', (req, res) => {
  const school = findSchoolName(req);
  // console.log('res.req.user.school = school: ', school);
  res.render('verifytoken', { title: 'Email Verifcation', school });
//   console.log('Line 13 - In Get / route');
});

// This is get route for dashboard
router.get('/dashboard', (req, res) => {
  //const school = findSchoolName(req);
  console.log('dashboard get with {{school}}: ', req.res.user);
  // console.log('res.req.user.school = school: ', school);
  res.render('dashboard', { title: 'Dashboard', school: 'Make Art, Have Fun!' });
//   console.log('Line 13 - In Get / route');
});

router.get('/gallery', checkAuthenticated, (req, res) => {
  // eslint-disable-next-line prefer-destructuring
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

router.get('/', (req, res) => {
  let school = findSchoolName(res);
  res.render('homePage', { title: 'Home', school });
//   console.log('Line 13 - In Get / route');
});

module.exports = router;
