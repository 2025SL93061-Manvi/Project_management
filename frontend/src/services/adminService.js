import api from './api';

export const adminService = {
  // User management (admin only)
  getUsers:           ()           => api.get('/admin/users'),
  toggleUser:         (id)         => api.put(`/admin/users/${id}/toggle`),
  updateUser:         (id, data)   => api.put(`/admin/users/${id}`, data),

  // All complaints — admin only
  getAllComplaints:    ()           => api.get('/admin/complaints'),
  updateStatus:       (id, status) => api.put(`/admin/complaints/${id}/status?status=${status}`),
  deleteComplaint:    (id)         => api.delete(`/admin/complaints/${id}`),

  // My complaints — any authenticated user
  getMyComplaints:    ()           => api.get('/complaints/my'),
  createComplaint:    (data)       => api.post('/complaints', data),
  editComplaint:      (id, data)   => api.put(`/complaints/${id}`, data),
};

export const calendarService = {
  getHolidays:   ()     => api.get('/calendar/holidays'),
  getEvents:     ()     => api.get('/calendar/events'),
  addHoliday:    (data) => api.post('/calendar/holidays', data),
  deleteHoliday: (id)   => api.delete(`/calendar/holidays/${id}`),
};
