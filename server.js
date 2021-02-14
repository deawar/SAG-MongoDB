const express = require('express');
const flash = require('express-flash-notification');
const session = require('express-session');
const process = require('process');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const os = require('os');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const passportLocalMongoose = require('passport-local-mongoose');
const morgan = require('morgan'); // logging middleware

const app = express();

const { DB_USER } = process.env;
const { DB_PASSWORD } = process.env;
const { DB_HOST } = process.env;
const { DB_NAME } = process.env;
const models = require('./models/index.js');
const User = require('./models/user');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

if (process.env.NODE_ENV === 'development') {
  const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}${DB_NAME}?retryWrites=true&w=majority`;
  console.log('MongoDB Access string: ', uri);
  const client = new MongoClient(uri, { useNewUrlParser: true });
  mongoose.connect(uri, client);
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
app.use(express.static('public'));

// Import routes and give the server access to them.
const dashboardRoutes = require('./controllers/dashboard_controller.js');
const signupRoutes = require('./controllers/signup_controller.js');
const loginRoutes = require('./controllers/login_controller.js');
const donateRoutes = require('./controllers/donate_controller.js');
const profileRoutes = require('./controllers/profile_controller.js');
const chooseSchoolRoutes = require('./controllers/choose_school_controller.js');

app.use(dashboardRoutes);
app.use(signupRoutes);
app.use(loginRoutes);
app.use(donateRoutes);
app.use(profileRoutes);
app.use(chooseSchoolRoutes);

// Route that creates a flash message using the express-flash module
// from this github gist https://gist.github.com/brianmacarthur/a4e3e0093d368aa8e423
// app.all('/express-flash', (req, res) => {
//   req.flash('success', 'This is a flash message using the express-flash module.');
//   res.redirect(301, '/');
// });

app.use(fileupload({ safeFileNames: true, preserveExtension: 3 }));

// eslint-disable-next-line consistent-return
app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  const { sampleFile } = req.files;
  console.log('Is there a file: ', req.files, req.files.sampleFile.name);

  // eslint-disable-next-line consistent-return
  sampleFile.mv(`./public/upload/${sampleFile}`, (err) => {
    if (err) return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

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
