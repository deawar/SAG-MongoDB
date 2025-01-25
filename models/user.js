/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
/* Requiring bcryptjs for password hashing */
import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import randomstring from 'randomstring';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const SALT_WORK_FACTOR = 10;

// Email Validator fx
const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Phone number Validator Fx
const validatePhone = function (phone) {
  const re = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
  return re.test(phone);
};

// secretToken Generator
const secretTokenGen = function () {
  const secretToken = randomstring.generate({ length: 64, charset: 'alphanumeric' }, this.secretToken);
  return secretToken;
};

// Creating our User Schema
const userSchema = new Schema({
  updated: { type: Date, default: Date.now },
  first_name: {
    type: String,
    trim: true,
    required: true,
  },
  last_name: {
    type: String,
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    required: 'Please enter a Phone number.',
    validate: [validatePhone, 'Please fill in a valid phone number.'],
  },
  address1: {
    type: String,
    trim: true,
    required: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
  },
  zip: {
    type: String,
    required: true,
    min: 5,
  },
  school: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  passwordConf: String,
  secretToken: {
    type: String,
    validate: [secretTokenGen],
  },
  role: {
    type: String,
    required: true,
    default: 'student',
  },
  active: Boolean,
});

userSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

export const getUserById = function (id, callback) {
  User.findById(id, callback);
};

export const getUserByEmail = function (email, callback) {
  const query = { email };
  User.findOne(query, callback);
};

export const getUserBysecretToken = function (secretToken, callback) {
  const query = { secretToken };
  User.findOne(query, callback);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email })
    .exec(function (err, user) {
      if (err) {
        return callback(err);
      } if (!user) {
        const err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        }
        return callback();
      });
    });
};

userSchema.plugin(uniqueValidator, {
  message: 'Sorry, {PATH} needs to be unique',
});

export default mongoose.model('User', userSchema);
