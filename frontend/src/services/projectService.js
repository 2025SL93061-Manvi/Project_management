import api from './api';

export const projectService = {
  getMyProjects:  ()         => api.get('/projects'),
  getAllProjects:  ()         => api.get('/projects/all'),
  getById:        (id)       => api.get(`/projects/${id}`),
  create:         (data)     => api.post('/projects', data),
  update:         (id, data) => api.put(`/projects/${id}`, data),
  delete:         (id)       => api.delete(`/projects/${id}`),
};
