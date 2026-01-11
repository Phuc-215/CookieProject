import api from './axios';

import type { RecipeDetail, RecipeFormData } from '@/types/Recipe';

export const getDetailApi = (recipeId: string | number) =>
  api.get<{ recipes: RecipeDetail }>(`/recipes/${recipeId}`);

export const createRecipeApi = (
  data: RecipeFormData) => api.post<{ recipe: RecipeFormData }>('/recipes/create', data);


export const saveRecipeApi = (id: string, data: RecipeFormData) => 
  api.put<{ data: RecipeFormData }>(`/recipes/${id}`, data);