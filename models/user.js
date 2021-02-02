/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
/* Requiring bcryptjs for password hashing */
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const uniqueValidator = require('mongoose-unique-validator');
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

// secretToken Generator
const secretTokenGen = function () {
  const secretToken = randomstring.generate({ length: 64, charset: 'alphanumeric' }, this.secretToken);
  return secretToken;
};

// Creating our User Schema
const userDataSchema = new Schema({
  updated: { type: Date, default: Date.now },
  unique_id: { type: Number, index: true },
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
    validate: {
      validator(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: '{VALUE} is not a valid phone number!',
    },
    required: [true, 'User phone number required'],
  },
  address: {
    type: String,
    trim: true,
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
    min: 2,
  },
  zip: {
    type: String,
    trim: true,
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
  username: {
    type: String,
    unique: true,
    trim: true,
    index: true,
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
    type: Schema.Types.ObjectId, // Might need to replace 'Schema.Types' with mongoose
    ref: 'role',
  },
  active: Boolean,
});

userDataSchema.pre('save', function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) return next(error);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userDataSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
const User = mongoose.model('User', userDataSchema);
const user = new User({ type: 'user' });

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.getUserByUsername = function (username, callback) {
  const query = { username };
  User.findOne(query, callback);
};

userDataSchema.plugin(passportLocalMongoose);

// hash the password
userDataSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
};

// checking if password is valid
userDataSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// authenticate input against database
userDataSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    // eslint-disable-next-line prefer-arrow-callback
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
userDataSchema.plugin(uniqueValidator, {
  // eslint-disable-next-line comma-dangle
  message: 'Sorry, {PATH} needs to be unique'
});

module.exports = (User, userDataSchema);
