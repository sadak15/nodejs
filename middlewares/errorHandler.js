const multer = require('multer');

exports.notFound = (req, res) => res.status(404).json({ message: 'Route not found' });

exports.errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  if (err instanceof multer.MulterError || /^Only JPEG/.test(err.message || '')) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};
