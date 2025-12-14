import axios from 'axios';

/**
 * Configure the API client with base URL and authentication
 * This should be called once when the app initializes
 * Uses VITE_API_URL from .env.development or .env.production
 */
export function configureApiClient() {
  // Vite automatically loads .env.development or .env.production based on mode
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // Configure axios defaults
  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;

  // Configure request interceptor for authentication
  axios.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Configure response interceptor for error handling
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 unauthorized - clear auth data
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // The auth store will update on next render/initialization
      }
      return Promise.reject(error);
    }
  );
}

