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

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/upload/');
    // cb(null, uploadPath);
  },
  // By default, multer removes file extensions so let's add them back
  filename(req, file, cb) {
    // cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: storage, fileFilter: helpers.imageFilter });
// eslint-disable-next-line consistent-return
router.post('/upload', checkAuthenticated, upload.single('sampleFile'), (req, res) => {
  // let sampleFile;
  console.log('Line 65 file_upload_controller req.user: ', req.user);
  const school = findSchoolName(req);
  let uploadPath = `./public/upload/${school}/`;
  console.log('School: ', school);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  // eslint-disable-next-line camelcase
  const first_name = findFirstName(req);
  console.log('First_name: ', first_name);
  // console.log('Upload_controller req.files: ', req.files);
  // let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('sampleFile');
  // eslint-disable-next-line consistent-return
  console.log('File_upload_controller File res.files: ', req.file);

  // Display uploaded image for user validation
  const displayPath = `/upload/${req.file.originalname}`;
  res.send(`You have uploaded this image: <hr/><img src="${displayPath}" width="500"><hr /><a href="/profile">Upload another image</a>`);
});
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send('No files were uploaded.');
//   }
//   req.upload(req.files, (uploadErr) => {
//     if (uploadErr) {
//       console.log('No files were uploaded.', err);
//       return next(uploadErr);
//     }
//   });
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  // eslint-disable-next-line prefer-destructuring
//   sampleFile = req.files.sampleFile;
//   console.log('Is there a file: ', req.files, req.files.sampleFile.name);
//   uploadPath = `__dirname + './public/upload/${school}/${sampleFile.name}`;
//   // eslint-disable-next-line consistent-return
//   console.log('uploadPath: ', uploadPath);
  // https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js
//   if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath);
//     sampleFile.mv(uploadPath, (err) => {
//       if (err) return res.status(500).send(err);
//       return res.render('profile', { title: 'Profile', school, first_name });
//     });
//   }
//   return res.write(`upload of file ${sampleFile.name} complete`);
//   // status(200);
// });

module.exports = router;
