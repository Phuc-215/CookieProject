import api from './axios';

export const getNotificationsApi = (page: number, limit: number) =>
  api.get('/notifications', {
    params: { page, limit },
  });
  
export const markAsReadApi = (notificationId: string) =>
  api.put(`/notifications/${notificationId}`);

export const markAllAsReadApi = () =>
  api.put('/notifications/read-all');
