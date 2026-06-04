import api from './api';

export const activityService = {
  getAll:       ()           => api.get('/activity'),
  getByProject: (projectId) => api.get(`/activity/project/${projectId}`),
};
