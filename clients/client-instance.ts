import { OpenAPI } from './requests';
import { request } from './requests/core/request';
import type { ApiRequestOptions } from './requests/core/ApiRequestOptions';

/**
 * Client instance for Orval-generated React Query hooks
 * This function is used by Orval to wrap API requests
 */
export const clientInstance = <T>(config: ApiRequestOptions): Promise<T> => {
  return request<T>(OpenAPI, config);
};

