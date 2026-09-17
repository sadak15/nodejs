const multer = require('multer');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) return cb(new Error('Only JPEG, PNG, or WEBP images are allowed'));
    cb(null, true);
  }
});

module.exports = { upload };
