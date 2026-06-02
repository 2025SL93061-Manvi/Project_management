import api from './api';

export const adminService = {
  getUsers:          ()           => api.get('/admin/users'),
  toggleUser:        (id)         => api.put(`/admin/users/${id}/toggle`),
  getAllComplaints:   ()           => api.get('/admin/complaints'),
  getMyComplaints:   ()           => api.get('/admin/complaints/my'),
  createComplaint:   (data)       => api.post('/admin/complaints', data),
  updateStatus:      (id, status) => api.put(`/admin/complaints/${id}/status?status=${status}`),
};

export const calendarService = {
  getHolidays:   ()     => api.get('/calendar/holidays'),
  addHoliday:    (data) => api.post('/calendar/holidays', data),
  deleteHoliday: (id)   => api.delete(`/calendar/holidays/${id}`),
};
