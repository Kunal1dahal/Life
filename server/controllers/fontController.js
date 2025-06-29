import { findAll, create, deleteById, saveAttachment, generateId, deleteAttachment, findById } from '../config/fileStorage.js';

// @desc    Get all editor fonts
// @route   GET /api/fonts
// @access  Public
export const getEditorFonts = async (req, res, next) => {
  try {
    const fonts = findAll('fonts');
    
    // Sort by creation date (newest first)
    fonts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json({
      success: true,
      count: fonts.length,
      data: fonts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new editor font
// @route   POST /api/fonts
// @access  Public
export const uploadEditorFont = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No font file uploaded'
      });
    }
    
    const { file } = req;
    const fontName = file.originalname.replace(/\.[^/.]+$/, '');
    const filename = `${generateId()}_${file.originalname}`;
    const url = saveAttachment(file, filename);
    
    const fontData = {
      name: fontName,
      url: url,
      filePath: filename,
      originalName: file.originalname,
      fileSize: file.size
    };
    
    const font = create('fonts', fontData);
    
    res.status(201).json({
      success: true,
      data: font
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete editor font
// @route   DELETE /api/fonts/:id
// @access  Public
export const deleteEditorFont = async (req, res, next) => {
  try {
    const font = findById('fonts', req.params.id);
    
    if (!font) {
      return res.status(404).json({
        success: false,
        error: 'Font not found'
      });
    }
    
    // Delete the font file
    if (font.filePath) {
      deleteAttachment(font.filePath);
    }
    
    deleteById('fonts', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};