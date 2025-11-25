import { OpenAPI } from '@iWatchFootball/clients/requests';

/**
 * Configure the API client with base URL and authentication
 * This should be called once when the app initializes
 */
export function configureApiClient() {
  // Set the base URL from environment variable
  OpenAPI.BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Configure token handling for authenticated requests
  // Uncomment and adjust when you implement authentication
  // OpenAPI.TOKEN = async () => {
  //   const token = localStorage.getItem('authToken');
  //   return token || '';
  // };

  // Optional: Configure credentials
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = 'include';
}

