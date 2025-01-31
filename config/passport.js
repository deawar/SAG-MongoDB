// In your passport.js configuration file

import passport from 'passport';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import flash from 'express-flash';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';
import User from '../models/user.js';

export default function configurePassport(app) {
    console.log('Configuring passport authentication');

    app.use(passport.initialize());
    app.use(passport.session());

    // Serialize the entire user object for the session
    passport.serializeUser((user, done) => {
        try {
            done(null, user.id);
        } catch (err) {
            done(err, null);
        }
    });

    // Deserialize by finding the user in the database
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    // Local signup strategy remains the same
    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                // Check for existing user
                const existingUser = await User.findOne({ email: req.body.email }).exec();
                if (existingUser) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                }

                // Generate token synchronously
                const secretToken = crypto.randomBytes(32).toString('hex');
                
                const permalink = req.body.first_name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .replace(/[^\w]/g, '')
                    .trim();

                // Create new user document
                const newUser = new User({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    address1: req.body.address1,
                    address2: req.body.address2,
                    city: req.body.city,
                    state: req.body.state,
                    zip: req.body.zip,
                    school: req.body.school,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: req.body.password, // Will be hashed by pre-save middleware
                    role: req.body.role,
                    secretToken,
                    active: false,
                    permalink,
                });

                // Save the user to the database
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                console.error('Signup error:', error);
                return done(error);
            }
        }
    ));

    // passport.use('local-login', new LocalStrategy({
    //   // by default, local strategy uses username and password, we will override with email
    //   usernameField: 'email',
    //   passwordField: 'password',
    //   passReqToCallback: true, // allows us to pass back the entire request to the callback
    // },
    // ((req, email, password, done) => {
    //   process.nextTick(() => {
    //     User
    //       .findOne({ email: req.body.email })
    //       .then((user, err) => {
    //         if (err) {
    //           console.log('user', user);
    //           console.log('&&&', err);
    //           console.log('****', !user);
    //           console.log('^^^', (!user.validPassword(req.body.password)));
    //           return done(err);
    //         }
  
    //         // if no user is found, return the message
    //         if (!user) {
    //           console.log('no user found');
    //           return done(null, false, 'No user found.');
    //         }
  
    //         // if the user is found but the password is wrong
    //         if (user && !user.validPassword(req.body.password)) {
    //           return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
    //         }
  
    //         if (!user.active) {
    //           return done(null, user);
    //         }
    //         // If everything good return successful user
    //         return done(null, user);
    //       });
    //   });
    // }))
    passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, async (req, email, password, done) => {
        try {
          const user = await User.findOne({ email: req.body.email });
          
          // If no user found
          if (!user) {
              console.log('No user found');
              return done(null, false, { message: 'No user found.' });
          }
  
          // Check password
          if (!user.validPassword(password)) {
              return done(null, false, { message: 'Incorrect password.' });
          }
  
          // Check if user is active
          if (!user.active) {
              return done(null, false, { message: 'Account not activated.' });
          }
  
          // Success
          return done(null, user);
        } catch (err) {
          console.error('Login error:', err);
          return done(err);
        }
    }));
}
