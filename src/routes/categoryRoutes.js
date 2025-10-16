import express from 'express';
import { getCategories } from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Category routes - only GET is available since categories are now fixed
router.get('/', getCategories);

export default router;
