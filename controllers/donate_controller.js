import express from 'express';
import flash from 'express-flash-notification';
import { checkAuthenticated } from '../config/middleware/isAuthenticated.js';
import sag from '../models/user.js';

const router = express.Router();

// Find school Fx
function findSchoolName(res) {
  if (res.req.user.school === null) {
    const school = { school: 'Make Art, Have Fun!' };
    return school;
  }
  const { school } = res.req.user;
  return school;
}

// Find First Name
function findFirstName(res) {
  let first_name;
  if (res.req.user === null || res.req.user === undefined) {
    first_name = 'Your';
    return first_name;
  }
  first_name = (res.req.user.first_name);
  first_name = (`${first_name}'s`);
  return first_name;
}

// Get Current User Role
function findRole(res) {
  let role;
  if (res.req.user === null || res.req.user === undefined) {
    role = '';
    return role;
  }
  role = res.req.user.role;
  return role;
}

// This is get route for login page
router.get('/donate', checkAuthenticated, (req, res) => {
  req.headers.logged = 'true';
  const school = findSchoolName(res);
  const first_name = findFirstName(res);
  const role = findRole(res);
  res.render('donationsPage', {
    title: 'Donations Page',
    school,
    first_name,
    role,
    logged: req.isAuthenticated(),
  });
});

// Export routes for server.js to use.
export default router;
