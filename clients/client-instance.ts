import axios, { type AxiosRequestConfig } from 'axios';

export type ApiRequestOptions = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  signal?: AbortSignal;
};

/**
 * Client instance for Orval-generated React Query hooks
 * This function is used by Orval to wrap API requests
 */
export const clientInstance = <T>(config: ApiRequestOptions): Promise<T> => {
  const axiosConfig: AxiosRequestConfig = {
    url: config.url,
    method: config.method,
    headers: {
      ...config.headers,
    },
    data: config.data,
    params: config.params,
    signal: config.signal,
    // Use axios defaults for baseURL and withCredentials
    // These are set in the frontend's configureApiClient()
  };

  return axios.request<T>(axiosConfig).then((response) => response.data);
};

