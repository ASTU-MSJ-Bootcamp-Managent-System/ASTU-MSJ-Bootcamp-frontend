import { api } from './api';

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data || response;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data || response;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data || response;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data || response;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data || response;
};

export const userService = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
