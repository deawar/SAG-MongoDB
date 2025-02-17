/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import express from 'express';
import flash from 'express-flash-notification';
import passport from 'passport';
import passportConfig from '../config/passport.js';

passportConfig(passport);

const router = express.Router();

// HTML ROUTE FOR LOGIN SCREEN
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
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
  // Clear the user from the session
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }

    // Clear any cookies
    res.clearCookie('first_name');
    res.clearCookie('user_id');

    // Destroy the session
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Session destruction error:', sessionErr);
      }
      // Redirect to home page or login page
      res.redirect('/');
    });
  });
});

export default router;
