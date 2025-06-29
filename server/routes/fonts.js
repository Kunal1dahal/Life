import express from 'express';
import {
  getEditorFonts,
  uploadEditorFont,
  deleteEditorFont
} from '../controllers/fontController.js';
import { uploadFont } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getEditorFonts)
  .post(uploadFont.single('font'), uploadEditorFont);

router.route('/:id')
  .delete(deleteEditorFont);

export default router;