const express = require('express');
const session = require('express-session');
const flash = require('express-flash-notification');
const process = require('process');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const os = require('os');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const passport = require('passport');
const chalk = require('chalk');
// const LocalStrategy = require('passport-local').Strategy;
// const passportLocalMongoose = require('passport-local-mongoose');
const morgan = require('morgan'); // logging middleware

const app = express();

const { DB_USER } = process.env;
const { DB_PASSWORD } = process.env;
const { DB_HOST } = process.env;
const { DB_NAME } = process.env;
const { MONGODB_URI } = process.env;
const { LOCALMONGODB_URI } = process.env;
const { DBLOCAL_HOST } = process.env;

const models = require('./models/index.js');
const User = require('./models/user');

const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const disconnected = chalk.bold.red;
const termination = chalk.bold.magenta;

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('bufferCommands', false);

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  // rsconst uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}${DB_NAME}?retryWrites=true&w=majority`;
  const uri = MONGODB_URI;
  console.log('MongoDB Access string: ', uri);
  const client = new MongoClient(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });
  mongoose.connect(uri, client);
  mongoose.connection.on('connected', () => {
    console.log(connected('Mongoose default connection is open to ', uri));
  });
  mongoose.connection.on('error', (err) => {
    console.log(error(`Mongoose default connection has occured ${err} error`));
  });
  mongoose.connection.on('disconnected', () => {
    console.log(disconnected('Mongoose default connection is disconnected'));
  });
  client.connect((err) => {
    const collection = client.db('test').collection('devices');
    // perform actions on the collection object
    client.close();
  });
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log(termination('Mongoose default connection is disconnected due to application termination'));
      process.exit(0);
    });
  });
} else if (process.env.NODE_ENV === 'test') {
  // const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DBLOCAL_HOST}${DB_NAME}/test?retryWrites=true&w=majority`;
  const uri = LOCALMONGODB_URI;
  console.log('MongoDB Access string: ', uri);
  const client = new MongoClient(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });
  mongoose.connect(uri, client);
  mongoose.connection.on('connected', () => {
    console.log(connected('Mongoose default connection is open to ', uri));
  });
  mongoose.connection.on('error', (err) => {
    console.log(error(`Mongoose default connection has occured ${err} error`));
  });
  mongoose.connection.on('disconnected', () => {
    console.log(disconnected('Mongoose default connection is disconnected'));
  });
  client.connect((err) => {
    const collection = client.db('test').collection('devices');
    // perform actions on the collection object
    client.close();
  });
}

// require('dotenv').config(); move to a dev-dependency must run "node -r dotenv/config server.js"
// or "npm run start"

const { pid } = process;
const PORT = process.env.PORT || 3000;
const { SESSION_SECRET } = process.env;
const db = require('./models');

db.on('error', console.error.bind(console, 'connection error:'));

console.log('Process PID: ', process.pid);

// Set Handlebars.
app.engine(
  'handlebars',
  exphbs({
    // extname: 'handlebars',
    defaultLayout: 'main',
    // layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: [
      //  path to your partials
      path.join(__dirname, 'views/partials'),
    ],
  }),
);
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.use(morgan('dev'));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require('express-session')({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// We need to use sessions to keep track of our user's login status
app.use(session({
  key: 'user_sid',
  secret: SESSION_SECRET,
  // httpOnly: true,
  // need to understand this more
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    expires: 600000,
  },
}));

// using passport and session
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(app);

// Using flash for messages
app.use(flash(app));

// Serve static content for the app from the "public" directory in the application directory.
// app.use(express.static('public'));
app.use(express.static(`${__dirname}/public`));

// Import routes and give the server access to them.
const dashboardRoutes = require('./controllers/dashboard_controller.js');
const signupRoutes = require('./controllers/signup_controller.js');
const loginRoutes = require('./controllers/login_controller.js');
const donateRoutes = require('./controllers/donate_controller.js');
const profileRoutes = require('./controllers/profile_controller.js');
const chooseSchoolRoutes = require('./controllers/choose_school_controller.js');
const fileUpload = require('./controllers/file_upload_controller.js');

app.use(dashboardRoutes);
app.use(signupRoutes);
app.use(loginRoutes);
app.use(donateRoutes);
app.use(profileRoutes);
app.use(chooseSchoolRoutes);
app.use(fileUpload);

// Route that creates a flash message using the express-flash module
// from this github gist https://gist.github.com/brianmacarthur/a4e3e0093d368aa8e423
// app.all('/express-flash', (req, res) => {
//   req.flash('success', 'This is a flash message using the express-flash module.');
//   res.redirect(301, '/');
// });

const hostname = os.hostname();
db.once('open', () => {
  console.log('\nConnectd to MongoDB');

  app.listen(PORT, () => {
    console.log(`PID: ${pid}\n`);
    console.log(
      `==> 🌎  Listening on port %s. Visit http://${hostname}:%s/ in your browser.`,
      PORT,
      PORT,
    );
  });
});

module.exports = express;
