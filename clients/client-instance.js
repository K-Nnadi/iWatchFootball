import axios from 'axios';
/**
 * Client instance for Orval-generated React Query hooks
 * This function is used by Orval to wrap API requests
 */
export const clientInstance = (config) => {
    const axiosConfig = {
        url: config.url,
        method: config.method,
        headers: Object.assign({}, config.headers),
        data: config.data,
        params: config.params,
        signal: config.signal,
        // Use axios defaults for baseURL and withCredentials
        // These are set in the frontend's configureApiClient()
    };
    return axios.request(axiosConfig).then((response) => response.data);
};
//# sourceMappingURL=client-instance.js.map