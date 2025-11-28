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
export declare const clientInstance: <T>(config: ApiRequestOptions) => Promise<T>;
