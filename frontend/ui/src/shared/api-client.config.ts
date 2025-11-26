import axios from 'axios';

/**
 * Configure the API client with base URL and authentication
 * This should be called once when the app initializes
 */
export function configureApiClient() {
  // Set the base URL from environment variable
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
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
      // Handle 401 unauthorized - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        // Optionally redirect to login page
        // window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}

