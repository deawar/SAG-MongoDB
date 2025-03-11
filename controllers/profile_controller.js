import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import os from 'os';
import Auction from '../models/auction.js';
import User from '../models/user.js';
import db, { role } from '../models/index.js';
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

// Get user information for a given user ID
router.get('/user/:account_id', checkAuthenticated, async (req, res) => {
  try {
    console.log('profile_controller req.params.account_id: ', req.params.account_id);
    const userId = req.params.account_id;

    // Input Validation
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'No User ID provided',
      });
    }

    // Find user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return only the necessary fields
    return res.json({
      success: true,
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    console.log('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user data',
    });
  }
});

// ROUTER TO DELETE ACCOUNT
router.delete('/user/:account_id/:email', checkAuthenticated, async (req, res) => {
  try {
    console.log(`_id: ${req.params.account_id}`);
    console.log(`email: ${req.params.email}`);

    const filter = { _id: req.params.account_id, email: req.params.email };
    const deletedUser = await User.findOneAndDelete(filter);

    if (!deletedUser) {
      return res.status(404).send('No User Deleted.');
    }

    console.log('Successfully Deleted: ', deletedUser);
    res.status(200).json(deletedUser);
  } catch (error) {
    console.log('Catch ERROR: ', error);
    return res.status(404).send('No Profiles Deleted');
  }
});

// ROUTER TO UPDATE ACCOUNT
router.put('/user/:account_id', checkAuthenticated, async (req, res) => {
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
    const updatedUser = await User.findOneAndUpdate(
      filter,
      { $set: req.body },
      opts,
    );

    if (!updatedUser) {
      return res.status(404).send('No User found to Update.');
    }

    console.log('Profile Updates going in:', updateDoc);
    res.status(200).json(updateDoc);
  } catch (error) {
    console.log('Catch ERROR: ', error);
    return res.status(404).send('No Updates Performed');
  }
});

// PROFILE SEARCH BY ADMIN
router.get('/searchuser/:email', checkAuthenticated, async (req, res) => {
  try {
    console.log('profile_controller req.params.email: ', req.params.email);
    const searchEmail = req.params.email;
    const school = findSchoolName(req);

    const doc = await User.findOne({ email: searchEmail, school });

    if (!doc) {
      return res.status(404).send(`No User associated with ${searchEmail}!`);
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
    res.status(200).json(returnDoc);
  } catch (error) {
    console.log('Search error:', error);
    return res.status(404).send('No User Found');
  }
});

// All Students Search
router.get('/listusers/:school', checkAuthenticated, async (req, res) => {
  try {
    const targetschool = req.params.school;
    console.log('profile_controller req.params: ', req.params);
    const query = { school: targetschool };
    console.log('query string: ', query);

    const students = await User.find(query);

    if (!students || students.length === 0) {
      return res.status(404).send(`No Users associated with ${targetschool}!`);
    }

    console.log('Line 234 ---> Students: ', students);
    return res.status(200).json(students);
  } catch (error) {
    console.log('List users error:', error);
    return res.status(404).send('No Users Found');
  }
});

export default router;
