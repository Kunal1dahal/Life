import express from 'express';
import {
  getClickMessages,
  getClickMessage,
  createClickMessage,
  deleteClickMessage
} from '../controllers/clickController.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getClickMessages)
  .post(uploadImage.single('media'), createClickMessage);

router.route('/:id')
  .get(getClickMessage)
  .delete(deleteClickMessage);

export default router;