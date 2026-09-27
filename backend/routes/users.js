import { Router } from 'express';
import { getMe, updateMe } from '../controllers/usersController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateUser as updateUserSchema } from '../validation/schemas.js';

const router = Router();
router.use(protect);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Missing or invalid token }
 *   patch:
 *     summary: Update the current user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               avatarUrl: { type: string, nullable: true }
 *     responses:
 *       200: { description: Profile updated }
 *       400: { description: Validation failed }
 */
router.get('/me', getMe);
router.patch('/me', validate(updateUserSchema), updateMe);

export default router;
