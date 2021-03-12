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
app.use(flash());
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
  limits: { fileSize: 100000000 },
  fileFilter: helpers.imageFilter,
}).single('sampleFile');

// router.post('/upload', checkAuthenticated, upload.single('sampleFile'), (req, res) => {
router.post('/upload', checkAuthenticated, upload, (req, res) => {
  console.log('====================================');
  console.log('Line 101---------->price_input sent in req.body.price_input: ', req.body.price_input);
  console.log('Line 102 ==>file_upload_controller req.body: ', req.body);
  console.log('Line 103 ===>File_upload_controller File res.files: ', req.files);
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
  console.log('line 122------>File Extension: ', fileExt);

  const displayPath = uploadPath;
  const newArtwork = new Artwork({
    artist_email_input: req.body.artist_email_input,
    art_name_input: req.body.art_name_input,
    depth: req.body.d_size_input,
    description_input: req.body.description_input,
    height: req.body.h_size_input,
    medium_input: req.body.medium_input,
    price: req.body.price_input,
    width: req.body.w_size_input,
    school: req.body.school_input,
    approved: req.body.approved,
    img: {
      // eslint-disable-next-line max-len
      // data: fs.readFileSync(path.join(`${__dirname}/public/upload/${findSchoolName(req)}/${findId(req)}-${req.file.originalname}`)),
      data: fs.readFileSync(`./public/upload/${findSchoolName(req)}/${findId(req)}-${req.file.originalname}`),
      contentType: `image/${fileExt}`,
    },
  });
  // newArtwork.create(newArtwork, (err, item) => {
  //   if (err) {
  console.log('Line 145 newArtwork: ', newArtwork);
  const uploadedArtwork = `<img src="${displayPath}" width="200">`;

  newArtwork.save()
    .then((doc) => {
      console.log('Document inserted succussfully!', doc);
      res.locals.message = req.flash('success', 'Document inserted succussfully!');
      return res.end('/userProfilepage', checkAuthenticated, (req, res));
    })
    .catch((err) => console.error(err));
});
// res.redirect('userProfilepage', uploadedArtwork);
// return res.render('userProfilepage', uploadedArtwork, school, (req, res));
// });
// });

router.get('/get-imgs', checkAuthenticated, (req, res, next) => {
  if (req.isAuthenticated()) {
    const getArtwork = new Artwork();
    getArtwork.find({}, (err, items) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      const school = findSchoolName(req);
      const getArtwork = {
        id: req.session.passport.user,
        artist_email: req.getArtwork.email,
        depth: req.getArtwork.depth,
        description_input: req.getArtwork.description_input,
        height: req.getArtwork.h_size_input,
        width: req.getArtwork.w_size_input,
        medium_input: req.getArtwork.medium_input,
        price: req.getArtwork.price_input,
        school: req.getArtwork.school_input,
        approved: req.getArtwork.approved,
        img: req.getArtwork.img,
      }
        

      res.render('userProfilepage', { school, items });
      
    });
  }
});

// https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js

module.exports = router;
