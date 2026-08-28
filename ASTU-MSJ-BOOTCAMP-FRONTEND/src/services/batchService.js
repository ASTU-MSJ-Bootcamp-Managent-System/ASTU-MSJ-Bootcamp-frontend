import { api } from './api';

export const getBatches = async () => {
  const response = await api.get('/batches');
  return response.data || response;
};

export const getBatch = async (id) => {
  const response = await api.get(`/batches/${id}`);
  return response.data || response;
};

export const createBatch = async (batchData) => {
  const response = await api.post('/batches', batchData);
  return response.data || response;
};

export const updateBatch = async (id, batchData) => {
  const response = await api.put(`/batches/${id}`, batchData);
  return response.data || response;
};

export const deleteBatch = async (id) => {
  const response = await api.delete(`/batches/${id}`);
  return response.data || response;
};

export const batchService = {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
};

