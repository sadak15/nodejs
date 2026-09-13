const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

router.get('/dashboard', protect, authorize('admin'), (req, res) => {
  res.json({ message: `Welcome to the admin dashboard, ${req.user.name}` });
});

module.exports = router;
