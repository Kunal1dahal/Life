import { findAll, findById, create, updateById, deleteById, saveAttachment, generateId, deleteAttachment } from '../config/fileStorage.js';

// @desc    Get all ideas
// @route   GET /api/ideas
// @access  Public
export const getIdeas = async (req, res, next) => {
  try {
    const { category, status, priority } = req.query;
    let ideas = findAll('ideas');
    
    // Apply filters
    if (category) ideas = ideas.filter(idea => idea.category === category);
    if (status) ideas = ideas.filter(idea => idea.status === status);
    if (priority) ideas = ideas.filter(idea => idea.priority === priority);
    
    // Populate category data
    const categories = findAll('categories');
    const ideasWithCategory = ideas.map(idea => {
      const categoryData = categories.find(cat => cat._id === idea.category);
      return {
        ...idea,
        category: categoryData ? {
          _id: categoryData._id,
          name: categoryData.name,
          emoji: categoryData.emoji,
          color: categoryData.color
        } : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: ideasWithCategory.length,
      data: ideasWithCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single idea
// @route   GET /api/ideas/:id
// @access  Public
export const getIdea = async (req, res, next) => {
  try {
    const idea = findById('ideas', req.params.id);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea not found'
      });
    }
    
    // Populate category data
    const categories = findAll('categories');
    const categoryData = categories.find(cat => cat._id === idea.category);
    const ideaWithCategory = {
      ...idea,
      category: categoryData ? {
        _id: categoryData._id,
        name: categoryData.name,
        emoji: categoryData.emoji,
        color: categoryData.color
      } : null
    };
    
    res.status(200).json({
      success: true,
      data: ideaWithCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new idea
// @route   POST /api/ideas
// @access  Public
export const createIdea = async (req, res, next) => {
  try {
    const ideaData = { ...req.body };
    
    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      ideaData.attachments = req.files.map(file => {
        const filename = `${generateId()}_${file.originalname}`;
        const url = saveAttachment(file, filename);
        
        return {
          _id: generateId(),
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
          url: url,
          path: filename
        };
      });
    } else {
      ideaData.attachments = [];
    }
    
    const idea = create('ideas', ideaData);
    
    // Populate category data for response
    const categories = findAll('categories');
    const categoryData = categories.find(cat => cat._id === idea.category);
    const ideaWithCategory = {
      ...idea,
      category: categoryData ? {
        _id: categoryData._id,
        name: categoryData.name,
        emoji: categoryData.emoji,
        color: categoryData.color
      } : null
    };
    
    res.status(201).json({
      success: true,
      data: ideaWithCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update idea
// @route   PUT /api/ideas/:id
// @access  Public
export const updateIdea = async (req, res, next) => {
  try {
    const existingIdea = findById('ideas', req.params.id);
    if (!existingIdea) {
      return res.status(404).json({
        success: false,
        error: 'Idea not found'
      });
    }
    
    const updateData = { ...req.body };
    
    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => {
        const filename = `${generateId()}_${file.originalname}`;
        const url = saveAttachment(file, filename);
        
        return {
          _id: generateId(),
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
          url: url,
          path: filename
        };
      });
      
      // Merge with existing attachments
      updateData.attachments = [...(existingIdea.attachments || []), ...newAttachments];
    }
    
    const idea = updateById('ideas', req.params.id, updateData);
    
    // Populate category data for response
    const categories = findAll('categories');
    const categoryData = categories.find(cat => cat._id === idea.category);
    const ideaWithCategory = {
      ...idea,
      category: categoryData ? {
        _id: categoryData._id,
        name: categoryData.name,
        emoji: categoryData.emoji,
        color: categoryData.color
      } : null
    };
    
    res.status(200).json({
      success: true,
      data: ideaWithCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete idea
// @route   DELETE /api/ideas/:id
// @access  Public
export const deleteIdea = async (req, res, next) => {
  try {
    const idea = findById('ideas', req.params.id);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea not found'
      });
    }
    
    // Delete attachments if any
    if (idea.attachments && idea.attachments.length > 0) {
      idea.attachments.forEach(attachment => {
        if (attachment.path) {
          deleteAttachment(attachment.path);
        }
      });
    }
    
    deleteById('ideas', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};