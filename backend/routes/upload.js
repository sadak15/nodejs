import { Router } from 'express';
import { uploadProfilePicture } from '../controllers/uploadController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

/**
 * @swagger
 * /upload/profile-picture:
 *   post:
 *     summary: Upload a profile picture to Cloudinary
 *     tags: [Upload]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200: { description: Uploaded avatar URL }
 *       400: { description: Missing or invalid file }
 *       503: { description: Upload not configured }
 */
router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);

export default router;
