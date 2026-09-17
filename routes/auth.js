const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, profile } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { register: registerSchema, login: loginSchema } = require('../validation/schemas');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Ayaan }
 *               email: { type: string, example: ayaan@example.com }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Validation failed }
 *       409: { description: Email already registered }
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: ayaan@example.com }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Missing or invalid token }
 */
router.get('/profile', protect, profile);

module.exports = router;
