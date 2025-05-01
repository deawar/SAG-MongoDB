import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

// Explicit model imports
import user from './user.js';
import school from './school.js';
import role from './role.js';
import bid from './bid.js';
import artwork from './artwork.js';
import auction from './auction.js';

// Create proper directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database connection
const db = mongoose.connection;

// Bind database event handlers
const on = db.on.bind(db);
const once = db.once.bind(db);

// Export everything we need
export {
  user,
  school,
  role,
  artwork,
  bid,
  auction,
  on,
  once,
};

export default db;
