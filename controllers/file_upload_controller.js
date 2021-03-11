/* eslint-disable camelcase */
const express = require('express');
const flash = require('express-flash-notification');
const session = require('express-session');
const process = require('process');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
// const formidable = require('formidable');
const os = require('os');
const mongoose = require('mongoose');
const passport = require('passport');
const fs = require('fs');
const Artwork = require('../models/artwork');
const School = require('../models/school');
const User = require('../models/user');

const app = express();
require('../config/passport')(passport);
const helpers = require('../config/helpers');
const { checkAuthenticated } = require('../config/middleware/isAuthenticated');
const asyncMiddleware = require('../config/middleware/asyncMiddleware');

const router = express.Router();
app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Find school Fx
function findSchoolName(req) {
  // eslint-disable-next-line prefer-destructuring
  let school;
  // school = res.req.user.school;
  if (req.user === null || req.user === undefined) {
    school = 'Make Art, Have Fun!';
    return school;
  }
  // eslint-disable-next-line prefer-destructuring
  school = req.user.school;
  const uploadPath = `./public/upload/${school}/`;
  console.log('School: ', school);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }
  return school;
}

// Find first_name Fx
function findFirstName(req) {
  // eslint-disable-next-line prefer-destructuring
  let first_name;
  if (req.user === null || req.user === undefined) {
    first_name = 'Your';
    return first_name;
  }
  // eslint-disable-next-line prefer-destructuring
  first_name = req.user.first_name;
  return first_name;
}

// get File ext/type
function getFileType(file) {
  const splitfile = file.split('.');
  const getThisType = splitfile[splitfile.length - 1];
  return getThisType;
}
// Find Id
function findId(req) {
  let reqvar;
  if (req.user === null || req.user === undefined) {
    reqvar = 'Not Available';
    return reqvar;
  }
  // eslint-disable-next-line no-underscore-dangle
  reqvar = req.user._id;
  return reqvar;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `./public/upload/${findSchoolName(req)}`);
    // cb(null, uploadPath);
  },
  // By default, multer removes file extensions so let's add them back
  filename(req, file, cb) {
    // cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    cb(null, `${findId(req)}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10000000 },
  fileFilter: helpers.imageFilter,
}).single('sampleFile');
// eslint-disable-next-line consistent-return

// router.post('/upload', checkAuthenticated, upload.single('sampleFile'), (req, res) => {
router.post('/upload', checkAuthenticated, upload, (req, res) => {
  // let sampleFile;
  console.log('Line 102 file_upload_controller req.body: ', req.body);
  console.log('File_upload_controller File res.files: ', req.files);
  console.log('Text fields sent with file-req.body: ', req.body);
  const school = findSchoolName(req);
  let _id;
  // eslint-disable-next-line no-underscore-dangle
  _id = findId(req);
  console.log('====================================');
  console.log('_id: ', _id);
  console.log('====================================');
  app.use(express.static(`public/upload/${findSchoolName(req)}`));
  console.log('line 113-->School: ', school);
  const uploadPath = `./public/upload/${school}/`;

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }
  const first_name = findFirstName(req);
  console.log('line 121-->File_name: ', req.file.filename);
  const fileExt = getFileType(req.file.filename);
  console.log('File Extension: ', fileExt);

  let newArtwork = new Artwork();
  const displayPath = uploadPath;
  newArtwork = {
    artist_email: req.email,
    art_name: req.artwork_name,
    description: req.description,
    height: req.height,
    medium: req.medium,
    price: req.price,
    width: req.width,
    img: {
      // eslint-disable-next-line max-len
      // data: fs.readFileSync(path.join(`${__dirname}/public/upload/${findSchoolName(req)}/${findId(req)}-${req.file.originalname}`)),
      data: fs.readFileSync(`./public/upload/${findSchoolName(req)}/${findId(req)}-${req.file.originalname}`),
      contentType: `image/${fileExt}`,
    },
  };
  // newArtwork.create(newArtwork, (err, item) => {
  //   if (err) {
  //     return console.log(err);
  //   }
  const uploadedArtwork = `<img src="${displayPath}" width="200">`;
  newArtwork.save((err, doc) => {
    if (err) return console.error(err);
    console.log('Document inserted succussfully!');
    return res.render('userProfilepage', uploadedArtwork, school, (req, res));
  });
  // res.redirect('userProfilepage', uploadedArtwork);
  return res.render('userProfilepage', uploadedArtwork, school, (req, res));
  // });
});

router.get('/get-imgs', (req, res) => {
  artwork.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred: ', err);
    } else {
      const school = findSchoolName(req);

      res.render('userProfilepage', { school, items });
    }
  });
});

// https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js

module.exports = router;
