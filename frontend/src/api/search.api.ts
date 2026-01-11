// router.post('/', controller.search);

// router.get('/suggestions', controller.getSuggestions);

// router.get('/history', controller.getHistory);
// router.delete('/history', controller.clearHistory);

import api from './axios';

export interface SearchParams {
  title?: string;
  ingredients_included?: string[]; // Changed to string to match frontend input
  ingredients_excluded?: string[];
  difficulty?: Array<"Easy" | "Medium" | "Hard">;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
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