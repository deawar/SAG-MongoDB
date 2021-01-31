/* eslint-disable func-names */
/* Requiring bcrypt for password hashing */
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;
const randomstring = require('randomstring');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;
// Email Validator fx
const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// secretToken Generator
const secretTokenGen = function (secretToken) {
  return randomstring.generate({ length: 64, charset: 'alphanumeric' }, this.secretToken);
};

// Creating our User model
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
    min: 8,
  },
  passwordConf: String,
  secretToken: {
    type: String,
    validate: [secretTokenGen],
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
// encrypted password checking
// userDataSchema.methods.authenticate = function (password) {
//   return this.password === this.hashPassword(password);
// };

// hash the password
userDataSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
};

// checking if password is valid
userDataSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// // Generate SecretToken for Email verification
// userDataSchema.methods.secretToken = function (secretToken) {
//   return randomstring.generate({ length: 64, charset: 'alphanumeric' }, this.secretToken);
// };

module.exports = (User, user, userDataSchema);
