/* eslint-disable consistent-return */
const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const randomstring = require('randomstring');
const db = require('../models/index.js');
const User = require('../models/user');

module.exports = (app) => {
  console.log('passport loading');

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
            // const err = new Error('User not found.');
            // err.status = 401;
            return done(null, user);
          }
          // eslint-disable-next-line prefer-arrow-callback
          bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
              return done(null, user);
            }
            return done();
          });
        })
        .then((user, err) => {
          if (err) {
            console.log('err', err);
            return done(err);
          }
          if (user) {
            console.log('signupMessage', 'That email is already taken.');
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          }
          // eslint-disable-next-line no-unused-vars
          const secretToken = randomstring.generate(64);
          db.User.insertOne({
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
            password: db.User.generateHash(password),
            secretToken: db.User.secretToken,
            active: false,
          }).then((dbUser) => done(null, dbUser)).catch((error) => {
            console.log(error);
          });
        });
      return process.nextTick;
    });
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
    // checking to see if the user trying to login already exists
    db.User.findOne({
      where: {
        email: req.body.email,
      },
    }).then((user, err) => {
      console.log('user', user);
      console.log('&&&', err);
      console.log('****', !user);
      // console.log('^^^', (!user.validPassword(req.body.password)));
      // (!user.validPassword(req.body.password));

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
  })))));
};
