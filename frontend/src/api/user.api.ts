import api from './axios';
import type { UserProfile } from '@/types/User';

export const getUserProfileApi = (id: string | number) =>
  api.get<UserProfile>(`/users/${id}`);

export const updateUserProfileApi = (
  id: string | number,
  data: Partial<Pick<UserProfile, 'username' | 'email' | 'bio' | 'avatar_url'>>
) => api.put<{ user: UserProfile }>(`/users/${id}`, data);

export const uploadAvatarApi = (
  id: string | number,
  file: File
) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return api.post<{ avatarUrl: string }>(`/users/${id}/avatar`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getUserRecipesApi = (id: string | number) =>
  api.get<{ recipes: Array<{ id: string; title: string; image: string; created_at: string }> }>(`/users/${id}/recipes`);
