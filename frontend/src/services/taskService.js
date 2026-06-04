import api from './api';

export const taskService = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  getMyTasks:   ()          => api.get('/tasks/my'),
create:       (data)      => api.post('/tasks', data),
  update:       (id, data)  => api.put(`/tasks/${id}`, data),
  delete:       (id)        => api.delete(`/tasks/${id}`),
};

export const milestoneService = {
  getByProject: (projectId) => api.get(`/milestones/project/${projectId}`),
  create:       (data)      => api.post('/milestones', data),
  update:       (id, data)  => api.put(`/milestones/${id}`, data),
  delete:       (id)        => api.delete(`/milestones/${id}`),
};

export const meetingService = {
  getByProject: (projectId) => api.get(`/meetings/project/${projectId}`),
  create:       (data)      => api.post('/meetings', data),
  update:       (id, data)  => api.put(`/meetings/${id}`, data),
  delete:       (id)        => api.delete(`/meetings/${id}`),
};
