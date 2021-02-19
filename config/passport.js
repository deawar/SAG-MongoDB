/* eslint-disable consistent-return */
const passport = require('passport');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const flash = require('express-flash');
const LocalStrategy = require('passport-local').Strategy;
const randomstring = require('randomstring');
const User = require('../models/user');

const db = mongoose.connection;
module.exports = (app) => {
  console.log('passport loading');
  // console.log('In Passport db = ', db.models);

  app.use(passport.initialize());
  app.use(passport.session());

  // PASSPORT SESSION SETUP
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id,
    // eslint-disable-next-line prefer-arrow-callback
    }, '-password -salt', function (err, user) {
      done(err, user);
    });
  });

  // LOCAL SIGNUP
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  }, ((req, email, password, done) => {
    process.nextTick(() => {
      User
        .findOne({ email: req.body.email })
        .exec((err, user) => {
          if (err) {
            return done(null, err);
          } if (!user) {
            const e = new Error('User not found.');
            e.status = 401;
            return done(null, user);
          }
          if (user) {
            console.log('signupMessage', 'That email is already taken.');
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          }
        });
      // eslint-disable-next-line no-unused-vars
      const secretToken = randomstring.generate(64);
      console.log('secretToken: ', secretToken);
      console.log('req.body: ', req.body);
      const permalink = req.body.first_name.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();
      const newUser = new User(
        {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          // address: req.body.address1,
          address: {
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
          },
          school: req.body.school,
          email: req.body.email,
          phone: req.body.phone,
          password: req.body.password,
          role: {
            role: req.body.role,
          },
          secretToken,
          active: false,
          permalink,
        },
      );
      newUser.save((err, newUser) => {
        if (err) return console.error(err);
        console.log('permalink: ', permalink);
        console.log('Document saved!', newUser);
      });
    });
    // try {
    //   newUser.save((err) => {
    //     if (err) {
    //       throw err;
    //     } else {
    //       // VerifyEmail.sendverification(email, secretToken, permalink);
    //       return done(null, newUser);
    //     }
    //   });
    // } catch (err) {
    //   if (err) {
    //     throw err;
    //   } else {
    //     return done(err, err.message);
    //   }
    // }
    return process.nextTick;
    // });
  }),
  // LOCAL LOGIN
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
  ((req, email, password, done) => {
    process.nextTick(() => {
      User
        .findOne({ email: req.body.email })
        .then((user, err) => {
          if (err) {
            console.log('user', user);
            console.log('&&&', err);
            console.log('****', !user);
            console.log('^^^', (!user.validPassword(req.body.password)));
            return done(err);
          }

          // if no user is found, return the message
          if (!user) {
            console.log('no user found');
            return done(null, false, 'No user found.');
          }

          // if the user is found but the password is wrong
          if (user && !user.validPassword(req.body.password)) {
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
          }

          if (!user.active) {
            return done(null, user);
          }
          // If everything good return successful user
          return done(null, user);
        });
    });
  })))));
};
