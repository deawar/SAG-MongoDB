/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const express = require('express');
const flash = require('express-flash-notification');
const bodyParser = require('body-parser');
const multer = require('multer');
const passport = require('passport');
const fs = require('fs');
const { ObjectId } = require('bson');
const Artwork = require('../models/artwork');
const School = require('../models/school');
const User = require('../models/user');
const Bid = require('../models/bid');

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

// Find Email Fx
function findEmail(req) {
  // eslint-disable-next-line prefer-destructuring
  let email;
  if (req.user === null || req.user === undefined) {
    email = 'Not Found';
    return email;
  }
  // eslint-disable-next-line prefer-destructuring
  email = req.user.email;
  return email;
}

// Find Role Fx
function findRole(req) {
  // eslint-disable-next-line prefer-destructuring
  let role;
  if (req.user === null || req.user === undefined) {
    role = 'Not Found';
    return role;
  }
  // eslint-disable-next-line prefer-destructuring
  role = req.user.role;
  if (role === 'student') {
    role = 'student';
    return role;
  }
  if (role === 'admin') {
    role = 'admin';
    return role;
  }
  role = 'bidder';
  return role;
}

// Set Query based on Role Fx
function setQuery(req) {
  // eslint-disable-next-line prefer-destructuring
  let role;
  let query;
  if (req.user === null || req.user === undefined) {
    role = 'Not Found';
    return role;
  }
  // eslint-disable-next-line prefer-destructuring
  role = req.user.role;
  if (role === 'student') {
    query = { artist_email_input: findEmail(req) };
    return query;
  }
  if (role === 'admin') {
    // const query = { school: findSchoolName(req), approved: true };
    query = { school: findSchoolName(req) };
    return query;
  }
  role = 'bidder';
  query = { school: findSchoolName(req), approved: true };
  return query;
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
  console.log('line 129-->File_name: ', req.file.filename);
  const fileExt = getFileType(req.file.filename);
  console.log('line 131------>File Extension: ', fileExt);

  const displayPath = uploadPath;
  const newArtwork = new Artwork({
    artist_firstname_input: req.body.artist_firstname_input,
    artist_lastname_input: req.body.artist_lastname_input,
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
  console.log('+++++++++++++++++++>Line 156 newArtwork: ', newArtwork);
  const uploadedArtwork = `<img src="${displayPath}" width="200">`;

  newArtwork.save()
    .then((artwork) => {
      console.log('Document inserted succussfully!', artwork);
      // eslint-disable-next-line max-len
      // res.locals.message = req.flash('success', `Document ${artwork.art_name_input} inserted succussfully!`);
      res.status(200);
    })
    .catch((error) => {
      console.error('Line 166->in catch error block', error);
      res.send(400, 'Bad Request');
    });
});

const newArtwork = require('../models/artwork');

router.get('/get-imgs', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated()) {
    const role = findRole(req);
    const pics = [];
    let artInfo = {};
    const query = setQuery(req);
    // const query = { artist_email_input: findEmail(req) }; //<--check role here
    console.log('Email: ', query);
    newArtwork.find(query, (err, items) => {
      if (!items || items.length === 0) {
        console.log(err);
        return res.status(404).json({
          err: 'No files exist',
        });
      }
      console.log('*********> # of images: ', items.length);
      for (let i = 0; i < items.length; ++i) {
        console.log('get/imgs===============> items[i]._id: ', items[i]._id);
        const base = Buffer.from(items[i].img.data);
        const conversion = base.toString('base64');
        const images = `data:${items[i].img.contentType};base64, ${conversion}`;
        console.log(`get/imgs-------------> items[${i}].img.data: `, items[i].img.data);
        artInfo = {
          artId: items[i]._id,
          artistFirstName: items[i].artist_firstname_input,
          artistLastName: items[i].artist_lastname_input,
          artistEmail: items[i].artist_email_input,
          artName: items[i].art_name_input,
          artDesc: items[i].description_input,
          artMedium: items[i].medium_input,
          artHeight: items[i].height,
          artWidth: items[i].width,
          artDepth: items[i].depth,
          artPrice: items[i].price,
          artApproved: items[i].approved,
          artReviewer: role,
        };
        pics.push(artInfo);
        pics.push(images);
        console.log('------------->artInfo after artInfo push: ', artInfo);
        console.log('------------->pics after artInfo push: ', pics[i].artId);
      }
      return res.status(200).send(pics);
    });
  }
});

// Gallery Image download
router.get('/get-gallery-imgs', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated()) {
    const pics = [];
    let artInfo = {};
    const galleryschool = { school: findSchoolName(req), approved: true };
    const query = galleryschool;
    console.log('Line 247 file_upload_controller school_input: ', query);
    newArtwork.find(query, (err, items) => {
      if (!items || items.length === 0) {
        console.log(err);
        return res.status(404).json({
          err: 'No files exist',
        });
      }
      console.log('Line 255 file_upload_controller *********> # of images: ', items.length);
      for (let i = 0; i < items.length; ++i) {
        console.log('get/imgs===============> items[i]._id: ', items[i]._id);
        const base = Buffer.from(items[i].img.data);
        const conversion = base.toString('base64');
        const images = `data:${items[i].img.contentType};base64, ${conversion}`;
        console.log(`get/imgs-------------> items[${i}].img.data: `, items[i].img.data);
        artInfo = {
          artId: items[i]._id,
          artistFirstName: items[i].artist_firstname_input,
          artistLastName: items[i].artist_lastname_input,
          artistEmail: items[i].artist_email_input,
          artName: items[i].art_name_input,
          artDesc: items[i].description_input,
          artMedium: items[i].medium_input,
          artHeight: items[i].height,
          artWidth: items[i].width,
          artDepth: items[i].depth,
          artPrice: items[i].price,
          artApproved: items[i].approved,
        };
        pics.push(artInfo);
        pics.push(images);
        console.log('Line 278 file_upload_controller------------->artInfo after artInfo push: ', artInfo);
        console.log('Line 279 file_upload_controller------------->pics after artInfo push: ', pics[i].artId);
      }
      return res.status(200).send(pics);
    });
  }
});

// Approval button by _id
router.post('/approve', checkAuthenticated, (req, res) => {
  console.log('req.body: ', req.body._id);
  // const query = { _id: `ObjectId('${req.body._id}')` };
  const query = `${req.body._id}`;
  const options = { new: true };
  console.log('query: ', query);
  // newArtwork.findByIdAndUpdate((req.params.id, req.body),
  newArtwork.findByIdAndUpdate(query, { $set: { approved: true } }, options, (err, data) => {
    if (err) {
      console.log(err);
      res.send(400, 'Bad Request');
    }
    console.log('Artwork approved!', data);
    res.status(200).send(data);
  });
});

// --------------------- Delete artwork by _id --------------------- //
router.post('/delete/', checkAuthenticated, (req, res) => {
  console.log('req.body: ', req.body);
  newArtwork.findByIdAndDelete((req.params.id, req.body),
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Data Deleted!');
        res.send(data);
      }
    });
});

// https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js

// ----------------------- Bid Button Gallery --------------------- //
router.post('/add-bid', checkAuthenticated, (req, res) => {
  console.log('got Bid: ', req.body);
  const currentbid = req.body.bid;
  newArtwork.findByIdAndUpdate((req.params.id, req.body), { currentbid },
    (err, data) => {
      if (err) {
        console.log(err);
        res.send(400, 'Bad Request');
      } else {
        console.log('Bid added to Artwork id: ', req.params.id);
        res.status(200).send(data);
      }
    });
});
module.exports = router;
