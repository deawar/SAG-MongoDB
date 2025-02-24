// export { checkAuthenticated, checkNotAuthenticated };
// isAuthenticated.js

/**
 * Middleware for protecting routes that require authentication
 * Checks if a user is logged in before allowing access to restricted routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const checkAuthenticated = (req, res, next) => {
  // Check if user is authenticated through Passport.js
  if (req.isAuthenticated()) {
    console.log('User is authenticated - proceeding to restricted route');
    return next();
  }

  // User is not authenticated - redirect to signup
  console.log('User is not authenticated - redirecting to signup');
  res.status(403);
  return res.redirect('/signup');
};

/**
* Middleware for public routes that should not be accessible when logged in
* Redirects authenticated users away from login/signup pages
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @param {Function} next - Express next middleware function
* @returns {void}
*/
const checkNotAuthenticated = (req, res, next) => {
  // If user is already logged in, redirect to home
  if (req.isAuthenticated()) {
    console.log('Authenticated user attempting to access public route - redirecting to home');
    return res.redirect('/');
  }

  // User is not logged in - allow access to public route
  console.log('User accessing public route - proceeding');
  return next();
};

// Export both middleware functions
export { checkAuthenticated, checkNotAuthenticated };
