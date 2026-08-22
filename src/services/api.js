import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((c) => {
  const token = localStorage.getItem('msj_token');
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) window.dispatchEvent(new Event('auth:expired'));
    return Promise.reject(e);
  },
);
export const message = (e) =>
  e.response?.data?.message ||
  (e.request
    ? 'Network error. Check your connection and try again.'
    : 'Something went wrong. Please try again.');
export default api;
