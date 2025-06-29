import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', error.response?.status, message);
    return Promise.reject(new Error(message));
  }
);

// API endpoints
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ideaAPI = {
  getAll: (params = {}) => api.get('/ideas', { params }),
  getById: (id) => api.get(`/ideas/${id}`),
  create: (data) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(data).forEach(key => {
      if (key !== 'attachments') {
        formData.append(key, data[key]);
      }
    });
    
    // Append files
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return api.post('/ideas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(data).forEach(key => {
      if (key !== 'attachments') {
        formData.append(key, data[key]);
      }
    });
    
    // Append files
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return api.put(`/ideas/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/ideas/${id}`),
};

export const journalAPI = {
  getAll: (params = {}) => api.get('/journal', { params }),
  getById: (id) => api.get(`/journal/${id}`),
  create: (data) => api.post('/journal', data),
  update: (id, data) => api.put(`/journal/${id}`, data),
  delete: (id) => api.delete(`/journal/${id}`),
};

export const habitAPI = {
  getAll: () => api.get('/habits'),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  updateEntry: (id, entryData) => api.put(`/habits/${id}/entries`, entryData),
  delete: (id) => api.delete(`/habits/${id}`),
};

export const clickAPI = {
  getAll: (params = {}) => api.get('/clicks', { params }),
  getById: (id) => api.get(`/clicks/${id}`),
  create: (file) => {
    const formData = new FormData();
    formData.append('media', file);
    
    return api.post('/clicks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/clicks/${id}`),
};

export const journeyAPI = {
  getAll: (params = {}) => api.get('/journey', { params }),
  getById: (id) => api.get(`/journey/${id}`),
  create: (data) => api.post('/journey', data),
  update: (id, data) => api.put(`/journey/${id}`, data),
  delete: (id) => api.delete(`/journey/${id}`),
};

export const fontAPI = {
  getAll: () => api.get('/fonts'),
  upload: (file) => {
    const formData = new FormData();
    formData.append('font', file);
    
    return api.post('/fonts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/fonts/${id}`),
};

export default api;