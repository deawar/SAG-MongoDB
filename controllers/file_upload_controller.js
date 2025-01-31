import express from 'express';
import flash from 'express-flash-notification';
import bodyParser from 'body-parser';
import multer from 'multer';
import passport from 'passport';
import fs from 'fs';
import { ObjectId } from 'bson';
import Artwork from '../models/artwork.js';
import School from '../models/school.js';
import User from '../models/user.js';
import Bid from '../models/bid.js';
import helpers from '../config/helpers.js';
import { checkAuthenticated } from '../config/middleware/isAuthenticated.js';
import asyncMiddleware from '../config/middleware/asyncMiddleware.js';

// const { ObjectId } = pkg; // Removed redundant declaration

const app = express();
import passportConfig from '../config/passport.js';
passportConfig(passport);

const router = express.Router();
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Find school Fx
function findSchoolName(req) {
  let school;
  if (req.user === null || req.user === undefined) {
    school = 'Make Art, Have Fun!';
    return school;
  }
  school = req.user.school;
  const uploadPath = `./public/upload/${school}/`;
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }
  return school;
}

// Find Email Fx
function findEmail(req) {
  let email;
  if (req.user === null || req.user === undefined) {
    email = 'Not Found';
    return email;
  }
  email = req.user.email;
  return email;
}

// Find Role Fx
function findRole(req) {
  let role;
  if (req.user === null || req.user === undefined) {
    role = 'Not Found';
    return role;
  }
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
  if (req.user === null || req.user === undefined) {
    return { error: 'Not Found' };
  }
  const { role } = req.user;
  if (role === 'student') {
    return { artist_email_input: findEmail(req) };
  } if (role === 'admin') {
    return { school: findSchoolName(req) };
  }
  return { school: findSchoolName(req), approved: true };
}

// Find first_name Fx
function findFirstName(req) {
  let first_name;
  if (req.user === null || req.user === undefined) {
    first_name = 'Your';
    return first_name;
  }
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
  reqvar = req.user._id;
  return reqvar;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `./public/upload/${findSchoolName(req)}`);
  },
  filename(req, file, cb) {
    cb(null, `${findId(req)}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100000000 },
  fileFilter: helpers.imageFilter,
}).single('sampleFile');

router.post('/upload', checkAuthenticated, upload, (req, res) => {
  console.log('====================================');
  console.log('Line 101---------->price_input sent in req.body.price_input: ', req.body.price_input);
  console.log('Line 102 ==>file_upload_controller req.body: ', req.body);
  console.log('====================================');
  const school = findSchoolName(req);
  console.log('----***>>>School: ', school);
  const _id = findId(req);
  console.log('_id: ', _id);
  console.log('====================================');
  app.use(express.static(`public/upload/${school}`));
  console.log('line 149-->School: ', school);
  const uploadPath = `./public/upload/${school}/`;
  console.log('$$$$ Upload Path: ', uploadPath);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  console.log('line 129-->File_name: ', req.file.filename);
  const fileExt = getFileType(req.file.filename);
  console.log('line 131------>File Extension: ', fileExt);

  const newArtwork = new Artwork({
    artist_firstname_input: req.body.artist_firstname_input,
    artist_lastname_input: req.body.artist_lastname_input,
    artist_email_input: req.body.artist_email_input,
    art_name_input: req.body.art_name_input,
    depth: req.body.d_size_input,
    description_input: req.body.description_input,
    medium_input: req.body.medium_input,
    approved: req.body.approved,
    img: {
      data: fs.readFileSync(`./public/upload/${school}/${_id}-${req.file.originalname}`),
      contentType: `image/${fileExt}`,
    },
  });
  console.log('+++++++++++++++++++>Line 156 newArtwork: ', newArtwork);
  const uploadedArtwork = `<img src="${uploadPath}${_id}-${req.file.originalname}" width="200">`;

  newArtwork.save()
    .then((artwork) => {
      console.log('Document inserted succussfully!', artwork);
      res.status(200).send(artwork);
    })
    .catch((error) => {
      console.error('Line 166->in catch error block', error);
      res.status(400).send('Bad Request');
    });
});

router.get('/get-imgs', checkAuthenticated, (req, res) => {
  const role = findRole(req);
  let artInfo = {};
  const query = setQuery(req);
  console.log('Email: ', query);
  Artwork.find(query, (err, items) => {
    if (err) {
      console.log(err);
      return res.status(404).json({
        err: 'No files exist',
      });
    }
    const pics = [];
    for (let i = 0; i < items.length; ++i) {
      console.log('get/imgs===============> items[i]._id: ', items[i]._id);
      let base = Buffer.from(items[i].img.data);
      let conversion = base.toString('base64');
      let images = `data:${items[i].img.contentType};base64, ${conversion}`;
      console.log(`get/imgs-------------> items[${i}].img.data: `, items[i].img.data);
      artInfo = {
        artId: items[i]._id,
        artistFirstName: items[i].artist_firstname_input,
        artistLastName: items[i].artist_lastname_input,
        artistEmail: items[i].artist_email_input,
        artDesc: items[i].description_input,
        artMedium: items[i].medium_input,
        artHeight: items[i].height,
        artDepth: items[i].depth,
        artPrice: items[i].price,
        artApproved: items[i].approved,
        artReviewer: role,
      };
      pics.push(artInfo);
      base = Buffer.from(items[i].img.data);
      conversion = base.toString('base64');
      images = `data:${items[i].img.contentType};base64, ${conversion}`;
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
    }
    console.log('Line 255 file_upload_controller *********> # of images: ', items.length);
    return res.status(200).send(pics);
  });
});

// Approval button by _id
router.post('/approve', checkAuthenticated, (req, res) => {
  console.log('req.body: ', req.body._id);
  const query = `${req.body._id}`;
  const options = { new: true };
  console.log('query: ', query);
  Artwork.findByIdAndUpdate(query, { $set: { approved: true } }, options, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send('Bad Request');
    } else {
      console.log('Artwork approved!', data);
      res.status(200).send(data);
    }
  });
});

// Delete artwork by _id
router.post('/delete/', checkAuthenticated, (req, res) => {
  Artwork.findByIdAndDelete(req.params.id, req.body, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send('Bad Request');
    } else {
      console.log('Data Deleted!');
      res.send(data);
    }
  });
  const query = `${req.body._id}`;
  const options = { new: true };
  console.log('got Bid: ', req.body);
  const currentbid = req.body.bid;
  Artwork.findByIdAndUpdate(req.params.id, { currentbid }, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send('Bad Request');
    } else {
      res.status(200).send(data);
    }
  });
});

router.get('/get-bid-img', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated()) {
    const pics = [];
    let artInfo = {};
    const query = setQuery(req);
    console.log('Art ID: ', query);
    Artwork.find(query, (err, items) => {
      if (!items || items.length === 0) {
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
        console.log(`line 387 get/bid-img-------------> items[${i}].img.data: `, items[i].img.data);
        artInfo = {
          artId: items[i]._id,
          artistFirstName: items[i].artist_firstname_input,
          artistLastName: items[i].artist_lastname_input,
          artistEmail: items[i].artist_email_input,
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
        console.log('------------->artInfo after artInfo push: ', artInfo);
      }
      return res.status(200).send(pics);
    });
  }
});

export default router;
