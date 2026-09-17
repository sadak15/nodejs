const router = require('express').Router();
const { listCategories, createCategory } = require('../controllers/categoriesController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createCategory: createSchema } = require('../validation/schemas');

router.use(protect);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List predefined and the user's custom categories
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of categories }
 *   post:
 *     summary: Create a custom category
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Side Hustle }
 *               type: { type: string, enum: [income, expense, both] }
 *     responses:
 *       201: { description: Category created }
 *       409: { description: Category already exists }
 */
router.get('/', listCategories);
router.post('/', validate(createSchema), createCategory);

module.exports = router;
