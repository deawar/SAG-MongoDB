/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
const express = require('express');
const passport = require('passport');
const School = require('../models/school');
// const User = require('../models/user');
require('../config/passport')(passport);

const router = express.Router();

module.exports = function (router) {
  // GET: list of schools from DB
  router.get('/schoollist', async (req, res) => {
    // if (req.isAuthenticated()) {
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

    // School.find()
    //   // .sort({ 'School Name': 1 })
    //   .exec()
    //   .then((docs) => res.status(200)
    //     .json(docs))
    //   .catch((err) => res.status(500)
    //     .json({
    //       message: 'Error finding School Names',
    //       error: err,
    //     }));
    // }  else {
    //     // eslint-disable-next-line no-unused-vars
    //     const school = {
    //     id: null,
    //     isloggedin: req.isAuthenticated(),
    //     };
    //     res.redirect('/');
    // }
  });
};
module.exports = router;
