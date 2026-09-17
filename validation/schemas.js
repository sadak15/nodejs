const { z } = require('zod');

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

const register = z.object({
  name: z.string().trim().min(1).max(100),
  email,
  password: z.string().min(6).max(72),
  role: z.literal('user').optional()
});

const login = z.object({
  email,
  password: z.string().min(1)
});

const transactionBase = {
  title: z.string().trim().min(1).max(200),
  amount: z.number().finite().refine(n => n !== 0, 'Amount cannot be zero'),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(1).max(100),
  date: z.coerce.date().optional()
};

const createTransaction = z.object(transactionBase);
const updateTransaction = z.object(transactionBase).partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' }
);

const monthlySummaryQuery = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional()
});

const createCategory = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(['income', 'expense', 'both']).optional()
});

module.exports = {
  register, login, createTransaction, updateTransaction, monthlySummaryQuery, createCategory
};
