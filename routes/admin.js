const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const { overview } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', (req, res) => {
  res.json({ message: `Welcome to the admin dashboard, ${req.user.name}` });
});

/**
 * @swagger
 * /admin/overview:
 *   get:
 *     summary: Total users and top spending categories across all users
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin overview }
 *       403: { description: Admin role required }
 */
router.get('/overview', overview);

module.exports = router;
