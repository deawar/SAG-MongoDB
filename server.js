import express, { urlencoded, json, static as serveStatic } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import flash from 'express-flash-notification';
import exphbs from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { hostname as _hostname } from 'os';
import mongoose from 'mongoose';
import passport from 'passport';
import chalk from 'chalk';
import morgan from 'morgan';

// Import your local modules
import passportConfig from './config/passport.js';
import { on, once } from './models/index.js';

// Import routes
import dashboardRoutes from './controllers/dashboard_controller.js';
import signupRoutes from './controllers/signup_controller.js';
import loginRoutes from './controllers/login_controller.js';
import donateRoutes from './controllers/donate_controller.js';
import profileRoutes from './controllers/profile_controller.js';
import chooseSchoolRoutes from './controllers/choose_school_controller.js';
import fileUpload from './controllers/file_upload_controller.js';
import auctionRoutes from './controllers/auction_controller.js';

// Destructure mongoose after import
const { set, connect, connection } = mongoose;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const initialize = () => passport.initialize();
const _session = passport.session();

const app = express();

const {
  DB_HOST, MONGODB_URI, LOCALMONGODB_URI, NODE_ENV, PORT: port, SESSION_SECRET,
} = process.env;

const { bold } = chalk;
const connected = bold.cyan;
const error = bold.yellow;
const disconnected = bold.red;
const termination = bold.magenta;

set('strictQuery', false);

const connectToDatabase = async (uri) => {
  try {
    await connect(uri, {
      // Remove deprecated options and use modern connection settings
      useNewUrlParser: true,
      useUnifiedTopology: true,
      readPreference: 'primary',
    });
    console.log(connected('Mongoose default connection is open to ', uri));
  } catch (err) {
    console.log(error(`Mongoose default connection has occurred ${err} error`));
  }

  connection.on('disconnected', () => {
    console.log(disconnected('Mongoose default connection is disconnected'));
  });

  process.on('SIGINT', async () => {
    await connection.close();
    console.log(termination('Mongoose default connection is disconnected due to application termination'));
    process.exit(0);
  });
};

const uri = NODE_ENV === 'test' ? LOCALMONGODB_URI : MONGODB_URI;
connectToDatabase(uri);

const { pid } = process;

on('error', console.error.bind(console, 'connection error:'));

console.log('Process PID: ', pid);

// Set Handlebars.
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    partialsDir: [join(__dirname, 'views', 'partials')],
  }),
);
app.set('view engine', 'handlebars');
app.use(morgan('dev'));

// Parse request body as JSON
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Using flash for messages
app.use(flash(app));

// using passport and session
app.use(passport.initialize());
app.use(passport.session());
passportConfig(app);

// Serve static content for the app from the "public" directory in the application directory.
app.use(serveStatic(join(__dirname, 'public')));

app.use(dashboardRoutes);
app.use(signupRoutes);
app.use(loginRoutes);
app.use(donateRoutes);
app.use(profileRoutes);
app.use('/api', chooseSchoolRoutes);
app.use(fileUpload);
app.use(auctionRoutes);

const hostname = _hostname();
once('open', () => {
  console.log('\nConnected to MongoDB @', DB_HOST);

  // Handle 404s
  app.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    } else {
      next();
    }
  });

  // General error handler
  app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    // Don't send error details in production
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message;

    if (req.headers['content-type'] === 'application/json') {
      res.status(err.status || 500).json({
        success: false,
        message,
      });
    } else {
      next(err);
    }
  });
  app.listen(port, () => {
    console.log(`PID: ${pid}\n`);
    console.log(
      `==> 🌎  Listening on port %s. Visit http://${hostname}:%s/ in your browser.`,
      port,
      port,
    );
  });
});

export default app;
