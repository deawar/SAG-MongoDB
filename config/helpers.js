const path = require('path');

const imageFilter = function (req, file, cb) {
  // Accept images only
  // Allowed ext
  const filetypes = /(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('Only image files are allowed!');
  return cb(new Error('Only image files are allowed!'), false);
};
exports.imageFilter = imageFilter;
