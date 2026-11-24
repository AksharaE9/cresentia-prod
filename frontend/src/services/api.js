import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If running locally in a browser on localhost or 127.0.0.1
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    if (!envUrl || envUrl.includes('vercel.app') || envUrl.includes('onrender.com')) {
      return 'http://localhost:5000/api';
    }
  }

  let url = envUrl || 'http://localhost:5000/api';
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = `${url.replace(/\/$/, '')}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 25000
});

// Automatic token attachment interceptor
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
