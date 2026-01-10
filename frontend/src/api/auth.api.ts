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

export const verifyEmailApi = (code: string) =>
  api.post('/auth/verify-email', { code });

export const refreshApi = (refreshToken: string) =>
  api.post('/auth/refresh', { refreshToken });

export const logoutApi = (refreshToken: string) =>
  api.post('/auth/logout', { refreshToken });

export const requestPasswordResetApi = (email: string) =>
  api.post('/auth/request-password-reset', { email });

export const verifyResetCodeApi = (code: string) =>
  api.post('/auth/verify-reset-code', { code });

export const resetPasswordApi = (data: {
  code: string;
  newPassword: string;
}) =>
  api.post('/auth/reset-password', data);

export const verifyPasswordApi = (password: string) =>
  api.post<{ message: string; valid: boolean }>('/auth/verify-password', { password });

export const changePasswordApi = (data: {
  currentPassword: string;
  newPassword: string;
}) =>
  api.put<{ message: string }>('/auth/change-password', data);
