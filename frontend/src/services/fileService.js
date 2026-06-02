import api from './api';

export const fileService = {
  getByProject: (projectId) => api.get(`/files/project/${projectId}`),

  upload: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/files/upload/${projectId}`, formData);
  },

  download: (fileId) => api.get(`/files/download/${fileId}`, { responseType: 'blob' }),

  delete: (fileId) => api.delete(`/files/${fileId}`),
};

export const reportService = {
  download: (projectId) =>
    api.get(`/reports/project/${projectId}`, { responseType: 'blob' }),
};
