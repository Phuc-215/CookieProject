import Joi from 'joi';

const IngredientSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .trim()
    .required()
    .messages({
      'string.empty': 'Ingredient name is required',
      'any.required': 'Ingredient name is required'
    }),
});

const StepSchema = Joi.object({
  stepNumber: Joi.number()
    .integer()
    .positive()
    .required(),

  description: Joi.string()
    .min(10)
    .trim()
    .required()
    .messages({
      'string.min': 'Step description must be at least 10 characters'
    }),

  imageUrls: Joi.array()
    .items(Joi.string().uri().messages({ 'string.uri': 'Step image must be a valid URL' }))
    .default([]),
});

const RecipeSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(300)
    .trim()
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title is too long'
    }),

  category: Joi.string()
    .min(1)
    .trim()
    .required()
    .messages({
      'string.empty': 'Category is required',
      'any.required': 'Category is required'
    }),

  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .default('easy'),

  servings: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .messages({
      'number.min': 'Servings must be at least 1'
    }),

  cookTime: Joi.number()
    .integer()
    .min(0)
    .allow(null)
    .messages({
      'number.min': 'Cook time cannot be negative'
    }),

  thumbnailUrl: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Thumbnail must be a valid URL'
    }),

  status: Joi.string()
    .valid('published', 'draft', 'deleted')
    .default('published'),

  isTrending: Joi.boolean()
    .default(false),

  ingredients: Joi.array()
    .items(IngredientSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'Recipe must have at least one ingredient'
    }),

  steps: Joi.array()
    .items(StepSchema)
    .min(1) 
    .required()
    .messages({
      'array.min': 'Recipe must have at least one cooking step'
    }),
});

export { RecipeSchema };