import { z } from 'zod';

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

export const register = z.object({
  name: z.string().trim().min(1).max(100),
  email,
  password: z.string().min(6).max(72),
  role: z.literal('user').optional()
});

export const login = z.object({
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

export const createTransaction = z.object(transactionBase);
export const updateTransaction = z.object(transactionBase).partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' }
);

export const monthlySummaryQuery = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional()
});

export const createCategory = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(['income', 'expense', 'both']).optional()
});

const taskBase = {
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(['pending', 'in progress', 'completed']).optional(),
  dueDate: z.coerce.date().nullable().optional()
};

export const createTask = z.object(taskBase);
export const updateTask = z.object(taskBase).partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' }
);

export const updateUser = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  avatarUrl: z.string().trim().url().nullable().optional()
}).refine(
  data => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' }
);
