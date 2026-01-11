const Joi = require('joi');

const createCollectionSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.empty': 'Collection name is required',
      'any.required': 'Collection name is required',
      'string.max': 'Collection name is too long (max 200 chars)'
    }),

  description: Joi.string()
    .max(1000)
    .allow(null, '') // Allow null or empty string
    .optional()
    .messages({
      'string.max': 'Description is too long (max 1000 chars)'
    }),

  isPrivate: Joi.boolean()
    .default(false)
});

const updateCollectionSchema = Joi.object({
  recipeId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Recipe ID must be a number',
      'any.required': 'Recipe ID is required'
    })
});

const editCollectionSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 50 characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .allow('', null) // Allow empty string or null
    .max(150)
    .messages({
      'string.max': 'Description cannot exceed 150 characters'
    }),

  isPrivate: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'isPrivate must be a boolean'
    })
});


module.exports = { createCollectionSchema, updateCollectionSchema, editCollectionSchema };