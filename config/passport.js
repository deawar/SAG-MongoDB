/* eslint-disable consistent-return */
import passport from 'passport';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import flash from 'express-flash';
import { Strategy as LocalStrategy } from 'passport-local';
import randomstring from 'randomstring';
import User from '../models/user.js';

export default function configurePassport(app) {
  console.log('passport loading');

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ _id: id }, '-password -salt').exec();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // LOCAL SIGNUP
  passport.use('local-signup', new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const existingUser = await User.findOne({ email: req.body.email }).exec();
        if (existingUser) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }

        const secretToken = randomstring.generate(64);
        const permalink = req.body.first_name.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '').trim();

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
          password: bcrypt.hashSync(req.body.password, 10),
          role: req.body.role,
          secretToken,
          active: false,
          permalink,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    },
  ));

  // LOCAL LOGIN
  passport.use('local-login', new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email: req.body.email }).exec();
        if (!user || !bcrypt.compareSync(password, user.password)) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong email or password.'));
        }

        if (!user.active) {
          return done(null, false, req.flash('loginMessage', 'Your account is not activated yet.'));
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ));
}
