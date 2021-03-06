/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
const express = require('express');
const flash = require('express-flash-notification');
const passport = require('passport');
require('../config/passport')(passport);

const router = express.Router();

// HTML ROUTE FOR LOGIN SCREEN
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    //
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
});

// ROUTE TO LOGIN USER INTO APPLICATION
router.post('/api/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    console.log('\n\n\nLine 23 login_controller -->userrrr info', info);
    console.log('Line 24 login_controller -->user', user);
    console.log('Logged in user Email verification status: ', user.active);
    if (err) {
      console.log('passport err', err);
      req.flash('info', 'Aww Snap! Somehting Broke! Checkback later, please.', false);
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      req.flash('info', 'Invalid username or password!', false);
      return res.render('login', { title: 'Login Page', success: false, info });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.log('loginerr', loginErr);
        req.flash('info', 'Invalid username or password!', false);
        return next(loginErr);
      }
      console.log('redirecting....');
      res.cookie('first_name', user.first_name);
      res.cookie('user_id', user.id);
      return res.json(user);
    });
  })(req, res, next);
});

// ROUTE TO LOG OUT USER
router.get('/logout', (req, res) => {
  req.headers.logged = 'false';
  console.log('login_controller line 49 user is logged in: ', req.headers.logged);
  res.render('logout', {
    school: 'North Oconee High School',
    logged: req.isAuthenticated(), // needs to be Not Logged in to show the LogIn menu option
  });
  req.logout();
  res.clearCookie('user_sid');
  res.clearCookie('first_name');
  res.clearCookie('user_id');
  // res.redirect('/login');
});

module.exports = router;
