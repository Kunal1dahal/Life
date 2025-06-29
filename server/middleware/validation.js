import Joi from 'joi';

// Validation schemas
const schemas = {
  category: Joi.object({
    name: Joi.string().trim().max(100).required(),
    emoji: Joi.string().required(),
    color: Joi.string().required()
  }),

  idea: Joi.object({
    title: Joi.string().trim().max(200).required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    status: Joi.string().valid('todo', 'in-progress', 'completed', 'on-hold').optional(),
    priority: Joi.string().valid('high', 'medium', 'low').optional()
  }),

  journalEntry: Joi.object({
    title: Joi.string().trim().max(200).required(),
    content: Joi.string().required(),
    mood: Joi.string().allow('').optional(),
    tags: Joi.array().items(Joi.string().trim().max(50)).optional()
  }),

  habit: Joi.object({
    name: Joi.string().trim().max(100).required(),
    question: Joi.string().trim().max(300).required(),
    color: Joi.string().valid('red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange').required()
  }),

  habitEntry: Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    completed: Joi.boolean().required()
  }),

  journeyNode: Joi.object({
    title: Joi.string().trim().max(200).required(),
    question: Joi.string().trim().max(500).required(),
    status: Joi.string().valid('pending', 'completed', 'failed').optional(),
    currentDate: Joi.date().optional(),
    completedAt: Joi.date().allow(null).optional(),
    x: Joi.number().optional(),
    y: Joi.number().optional()
  })
};

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schemas[schema].validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    next();
  };
};

export default validate;