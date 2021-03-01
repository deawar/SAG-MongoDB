/* eslint-disable camelcase */
const express = require('express');
const flash = require('express-flash-notification');
const session = require('express-session');
const process = require('process');
const path = require('path');
const multer = require('multer');
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

const router = express.Router();
app.use(express.static(`${__dirname}/public`));
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
  let uploadPath = `./public/upload/${school}/`;
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

// Find Id
function findId(req) {
  let reqvar;
  if (req.user === null || req.user === undefined) {
    reqvar = 'Not Available';
    return reqvar;
  }
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
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: helpers.imageFilter,
}).single('sampleFile');
// eslint-disable-next-line consistent-return

// router.post('/upload', checkAuthenticated, upload.single('sampleFile'), (req, res) => {
router.post('/upload', checkAuthenticated, upload, (req, res) => {
  // let sampleFile;
  console.log('Line 77 file_upload_controller req.user: ', req.user);
  const school = findSchoolName(req);
  let _id;

  // eslint-disable-next-line no-underscore-dangle
  _id = findId(req);
  console.log('====================================');
  console.log('_id: ', _id);
  console.log('====================================');
  let uploadPath = `./public/upload/${school}/`;
  console.log('School: ', school);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  // eslint-disable-next-line camelcase
  const first_name = findFirstName(req);
  console.log('First_name: ', first_name);
  // console.log('Upload_controller req.files: ', req.files);

  // eslint-disable-next-line consistent-return
  console.log('File_upload_controller File res.files: ', req.file);

  // Display uploaded image for user validation
  const displayPath = `/upload/${_id}-${req.file.originalname}`;
  res.render('userProfilepage', req.user);
  // res.send(`You have uploaded this image: <hr/><img src="${displayPath}" width="500"><hr /><a href="/profile">Upload another image</a>`);
});

// https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js

module.exports = router;
