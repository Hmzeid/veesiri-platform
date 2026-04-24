import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // If caller already set Authorization, don't override
  if (config.headers.Authorization) return config;
  const url = config.url ?? '';
  const isGov = url.startsWith('/gov/') || url.startsWith('gov/');
  const token = isGov
    ? localStorage.getItem('govToken')
    : localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url ?? '';
    if (err.response?.status === 401) {
      if (url.startsWith('/gov/')) {
        localStorage.removeItem('govToken');
        if (!window.location.pathname.startsWith('/gov/login')) {
          window.location.href = '/gov/login';
        }
      } else {
        localStorage.removeItem('accessToken');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  },
);
