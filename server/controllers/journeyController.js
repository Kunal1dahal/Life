import { findAll, findById, create, updateById, deleteById } from '../config/fileStorage.js';

// @desc    Get all journey nodes
// @route   GET /api/journey
// @access  Public
export const getJourneyNodes = async (req, res, next) => {
  try {
    const { status } = req.query;
    let nodes = findAll('journey');
    
    if (status) nodes = nodes.filter(node => node.status === status);
    
    // Sort by current date (newest first)
    nodes.sort((a, b) => new Date(b.currentDate) - new Date(a.currentDate));
    
    res.status(200).json({
      success: true,
      count: nodes.length,
      data: nodes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journey node
// @route   GET /api/journey/:id
// @access  Public
export const getJourneyNode = async (req, res, next) => {
  try {
    const node = findById('journey', req.params.id);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Journey node not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: node
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new journey node
// @route   POST /api/journey
// @access  Public
export const createJourneyNode = async (req, res, next) => {
  try {
    const nodeData = {
      ...req.body,
      status: req.body.status || 'pending',
      currentDate: req.body.currentDate || new Date().toISOString(),
      x: req.body.x || 0,
      y: req.body.y || 0
    };
    
    const node = create('journey', nodeData);
    
    res.status(201).json({
      success: true,
      data: node
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update journey node
// @route   PUT /api/journey/:id
// @access  Public
export const updateJourneyNode = async (req, res, next) => {
  try {
    const node = updateById('journey', req.params.id, req.body);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Journey node not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: node
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete journey node
// @route   DELETE /api/journey/:id
// @access  Public
export const deleteJourneyNode = async (req, res, next) => {
  try {
    const deleted = deleteById('journey', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Journey node not found'
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