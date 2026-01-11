import api from './axios';

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