import express from 'express';
import {
  getJourneyNodes,
  getJourneyNode,
  createJourneyNode,
  updateJourneyNode,
  deleteJourneyNode
} from '../controllers/journeyController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.route('/')
  .get(getJourneyNodes)
  .post(validate('journeyNode'), createJourneyNode);

router.route('/:id')
  .get(getJourneyNode)
  .put(validate('journeyNode'), updateJourneyNode)
  .delete(deleteJourneyNode);

export default router;