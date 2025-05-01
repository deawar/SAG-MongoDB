import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // New import to replace randomstring

const { Schema } = mongoose;

const SALT_WORK_FACTOR = 10;

// Email validation function remains unchanged
const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Phone validation function remains unchanged
const validatePhone = function (phone) {
  const re = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
  return re.test(phone);
};

// Token generation using Promise
const generateSecureToken = () => new Promise((resolve, reject) => {
  crypto.randomBytes(64, (err, buffer) => {
    if (err) {
      reject(new Error(`Token generation failed: ${err.message}`));
      return;
    }

    try {
      const token = buffer.toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 64);

      if (token.length !== 64) {
        throw new Error('Generated token length is incorrect');
      }

      resolve(token);
    } catch (error) {
      reject(new Error(`Token formatting failed: ${error.message}`));
    }
  });
});

// User Schema definition - most fields remain the same
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
  // Modified secretToken field definition
  secretToken: {
    type: String,
    default: undefined,
  },
  role: {
    type: String,
    required: true,
    default: 'student',
  },
  active: Boolean,
});

// Modified pre-save middleware to handle both token generation and password hashing
userSchema.pre('save', async function (next) {
  const user = this;

  try {
    // Only generate token for new users
    if (user.isNew) {
      user.secretToken = await generateSecureToken();
      console.log('Generated new token for new user:', {
        email: user.email,
        token: user.secretToken,
      });
    }

    // Handle password hashing
    if (user.isModified('password')) {
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      user.password = await bcrypt.hash(user.password, salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison
userSchema.methods = {
  // Compare password using Promise
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  },

  // Validate password using async/await
  async validPassword(password) {
    return bcrypt.compare(password, this.password);
  },
};

// User model static methods remain unchanged
userSchema.statics = {
  // Get user by ID
  async getUserById(id) {
    return this.findById(id);
  },

  // Get user by email
  async getUserByEmail(email) {
    return this.findOne({ email });
  },

  // Get user by secret token
  async getUserBySecretToken(secretToken) {
    return this.findOne({ secretToken });
  },

  // Authenticate user
  async authenticate(email, password) {
    const user = await this.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid password');
    }

    return user;
  },
};

// Unique validator plugin
userSchema.plugin(uniqueValidator, {
  message: 'Sorry, {PATH} needs to be unique',
});

const User = mongoose.model('User', userSchema);
export default User;
