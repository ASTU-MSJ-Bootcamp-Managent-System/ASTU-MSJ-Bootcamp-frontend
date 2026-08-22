import api from './api';
const resource = (path) => ({
  list: (params) => api.get(path, { params }),
  get: (id) => api.get(`${path}/${id}`),
  create: (data) => api.post(path, data),
  update: (id, data) => api.patch(`${path}/${id}`, data),
  remove: (id) => api.delete(`${path}/${id}`),
});
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};
export const userService = resource('/users');
export const batchService = resource('/batches');
export const attendanceService = resource('/attendance');
export const progressService = resource('/progress');
export const assignmentService = resource('/assignments');
export const submissionService = resource('/submissions');
export const announcementService = resource('/announcements');
// API contract: standard REST JSON responses may be { data, message }; list endpoints may paginate with { data, page, total }.
