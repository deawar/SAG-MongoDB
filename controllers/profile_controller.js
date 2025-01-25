/* eslint-disable camelcase */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import os from 'os';
import User from '../models/user.js';
import db from '../models/index.js';
import passportConfig from '../config/passport.js';
import { checkAuthenticated } from '../config/middleware/isAuthenticated.js';

passportConfig(passport);

const router = express.Router();

// Find First Name and add 's
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

// Find School
function findSchoolName(req) {
  let school;
  if (req.user === null || req.user === undefined) {
    school = 'Make Art, Have Fun!';
    return school;
  }
  school = req.user.school;
  return school;
}

// ROUTE TO GET USER DETAILS OF SIGNED IN USER
router.get('/profile', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated()) {
    console.log('Profile_controller req: ', req.session.passport.user);
    console.log('Profile req.session: ', req.session);
    const school = findSchoolName(req);
    const first_name = findFirstName(res);
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
    if (userInfo.role === 'student') {
      res.render('userProfilepage', userInfo);
    } else if (userInfo.role === 'admin') {
      res.render('adminProfilepage', userInfo);
    } else {
      res.render('bidderProfilepage', userInfo);
    }
  } else {
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
      res.render('adminProfilepage', delDoc);
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
      res.render('adminProfilepage', updateDoc);
    });
  } catch (error) {
    console.log('Catch ERROR: ', error);
    res.status(404);
    return res.send('No Updates Performed');
  }
});

// PROFILE SEARCH BY ADMIN
function sendSearch(req, res, foundDoc) {
  router.get('/searchuser/:result', function (req, res) {
    return res.render('partials/manageUser', foundDoc);
  });
}

router.get('/searchuser/:email', async (req, res) => {
  try {
    console.log('profile_controller req.params.email: ', req.params.email);
    const searchEmail = req.params.email;
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
  } catch (error) {
    res.status(404);
    return res.send('No User Found');
  }
});

// All Students Search
router.get('/listusers/:school', checkAuthenticated, async (req, res) => {
  try {
    let students = [];
    const targetschool = req.params.school;
    console.log('profile_controller req.params: ', req.params);
    const query = { school: targetschool };
    console.log('query string: ', query);
    await User.find(query, function (err, doc) {
      if (!doc) {
        console.log('In Error branch - err: ', err);
        res.status(404);
        return res.send(`No User associated with ${targetschool}!`);
      }
      students = doc;
      console.log('Line 234 ---> Students: ', students);
      return res.status(200).send(students);
    });
  } catch (error) {
    res.status(404);
    return res.send('No User Found');
  }
});

export default router;
