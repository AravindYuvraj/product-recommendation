import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getSaleProducts: () => api.get('/products/sale'),
  getCategories: () => api.get('/products/categories'),
  likeProduct: (id) => api.post(`/products/${id}/like`),
  viewProduct: (id) => api.post(`/products/${id}/view`),
  purchaseProduct: (id) => api.post(`/products/${id}/purchase`),
};

// Recommendations API
export const recommendationsAPI = {
  getPersonalized: (limit) => api.get('/recommendations/personalized', { params: { limit } }),
  getHybrid: (limit) => api.get('/recommendations/hybrid', { params: { limit } }),
  getContentBased: (limit) => api.get('/recommendations/content-based', { params: { limit } }),
  getCollaborative: (limit) => api.get('/recommendations/collaborative', { params: { limit } }),
  getTrending: (limit) => api.get('/recommendations/trending', { params: { limit } }),
  getSimilar: (productId, limit) => api.get(`/recommendations/similar/${productId}`, { params: { limit } }),
  getDashboard: () => api.get('/recommendations/dashboard'),
};

// Users API
export const usersAPI = {
  getInteractions: () => api.get('/users/interactions'),
  getLikes: () => api.get('/users/likes'),
  getViews: () => api.get('/users/views'),
  getPurchases: () => api.get('/users/purchases'),
  getStats: () => api.get('/users/stats'),
  clearInteractions: (type) => api.delete('/users/interactions/clear', { params: { type } }),
};

export default api;
