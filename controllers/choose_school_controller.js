/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
import express from 'express';
import passport from 'passport';
import School from '../models/school.js';
// import User from '../models/user.js';
import configurePassport from '../config/passport.js';

configurePassport(passport);

const router = express.Router();

// GET: list of schools from DB
router.get('/schoollist', async (req, res) => {
  try {
    await School.find(req, {});
    res.json({ done: true });
    console.log('Result : ', req);
  } catch (error) {
    console.log(error);
    res.json({
      message: 'Error finding School Names',
      error,
    });
  }
});

export default router;
