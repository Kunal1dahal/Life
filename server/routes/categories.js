import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(validate('category'), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(validate('category'), updateCategory)
  .delete(deleteCategory);

export default router;