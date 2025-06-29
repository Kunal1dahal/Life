import { findAll, findById, create, updateById, deleteById } from '../config/fileStorage.js';

// @desc    Get all habits
// @route   GET /api/habits
// @access  Public
export const getHabits = async (req, res, next) => {
  try {
    const habits = findAll('habits');
    
    // Sort by creation date (newest first)
    habits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Public
export const getHabit = async (req, res, next) => {
  try {
    const habit = findById('habits', req.params.id);
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Public
export const createHabit = async (req, res, next) => {
  try {
    const habitData = {
      ...req.body,
      entries: []
    };
    
    const habit = create('habits', habitData);
    
    res.status(201).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Public
export const updateHabit = async (req, res, next) => {
  try {
    const habit = updateById('habits', req.params.id, req.body);
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update habit entry
// @route   PUT /api/habits/:id/entries
// @access  Public
export const updateHabitEntry = async (req, res, next) => {
  try {
    const { date, completed } = req.body;
    const habit = findById('habits', req.params.id);
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
    
    // Find existing entry for this date
    const entries = habit.entries || [];
    const existingEntryIndex = entries.findIndex(entry => entry.date === date);
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      entries[existingEntryIndex].completed = completed;
    } else {
      // Add new entry
      entries.push({ date, completed });
    }
    
    const updatedHabit = updateById('habits', req.params.id, { entries });
    
    res.status(200).json({
      success: true,
      data: updatedHabit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Public
export const deleteHabit = async (req, res, next) => {
  try {
    const deleted = deleteById('habits', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
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