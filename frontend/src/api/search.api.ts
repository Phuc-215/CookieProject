// router.post('/', controller.search);

// router.get('/suggestions', controller.getSuggestions);

// router.get('/history', controller.getHistory);
// router.delete('/history', controller.clearHistory);

import api from './axios';

export interface SearchParams {
  title?: string;
  ingredients_included?: string[]; // Array of ingredient names
  ingredients_excluded?: string[]; // Array of ingredient names to exclude
  difficulty?: string; // "easy" | "medium" | "hard" or empty string
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  type?: string;
}

export const searchApi = (params: SearchParams) =>
  api.post<{ data: Array<any>; results: number }>('/search', params);

export const getSearchSuggestionsApi = (query: string) =>
  api.get<{ data: string[] }>('/search/suggestions', {
    params: { q: query }
  });

export const getSearchHistoryApi = () =>
  api.get<{ data: Array<{ query_text: string, created_at: string }> }>('/search/history');

export const clearSearchHistoryApi = () =>
  api.delete('/search/history');

export const deleteSearchHistoryItemApi = (item: string) =>
  api.delete('/search/history', { data: { item } });

export const getIngredients = async () => {
  return await api.get(`/ingredients/list`);
};