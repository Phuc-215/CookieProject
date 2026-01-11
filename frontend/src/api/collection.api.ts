import api from './axios';


// Interface matching the backend response structure for a Collection
export interface CollectionData {
  id: number;
  title: string;
  description: string;
  is_private: boolean;
  recipe_count: number;
  cover_images: string[];
}

// 1. Fetch User's Collections
export const getUserCollectionsApi = (userId: string | number) =>
  api.get<{ success: boolean; data: CollectionData[] }>(`/collections/${userId}`);

// 2. Add Recipe to Collection (Matches POST /collections/content/:id)
export const addRecipeToCollectionApi = (collectionId: string | number, recipeId: string | number) => {
  return api.post<{ success: boolean; message: string }>(
    `/collections/content/${collectionId}`, 
    { recipeId }
  );
};

// 3. Create Collection
export const createCollectionApi = (data: { title: string; description: string; isPrivate: boolean }) => {
  return api.post<{ success: boolean; data: CollectionData }>('/collections', data);
};

// export const getUserCollectionsApi = (id: string | number) =>
//   api.get<{ collections: Array<{ id: string; title: string; description: string; image: Array<string>; created_at: string }> }>(`/collections/${id}`);

export const getCollectionDetailApi = (id: string) => {
  return api.get(`/collections/content/${id}`);
};

// export const createCollectionApi = (data: { title: string; description: string; isPrivate: boolean }) => {
//   return api.post('/collections', data);
// };

export const updateCollectionApi = (id: string, data: { title: string; description: string; isPrivate: boolean }) => {
  return api.put(`/collections/${id}`, data);
};

export const deleteCollectionApi = (id: string) => {
  return api.delete(`/collections/${id}`);
};