require('dotenv').config();

import express, { urlencoded, json, static as serveStatic } from 'express';
import session from 'express-session';
import flash from 'express-flash-notification';
import exphbs from 'express-handlebars';
import { join } from 'path';
import { hostname as _hostname } from 'os';
import { set, connect, connection } from 'mongoose';
import { initialize, session as _session } from 'passport';
import { bold } from 'chalk';
import morgan from 'morgan'; // logging middleware

const app = express();

const { DB_HOST, MONGODB_URI, LOCALMONGODB_URI, NODE_ENV, PORT, SESSION_SECRET } = process.env;

const connected = bold.cyan;
const error = bold.yellow;
const disconnected = bold.red;
const termination = bold.magenta;

set('useUnifiedTopology', true);
set('useNewUrlParser', true);
set('useFindAndModify', false);
set('useCreateIndex', true);
set('bufferCommands', false);

const connectToDatabase = async (uri) => {
  try {
    await connect(uri);
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
const port = PORT || 3000;
import { on, once } from './models/index.js';

on('error', console.error.bind(console, 'connection error:'));

console.log('Process PID: ', pid);

// Set Handlebars.
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    partialsDir: [join(__dirname, 'views/partials')],
  }),
);
app.set('view engine', 'handlebars');
app.use(morgan('dev'));

// Parse request body as JSON
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(session({
  key: 'user_sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    expires: 600000,
  },
}));

// using passport and session
app.use(initialize());
app.use(_session());

require('./config/passport')(app);

// Using flash for messages
app.use(flash(app));

// Serve static content for the app from the "public" directory in the application directory.
app.use(serveStatic(join(__dirname, 'public')));

// Import routes and give the server access to them.
import dashboardRoutes from './controllers/dashboard_controller.js';
import signupRoutes from './controllers/signup_controller.js';
import loginRoutes from './controllers/login_controller.js';
import donateRoutes from './controllers/donate_controller.js';
import profileRoutes from './controllers/profile_controller.js';
import chooseSchoolRoutes from './controllers/choose_school_controller.js';
import fileUpload from './controllers/file_upload_controller.js';

app.use(dashboardRoutes);
app.use(signupRoutes);
app.use(loginRoutes);
app.use(donateRoutes);
app.use(profileRoutes);
app.use(chooseSchoolRoutes);
app.use(fileUpload);

const hostname = _hostname();
once('open', () => {
  console.log('\nConnected to MongoDB @', DB_HOST);

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
