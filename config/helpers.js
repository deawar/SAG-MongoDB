const imageFilter = function(req, file, cb) {
  // Accept images only
  console.log('helpers file req.files: ', req.files);
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  return cb(null, true);
};
exports.imageFilter = imageFilter;
