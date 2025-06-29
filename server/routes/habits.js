import express from 'express';
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  updateHabitEntry,
  deleteHabit
} from '../controllers/habitController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.route('/')
  .get(getHabits)
  .post(validate('habit'), createHabit);

router.route('/:id')
  .get(getHabit)
  .put(validate('habit'), updateHabit)
  .delete(deleteHabit);

router.route('/:id/entries')
  .put(validate('habitEntry'), updateHabitEntry);

export default router;