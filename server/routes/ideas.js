import express from 'express';
import {
  getIdeas,
  getIdea,
  createIdea,
  updateIdea,
  deleteIdea
} from '../controllers/ideaController.js';
import { validate } from '../middleware/validation.js';
import { uploadFile } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getIdeas)
  .post(uploadFile.array('attachments', 10), validate('idea'), createIdea);

router.route('/:id')
  .get(getIdea)
  .put(uploadFile.array('attachments', 10), validate('idea'), updateIdea)
  .delete(deleteIdea);

export default router;