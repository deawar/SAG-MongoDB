/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const os = require('os');
const User = require('../models/user');
const db = require('../models/index');

require('../config/passport')(passport);
const { checkAuthenticated } = require('../config/middleware/isAuthenticated');

const router = express.Router();

// Find School
function findSchoolName(req) {
  // eslint-disable-next-line prefer-destructuring
  let school;
  // school = res.req.user.school;
  if (req.user === null || req.user === undefined) {
    school = 'Make Art, Have Fun!';
    return school;
  }
  // eslint-disable-next-line prefer-destructuring
  school = req.user.school;
  return school;
}
// ROUTE TO GET USER DETAILS OF SIGNED IN USER
router.get('/profile', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated()) {
    // try {
    console.log('Profile_controller req: ', req.session.passport.user);
    console.log('Profile req.session: ', req.session);
    // eslint-disable-next-line no-underscore-dangle
    // const id = req.session.passport.user;
    console.log('req.user: ', req.user);
    console.log('req.user.active: ', req.user.active);
    const userInfo = {
      id: req.session.passport.user,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      address1: req.user.address1,
      address2: req.user.address2,
      city: req.user.city,
      state: req.user.state,
      zip: req.user.zip,
      email: req.user.email,
      phone: req.user.phone,
      school: req.user.school,
      role: req.user.role,
      active: req.user.active,
      isloggedin: req.isAuthenticated(),
    };
    // const { school } = userInfo;
    // if (userInfo.active === false) {
    //   res.render('verifytoken', userInfo);
    // }
    if (userInfo.role === 'student') {
      res.render('userProfilepage', userInfo);
    } else if (userInfo.role === 'admin') {
      res.render('adminProfilepage', userInfo);
    } else {
      res.render('bidderProfilepage', userInfo);
    }
  } else {
  // eslint-disable-next-line no-unused-vars
    const userInfo = {
      id: null,
      isloggedin: req.isAuthenticated(),
    };
    res.redirect('/');
  }
});

// ROUTER TO DELETE ACCOUNT
router.delete('/user/:account_id/:email', (req, res) => {
  try {
    console.log(`_id: ${req.params.account_id}`);
    console.log(`email: ${req.params.email}`);

    const filter = { _id: req.params.account_id, email: req.params.email };

    User.findOneAndDelete(filter, function (err, delDoc) {
      if (err) {
        console.log(err);
        res.status(404);
        return res.send('No User Deleted.');
      }
      console.log('Successfully Deleted: ', delDoc);
      res.status(200);
      res.json(delDoc);
      res.render('adminProfilepage/manageUser', delDoc);
    });
  } catch (error) {
    console.log('Catch ERROR: ', error);
    res.status(404);
    return res.send('No Profiles Deleted');
  }
});

// ROUTER TO UPDATE ACCOUNT
router.put('/user/:account_id', async (req, res) => {
  try {
    console.log('req.body: ', req.body);
    const updateDoc = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      school: req.body.school,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
    };
    const filter = { _id: req.params.account_id };
    const opts = { new: true };
    await User.findOneAndUpdate(filter, { $set: req.body }, opts, function (err, dbuser) {
      if (err) {
        console.log(err);
        res.status(404);
        return res.send('No User found to Update.');
      }
      console.log('Profile Updates going in:', updateDoc);
      res.status(200);
      res.json(updateDoc);
      res.render('adminProfilepage/#manageUser', updateDoc);
    });
  } catch (error) {
    console.log('Catch ERROR: ', error);
    res.status(404);
    return res.send('No Updates Performed');
  }
});

// PROFILE SEARCH BY ADMIN
function sendSearch(req, res, foundDoc) {
  router.get('/searchuser/:result', function(req, res) {
    return res.render('partials/manageUser', foundDoc);
  });
//   return res.render('adminProfilepage', foundDoc);
}
router.get('/searchuser/:email', async (req, res) => {
  try {
    console.log('profile_controller req.params.email: ', req.params.email);
    const searchEmail = req.params.email;
    // const query = User.find({ email: searchEmail }, { email: 1 });
    const school = findSchoolName(req);
    await User.findOne({ email: searchEmail, school }, function (err, doc) {
      if (!doc) {
        console.log('In Error branch - err: ', err);
        res.status(404);
        return res.send(`No User associated with ${searchEmail}!`);
      }
      console.log('---> doc: ', doc);
      const returnDoc = {
        searchedId: doc.id,
        searchedEmail: doc.email,
        searchedFirst_name: doc.first_name,
        searchedLast_name: doc.last_name,
        searchedAddress1: doc.address1,
        searchedAddress2: doc.address2,
        searchedCity: doc.city,
        searchedState: doc.state,
        searchedZip: doc.zip,
        searchedSchool: doc.school,
        searchedPhone: doc.phone,
        searchedRole: doc.role,
        searchedIsloggedin: req.isAuthenticated(),
      };
      console.log('2nd ---> returnDoc: ', returnDoc);
      res.status(200);
      res.json(returnDoc);
      sendSearch(req, res, returnDoc);
    });
    // .then((returnDoc) => {
    //   res.render('adminProfilepage', returnDoc).end();
    //   console.log(dbUser);
    //   if (!dbUser) {
    //     res.status(404);
    //     return res.send('No Email User Found');
    //   }
    //   console.log('---> dbUser: ', dbUser);
    //   const newSearch = {
    //     searchedUser: dbUser[0],
    //     id: dbUser[0].id,
    //     email: req.params.email,
    //     first_name: dbUser.first_name,
    //     role: dbUser[0].role,
    //     isloggedin: req.isAuthenticated(),
    //   };
    //   console.log('Profile_controller newSearch: ', newSearch);
    //   res.status(200);
    //   res.json(newSearch);
    //   // res.render('partials/manageUser', newSearch);
    // });
  } catch (error) {
    res.status(404);
    return res.send('No User Found');
  }
});

module.exports = router;
