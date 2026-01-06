import api from './axios';

export const registerApi = (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return api.post('/auth/register', data);
};

export const loginApi = (data: {
  email: string;
  password: string;
}) => {
  return api.post('/auth/login', data);
};

