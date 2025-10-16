import express from 'express';
import { body } from 'express-validator';
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';

const router = express.Router();

// Validation rules
const budgetValidation = [
  body('category').notEmpty().withMessage('Category is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('period')
    .isIn(['daily', 'weekly', 'monthly', 'yearly', 'custom'])
    .withMessage('Period must be one of: daily, weekly, monthly, yearly, custom'),
  body('start_date').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('end_date').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

// All routes are protected
router.use(authenticate);

// Budget routes
router.post('/', budgetValidation, validate, createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.put('/:id', budgetValidation, validate, updateBudget);
router.delete('/:id', deleteBudget);

export default router;
