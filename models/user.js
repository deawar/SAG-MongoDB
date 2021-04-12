/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
/* Requiring bcryptjs for password hashing */
const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');
const uniqueValidator = require('mongoose-unique-validator');
// const mongooseTypePhone = require('mongoose-type-phone');
// Get the Schema constructor
const { Schema } = mongoose;
// eslint-disable-next-line prefer-destructuring
const randomstring = require('randomstring');
const bcrypt = require('bcryptjs');

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

// subAddress Document
// const subAddress = new Schema({
//   type: { type: String },
//   address1: String,
//   address2: String,
//   city: String,
//   state: String,
//   zip: {
//     type: String,
//     required: true,
//     min: 5,
//   },
// });

// subRole Document
// const subRole = new mongoose.Schema({
//   type: { type: String },
//   role: String,
// });

// Creating our User Schema
const userSchema = new Schema({
  updated: { type: Date, default: Date.now },
  // unique_id: { type: Number, index: true },
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
    // match: [/^\(([2-9])(?!\1\1)\d\d\) [2-9]\d\d-\d{4}$/, 'Please fill in a valid phone number.'],
  },
  // address: [subAddress],
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
  // [subRole],
  // role: {
  //   type: Schema.Types.ObjectId, // Might need to replace 'Schema.Types' with mongoose
  //   ref: 'role',
  },
  active: Boolean,
});

// eslint-disable-next-line consistent-return
userSchema.pre('save', function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    // eslint-disable-next-line prefer-arrow-callback
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
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
const user = new User({ type: 'user' });

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.getUserByEmail = function (email, callback) {
  const query = { email };
  User.findOne(query, callback);
};

module.exports.getUserBysecretToken = function (secretToken, callback) {
  const query = { secretToken };
  User.findOne(query, callback);
};

// // hash the password
// userSchema.methods.generateHash = function (password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
// };

// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// authenticate input against database
userSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email })
    .exec(function (err, user) {
      if (err) {
        return callback(err);
      // eslint-disable-next-line no-else-return
      } else if (!user) {
        const err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      // eslint-disable-next-line prefer-arrow-callback
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        // eslint-disable-next-line no-else-return
        } else {
          return callback();
        }
      });
    });
};

// Apply the uniqueValidator plugin to userDataSchema.
userSchema.plugin(uniqueValidator, {
  message: 'Sorry, {PATH} needs to be unique',
});

module.exports = mongoose.model('user', userSchema);
