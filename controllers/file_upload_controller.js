import express from 'express';
import flash from 'express-flash-notification';
import bodyParser from 'body-parser';
import multer from 'multer';
import passport from 'passport';
import fs from 'fs';
import { ObjectId } from 'bson';
import path from 'path';
import { fileURLToPath } from 'url';
import Artwork from '../models/artwork.js';
import School from '../models/school.js';
import User from '../models/user.js';
import Bid from '../models/bid.js';
import helpers from '../config/helpers.js';
import { checkAuthenticated } from '../config/middleware/isAuthenticated.js';
import asyncMiddleware from '../config/middleware/asyncMiddleware.js';
import passportConfig from '../config/passport.js';

// const { ObjectId } = pkg; // Removed redundant declaration

const app = express();
passportConfig(passport);

const router = express.Router();

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

// Route to upload files
router.post('/upload', checkAuthenticated, upload, async (req, res) => {
  try {
    console.log('====================================');
    console.log('Line 142---------->price_input sent in req.body.price_input: ', req.body.price_input);
    console.log('Line 143 ==>file_upload_controller req.body: ', req.body);
    console.log('====================================');

    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const school = findSchoolName(req);
    const _id = findId(req);
    const fileExt = getFileType(req.file.filename);

    // Create new artwork with all fields from the form
    const newArtwork = new Artwork({
      artist_firstname_input: req.body.artist_firstname_input,
      artist_lastname_input: req.body.artist_lastname_input,
      artist_email_input: req.body.artist_email_input,
      art_name_input: req.body.art_name_input,
      description_input: req.body.description_input,
      medium_input: req.body.medium_input,
      height: req.body.h_size_input,
      width: req.body.w_size_input,
      depth: req.body.d_size_input,
      price: req.body.price_input,
      school,
      auctionId,
      approved: false,
      img: {
        data: fs.readFileSync(path.join('./public/upload', school, req.file.filename)),
        contentType: `image/${fileExt}`,
      },
    });
    console.log('Saving artwork to database:', {
      filename: req.file.filename,
      contentType: `image/${fileExt}`,
      school,
    });

    const savedArtwork = await newArtwork.save();
    console.log('Artwork saved successfully:', savedArtwork._id);

    // Send back the saved artwork data
    res.status(200).json({
      message: 'Upload successful',
      artwork_name: savedArtwork.art_name_input,
      id: savedArtwork._id,
    });
  } catch (error) {
    console.error('Error in upload:', error);
    res.status(400).json({
      error: error.message || 'Failed to upload artwork',
    });
  }
});

router.get('/get-imgs', checkAuthenticated, async (req, res) => {
  try {
    const role = findRole(req);
    const query = setQuery(req);
    console.log('Email: ', query);

    const items = await Artwork.find(query);

    if (!items || items.length === 0) {
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

      let artInfo = {
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
        artAuctionId: items[i].auctionId,
        artReviewer: role,
      };
      pics.push(artInfo);

      // Second push with full info
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
        artAuctionId: items[i].auctionId,
        artReviewer: role,
      };
      pics.push(artInfo);
      pics.push(images);
    }

    console.log('Line 258 file_upload_controller *********> # of images: ', items.length);
    return res.status(200).send(pics);
  } catch (error) {
    console.error('Error fetching images:', error);
    return res.status(500).json({
      err: 'Error fetching images',
    });
  }
});

// Approval button by _id
router.post('/approve', checkAuthenticated, async (req, res) => {
  try {
    console.log('req.body: ', req.body._id);
    const query = `${req.body._id}`;
    const options = { new: true };
    console.log('query: ', query);

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      query,
      { $set: { approved: true } },
      options,
    );

    if (!updatedArtwork) {
      return res.status(404).send('Artwork not found');
    }

    console.log('Artwork approved!', updatedArtwork);
    res.status(200).send(updatedArtwork);
  } catch (error) {
    console.error('Error approving artwork:', error);
    res.status(400).send('Bad Request');
  }
});

// Delete artwork by _id
router.post('/delete/', checkAuthenticated, async (req, res) => {
  try {
    const deletedArtwork = await Artwork.findByIdAndDelete(req.params.id);

    if (!deletedArtwork) {
      return res.status(404).send('Artwork not found');
    }

    console.log('Data Deleted!');

    // Update related bid if exists
    const currentId = req.body.bid;
    if (currentId) {
      const updatedArtwork = await Artwork.findByIdAndUpdate(
        req.params.id,
        { currentId },
        { new: true },
      );
      console.log('Updated bid reference:', updatedArtwork);
    }

    res.status(200).send(deletedArtwork);
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(400).send('Bad Request');
  }
});

router.get('/get-bid-img', checkAuthenticated, async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Not authenticated');
    }

    const query = setQuery(req);
    console.log('Art ID: ', query);

    const items = await Artwork.find(query);

    if (!items || items.length === 0) {
      return res.status(404).json({
        err: 'No files exist',
      });
    }

    const pics = [];
    console.log('*********> # of images: ', items.length);

    for (let i = 0; i < items.length; ++i) {
      console.log('get/imgs===============> items[i]._id: ', items[i]._id);
      const base = Buffer.from(items[i].img.data);
      const conversion = base.toString('base64');
      const images = `data:${items[i].img.contentType};base64, ${conversion}`;

      const artInfo = {
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
  } catch (error) {
    console.error('Error fetching bid images:', error);
    return res.status(500).json({
      err: 'Error fetching images',
    });
  }
});

export default router;
