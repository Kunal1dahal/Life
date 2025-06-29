import { findAll, findById, create, updateById, deleteById } from '../config/fileStorage.js';

// @desc    Get all journal entries
// @route   GET /api/journal
// @access  Public
export const getJournalEntries = async (req, res, next) => {
  try {
    const { tags, mood } = req.query;
    let entries = findAll('journal');
    
    // Apply filters
    if (tags) {
      const tagArray = tags.split(',');
      entries = entries.filter(entry => 
        entry.tags && entry.tags.some(tag => tagArray.includes(tag))
      );
    }
    if (mood) entries = entries.filter(entry => entry.mood === mood);
    
    // Sort by creation date (newest first)
    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journal entry
// @route   GET /api/journal/:id
// @access  Public
export const getJournalEntry = async (req, res, next) => {
  try {
    const entry = findById('journal', req.params.id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new journal entry
// @route   POST /api/journal
// @access  Public
export const createJournalEntry = async (req, res, next) => {
  try {
    const entry = create('journal', req.body);
    
    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
// @access  Public
export const updateJournalEntry = async (req, res, next) => {
  try {
    const entry = updateById('journal', req.params.id, req.body);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Public
export const deleteJournalEntry = async (req, res, next) => {
  try {
    const deleted = deleteById('journal', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};