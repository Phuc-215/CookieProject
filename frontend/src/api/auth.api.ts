import api from './axios';

export const loginApi = (data: {
  email: string;
  password: string;
}) =>
  api.post('/auth/login', data);

export const registerApi = (data: {
  username: string;
  email: string;
  password: string;
}) =>
  api.post('/auth/register', data);

export const refreshApi = (refreshToken: string) =>
  api.post('/auth/refresh', { refreshToken });
