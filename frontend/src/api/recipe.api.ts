import api from './axios';

import type { RecipeDetail } from '@/types/Recipe';

export const getDetailApi = (recipeId: string | number) =>
  api.get<{ recipes: RecipeDetail }>(`/recipes/${recipeId}`);

export const createRecipeApi = (
  data: Omit<RecipeDetail, 'id' | 'author' | 'likes' | 'isLiked' | 'isSaved'>
) => api.post<{ recipe: RecipeDetail }>('/recipes/create', data);

export const saveRecipeApi = (data: FormData, recipeId?: string | number) => {
  return api.put(`/recipes/${recipeId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};