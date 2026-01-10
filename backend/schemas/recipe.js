import { z } from 'zod';

const IngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required").trim(),
});

const StepSchema = z.object({
  stepNumber: z.number()
    .int()
    .positive(),
  description: z.string()
    .min(10, "Step description must be at least 10 characters") // Force detailed steps
    .trim(),
  imageUrl: z.string()
    .url("Step image must be a valid URL")
    .optional()
    .nullable(),
});

const RecipeSchema = z.object({
  userId: z.number({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a number"
  }),
  
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(300, "Title is too long")
    .trim(),
    
  category: z.string()
    .min(1, "Category is required")
    .trim(),

  difficulty: z.enum(['easy', 'medium', 'hard'])
    .optional()
    .default('easy'), 

  servings: z.number()
    .int()
    .positive("Servings must be at least 1")
    .optional()
    .nullable(),

  cookTime: z.number()
    .int()
    .nonnegative("Cook time cannot be negative")
    .optional()
    .nullable(),

  thumbnailUrl: z.string()
    .url("Thumbnail must be a valid URL")
    .optional()
    .nullable(),

  status: z.enum(['published', 'draft'])
    .optional()
    .default('published'),

  isTrending: z.boolean()
    .optional()
    .default(false),

  ingredients: z.array(IngredientSchema)
    .min(1, "Recipe must have at least one ingredient"),

  steps: z.array(StepSchema)
    .min(1, "Recipe must have at least one cooking step")
});

export default RecipeSchema;