import { Router } from 'express';
import mongoose from 'mongoose';
import {
  createTask, deleteTask, getTask, listTasks, updateTask
} from '../controllers/tasksController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTask as createSchema, updateTask as updateSchema } from '../validation/schemas.js';

const router = Router();
router.use(protect);

router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid task id' });
  next();
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Write report }
 *               description: { type: string, example: Q3 summary for the team }
 *               status: { type: string, enum: [pending, "in progress", completed] }
 *               dueDate: { type: string, format: date-time, nullable: true }
 *     responses:
 *       201: { description: Task created }
 *       400: { description: Validation failed }
 *   get:
 *     summary: List the current user's tasks
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, "in progress", completed] }
 *     responses:
 *       200: { description: List of tasks }
 */
router.post('/', validate(createSchema), createTask);
router.get('/', listTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get one task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task updated }
 *       404: { description: Not found }
 *   delete:
 *     summary: Remove a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task deleted }
 *       404: { description: Not found }
 */
router.get('/:id', getTask);
router.put('/:id', validate(updateSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
