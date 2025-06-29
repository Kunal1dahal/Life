import express from 'express';
import {
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../controllers/journalController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.route('/')
  .get(getJournalEntries)
  .post(validate('journalEntry'), createJournalEntry);

router.route('/:id')
  .get(getJournalEntry)
  .put(validate('journalEntry'), updateJournalEntry)
  .delete(deleteJournalEntry);

export default router;