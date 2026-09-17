const express = require('express');
const mongoose = require('mongoose');
const {
  createTransaction, listTransactions, getTransaction, updateTransaction, deleteTransaction, monthlySummary
} = require('../controllers/transactionsController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createTransaction: createSchema, updateTransaction: updateSchema, monthlySummaryQuery } = require('../validation/schemas');

const router = express.Router();
router.use(protect);

router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid transaction id' });
  next();
});

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Add a new income or expense transaction
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, amount, type, category]
 *             properties:
 *               title: { type: string, example: Groceries }
 *               amount: { type: number, example: -50 }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string, example: Food }
 *               date: { type: string, format: date, example: "2025-05-27" }
 *     responses:
 *       201: { description: Transaction created }
 *       400: { description: Validation failed }
 *   get:
 *     summary: List the current user's transactions
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of transactions }
 */
router.post('/', validate(createSchema), createTransaction);
router.get('/', listTransactions);

/**
 * @swagger
 * /transactions/monthly-summary:
 *   get:
 *     summary: Total income/expense per category for a given month
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Monthly summary }
 */
router.get('/monthly-summary', validate(monthlySummaryQuery, 'query'), monthlySummary);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get one transaction
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction updated }
 *       404: { description: Not found }
 *   delete:
 *     summary: Remove a transaction
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction deleted }
 *       404: { description: Not found }
 */
router.get('/:id', getTransaction);
router.put('/:id', validate(updateSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
