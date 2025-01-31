// /* eslint-disable camelcase */
// /* eslint-disable consistent-return */
// function authRole(role) {
//   return (req, res, next) => {
//     if (req.User.role !== 'admin' || req.User.role !== 'student' || req.User.role !== 'bidder') {
//       res.status(401);
//       return res.send('User is not Authorized..');
//     }
//     next();
//   };
// }

// module.exports = authRole;

import authRole from './authRole.js';

// Protect a route requiring admin role
router.get('/admin-dashboard', 
    authRole('admin'),  // Only admins can access
    (req, res) => {
        res.send('Admin Dashboard');
    }
);

// Protect a route requiring any valid role
router.get('/user-area', 
    authRole(),  // Any valid role can access
    (req, res) => {
        res.send('User Area');
    }
);
