/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const os = require('os');
const User = require('../models/user');
const db = require('../models/index');

require('../config/passport')(passport);
const { checkAuthenticated } = require('../config/middleware/isAuthenticated');

const router = express.Router();
// ROUTE TO GET USER DETAILS OF SIGNED IN USER
router.get('/profile', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated()) {
    // try {
    console.log('Profile_controller req: ', req.session.passport.user);
    console.log('Profile req.session: ', req.session);
    // eslint-disable-next-line no-underscore-dangle
    // const id = req.session.passport.user;
    console.log('req.user: ', req.user);
    console.log('req.user.active: ', req.user.active);
    const userInfo = {
      id: req.session.passport.user,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      address1: req.user.address[0].address1,
      address2: req.user.address[0].address2,
      city: req.user.address[0].city,
      state: req.user.address[0].state,
      zip: req.user.address[0].zip,
      email: req.user.email,
      phone: req.user.phone,
      school: req.user.school,
      role: req.user.role[0].role,
      active: req.user.active,
      isloggedin: req.isAuthenticated(),
    };
    // const { school } = userInfo;
    // if (userInfo.active === false) {
    //   res.render('verifytoken', userInfo);
    // }
    if (userInfo.role === 'student') {
      res.render('userProfilepage', userInfo);
    } else if (userInfo.role === 'admin') {
      res.render('adminProfilepage', userInfo);
    } else {
      res.render('bidderProfilepage', userInfo);
    }
  } else {
  // eslint-disable-next-line no-unused-vars
    const userInfo = {
      id: null,
      isloggedin: req.isAuthenticated(),
    };
    res.redirect('/');
  }
});

// ROUTER TO DELETE ACCOUNT
router.delete('/user/:account_id/:email', (req, res) => {
  console.log(`id: ${req.params.account_id}`);
  console.log(`email: ${req.params.email}`);
  User.findOneAndDelete({ id: req.params.account_id, email: req.params.email }, function (err) {
    if (err) console.log(err);
    console.log('Successful Account Deleteion');
  })
    .then(id => res.status(200).end());
});

// ROUTER TO UPDATE ACCOUNT
router.put('/user/:account_id', (req, res) => {
  console.log(req.body);
  db.User.update({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    address: req.body.address1,
    address2: req.body.address2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    school: req.body.school,
    email: req.body.email,
    phone: req.body.phone,
  }, {
    where: {
      id: req.params.account_id,
    },
  }).then((dbuser) => {
    res.json(dbuser);
  });
});

// PROFILE SEARCH BY ADMIN

router.get('/searchuser/:email', async (req, res) => {
  try {
    const query = req.params.email;
    await db.User.findOne(query, Users.email, {
      replacements: { email: req.params.email },
    })
      .then((dbUser) => {
        console.log(dbUser);
        if (!dbUser) {
          res.status(404);
          return res.send('No User Found');
        }
        const newSearch = {
          searchedUser: dbUser[0],
          id: req.params.email,
          roleid: dbUser[0].role_id,
          isloggedin: req.isAuthenticated(),
        };
        console.log(newSearch);
        res.status(200);
        res.json(newSearch);
        // res.render('partials/manageUser', newSearch);
      });
  } catch (error) {
    res.status(404);
    return res.send('No User Found');
  }
});

module.exports = router;
