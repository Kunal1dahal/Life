import { findAll, findById, create, deleteById, saveAttachment, generateId, deleteAttachment } from '../config/fileStorage.js';

// @desc    Get all click messages
// @route   GET /api/clicks
// @access  Public
export const getClickMessages = async (req, res, next) => {
  try {
    const { type } = req.query;
    let messages = findAll('clicks');
    
    if (type) messages = messages.filter(message => message.type === type);
    
    // Sort by creation date (newest first)
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single click message
// @route   GET /api/clicks/:id
// @access  Public
export const getClickMessage = async (req, res, next) => {
  try {
    const message = findById('clicks', req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Click message not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new click message
// @route   POST /api/clicks
// @access  Public
export const createClickMessage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const { file } = req;
    const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
    const filename = `${generateId()}_${file.originalname}`;
    const url = saveAttachment(file, filename);
    
    const messageData = {
      type,
      mediaUrl: url,
      fileName: file.originalname,
      fileSize: file.size,
      filePath: filename
    };
    
    const message = create('clicks', messageData);
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete click message
// @route   DELETE /api/clicks/:id
// @access  Public
export const deleteClickMessage = async (req, res, next) => {
  try {
    const message = findById('clicks', req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Click message not found'
      });
    }
    
    // Delete the file if it exists
    if (message.filePath) {
      deleteAttachment(message.filePath);
    }
    
    deleteById('clicks', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};