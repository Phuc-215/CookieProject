// router.post('/', controller.search);

// router.get('/suggestions', controller.getSuggestions);

// router.get('/history', controller.getHistory);
// router.delete('/history', controller.clearHistory);

import api from './axios';

export const searchApi = (query: string, page: number, limit: number) =>
  api.get<{ results: Array<any>; total: number }>('/search', {
    params: { query, page, limit },
  });
  
export const getSearchSuggestionsApi = () =>
  api.get<{ suggestions: string[] }>('/search/suggestions');

export const getSearchHistoryApi = (userId: string) =>
  api.get<{ history: string[] }>('/search/history', {
    params: { userId },
  });

export const clearSearchHistoryApi = (userId: string) =>
  api.delete('/search/history', {
    params: { userId },
  });