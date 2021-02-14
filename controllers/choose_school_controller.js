/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
const express = require('express');
const passport = require('passport');
const School = require('../models/school');
const User = require('../models/user');
require('../config/passport')(passport);

const router = express.Router();

module.exports = function (router) {
  // GET: list of schools from DB
  router.get('/schoollist', function (req, res, next) {
    passport.authenticate('local-signup', (err, user, info) => {
      if (err) {
        console.log('passport err', err);
        return next(err);
      }
    });
    School.find()
      // .sort({ 'School Name': 1 })
      .exec()
      .then((docs) => res.status(200)
        .json(docs))
      .catch((err) => res.status(500)
        .json({
          message: 'Error finding School Names',
          error: err,
        }));
  });
};

module.exports = router;
