import { findAll, findById, create, updateById, deleteById, deleteMany } from '../config/fileStorage.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = findAll('categories');
    
    // Add ideas count for each category
    const ideas = findAll('ideas');
    const categoriesWithCount = categories.map(category => ({
      ...category,
      ideasCount: ideas.filter(idea => idea.category === category._id).length
    }));
    
    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res, next) => {
  try {
    const category = findById('categories', req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Add ideas count
    const ideas = findAll('ideas');
    const categoryWithCount = {
      ...category,
      ideasCount: ideas.filter(idea => idea.category === category._id).length
    };
    
    res.status(200).json({
      success: true,
      data: categoryWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Public
export const createCategory = async (req, res, next) => {
  try {
    const category = create('categories', req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public
export const updateCategory = async (req, res, next) => {
  try {
    const category = updateById('categories', req.params.id, req.body);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public
export const deleteCategory = async (req, res, next) => {
  try {
    const category = findById('categories', req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Delete all ideas in this category
    deleteMany('ideas', { category: req.params.id });
    
    // Delete the category
    deleteById('categories', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};