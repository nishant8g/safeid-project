/**
 * SafeID API Client
 * Centralized HTTP client for all backend communication.
 */
import axios from 'axios';

// Dynamically detect the backend URL based on how the user accessed the frontend.
// If accessed via phone (LAN IP), API calls also go to LAN IP, not localhost.
// When deployed on Vercel, it uses VITE_API_URL from environment variables.
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds to accommodate Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('safeid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('safeid_token');
      sessionStorage.removeItem('safeid_user');
      // Don't redirect on scan pages
      if (!window.location.pathname.startsWith('/scan')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ──── Auth ────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ──── User ────
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getMedical: () => api.get('/user/medical'),
  saveMedical: (data) => api.post('/user/medical', data),
  getContacts: () => api.get('/user/contacts'),
  addContact: (data) => api.post('/user/contacts', data),
  updateContact: (id, data) => api.put(`/user/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`/user/contacts/${id}`),
};

// ──── QR Code ────
export const qrAPI = {
  generate: () => api.post(`/qr/generate?frontend_url=${encodeURIComponent(window.location.origin)}`),
  getInfo: () => api.get('/qr/info'),
  getImageUrl: (userId) => `${API_BASE}/qr/image/${userId}`,
};

// ──── Scan (Public) ────
export const scanAPI = {
  getData: (userId) => api.get(`/scan/${userId}`),
};

// ──── Alert (Public) ────
export const alertAPI = {
  trigger: (data) => api.post('/alert/trigger', data),
  getHistory: (userId) => api.get(`/alert/history?user_id=${userId}`),
};

// ──── AI ────
export const aiAPI = {
  generateMessage: (data) => api.post('/ai/generate-message', data),
  analyzeSeverity: (description, imageDescription) =>
    api.post(`/ai/analyze?description=${encodeURIComponent(description || '')}&image_description=${encodeURIComponent(imageDescription || '')}`),
  getRiskPrediction: () => api.post('/ai/risk'),
};

export default api;
