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

export const unlikeRecipeApi = (id: string | number) =>
  api.delete<{ message: string }>(`/recipes/${id}/like`);

export const addCommentApi = (id: string | number, content: string) =>
  api.post<{ comment: { id: number; user_id: number; recipe_id: number; content: string; created_at: string } }>(
    `/recipes/${id}/comments`,
    { content }
  );

export const getCommentsApi = (id: string | number) =>
  api.get<{ comments: Array<{ id: number; user_id: number; recipe_id: number; content: string; created_at: string }> }>(
    `/recipes/${id}/comments`
  );

export const deleteCommentApi = (recipeId: string | number, commentId: string | number) =>
  api.delete<{ message: string }>(`/recipes/${recipeId}/comments/${commentId}`);

export const likeRecipeApi = (id: string | number) =>
  api.post<{ message: string }>(`/recipes/${id}/like`);