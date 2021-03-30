/* eslint-disable camelcase */
/* eslint-disable consistent-return */
function authRole(role) {
  return (req, res, next) => {
    if (req.User.role !== 'admin' || req.User.role !== 'student' || req.User.role !== 'bidder') {
      res.status(401);
      return res.send('User is not Authorized..');
    }
    next();
  };
}

module.exports = authRole;
