import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const adminSession = localStorage.getItem('admin_session');
  if (adminSession) {
    const session = JSON.parse(adminSession);
    if (session.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_session');
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },
  verify: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },
};

// Room Types API
export const roomTypesAPI = {
  getAll: async (activeOnly = false) => {
    const response = await api.get(`/api/room-types?active_only=${activeOnly}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/room-types', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/room-types/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/room-types/${id}`);
    return response.data;
  },
};

// Activity Types API
export const activityTypesAPI = {
  getAll: async (activeOnly = false) => {
    const response = await api.get(`/api/activity-types?active_only=${activeOnly}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/activity-types', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/activity-types/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/activity-types/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (status = null, bookingType = null) => {
    let url = '/api/bookings';
    const params = [];
    if (status) params.push(`status=${status}`);
    if (bookingType) params.push(`booking_type=${bookingType}`);
    if (params.length > 0) url += '?' + params.join('&');
    const response = await api.get(url);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/bookings', data);
    return response.data;
  },
  cancel: async (id, reason = '') => {
    const response = await api.put(`/api/bookings/${id}/cancel?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },
};

// Safari Routes API
export const safariRoutesAPI = {
  getAll: async (activeOnly = false) => {
    const response = await api.get(`/api/safari-routes?active_only=${activeOnly}`);
    return response.data;
  },
};

// Wildlife Zones API
export const wildlifeZonesAPI = {
  getAll: async (activeOnly = false) => {
    const response = await api.get(`/api/wildlife-zones?active_only=${activeOnly}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  get: async () => {
    const response = await api.get('/api/analytics');
    return response.data;
  },
};

// Integration Settings API
export const integrationSettingsAPI = {
  getAll: async () => {
    const response = await api.get('/api/integration-settings');
    return response.data;
  },
  update: async (key, value, isEnabled) => {
    const response = await api.put(`/api/integration-settings/${key}?value=${encodeURIComponent(value)}&is_enabled=${isEnabled}`);
    return response.data;
  },
};

// Init Database
export const initDatabase = async () => {
  const response = await api.post('/api/init-db');
  return response.data;
};

export default api;
