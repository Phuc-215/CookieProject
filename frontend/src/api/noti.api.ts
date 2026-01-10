import api from './axios';

export const getNotificationsApi = (userId: string, page: number, limit: number, unreadOnly?: boolean) =>
  api.get('/notifications', {
    params: { userId, page, limit, unreadOnly },
  });
  
export const markAsReadApi = (notificationId: string, userId: string) =>
  api.put(`/notifications/${notificationId}`, null, {
    params: { userId },
  });

export const markAllAsReadApi = (userId: string) =>
  api.put('/notifications/read-all', null, {
    params: { userId },
  });