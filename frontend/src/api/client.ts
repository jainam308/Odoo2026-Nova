import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error extracting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;
