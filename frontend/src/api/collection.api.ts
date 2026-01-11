import api from './axios';

export const getUserCollectionsApi = (id: string | number) =>
  api.get<{ collections: Array<{ id: string; title: string; description: string; image: Array<string>; created_at: string }> }>(`/collections/${id}`);

export const getCollectionDetailApi = (id: string) => {
  return api.get(`/collections/content/${id}`);
};

export const createCollectionApi = (data: { title: string; description: string; isPrivate: boolean }) => {
  return api.post('/collections', data);
};

export const updateCollectionApi = (id: string, data: { title: string; description: string; isPrivate: boolean }) => {
  return api.put(`/collections/${id}`, data);
};

export const deleteCollectionApi = (id: string) => {
  return api.delete(`/collections/${id}`);
};