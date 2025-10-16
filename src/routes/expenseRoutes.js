import express from 'express';
import { body } from 'express-validator';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from '../controllers/expenseController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';

const router = express.Router();

// Validation rules
const expenseValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').optional(),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('payment_method').optional(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

// All routes are protected
router.use(authenticate);

// Expense routes
router.post('/', expenseValidation, validate, createExpense);
router.get('/', getExpenses);
router.get('/stats', getExpenseStats);
router.get('/:id', getExpenseById);
router.put('/:id', expenseValidation, validate, updateExpense);
router.delete('/:id', deleteExpense);

export default router;
