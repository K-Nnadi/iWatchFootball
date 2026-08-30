import axios, {AxiosBasicCredentials, AxiosRequestHeaders, AxiosResponse, isAxiosError, Method, ResponseType} from 'axios';
import type { Agent } from 'https';


export type HttpWrapperProperties = {
    baseUrl?: string;
    apiKey?: string;
    headers?: any;
    bearer?: string;
    append?: string;
    auth?: AxiosBasicCredentials;
    responseType?: ResponseType;
    httpsAgent?: Agent;
};

export type HttpRequestPayload = {
    method?: Method;
    path?: string;
    params?: string | Object;
    data?: any;
    headers?: any;
    auth?: AxiosBasicCredentials;
    responseType?: ResponseType;
};

function isRetryableHttpError(error: unknown): boolean {
    if (!isAxiosError(error)) {
        return true;
    }
    const status = error.response?.status;
    if (status == null) {
        return true;
    }
    if (status === 429 || status === 408) {
        return true;
    }
    if (status >= 500) {
        return true;
    }
    return false;
}

function retryBackoffMs(attempt: number): number {
    const baseMs = 500;
    const maxMs = 30_000;
    const exponential = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1));
    const jitter = Math.floor(Math.random() * 250);
    return exponential + jitter;
}

export class HttpWrapper implements HttpWrapperProperties {
    baseUrl = '';
    apiKey?: string;
    append?: string;
    auth?: AxiosBasicCredentials = {
        username: '',
        password: ''
    };
    headers: any = {
        'Content-Type': 'application/json'
    };
    throwOnError: boolean;
    numRetries: number;
    responseType: ResponseType;
    httpsAgent?: Agent;

    constructor({
                    baseUrl,
                    apiKey,
                    headers,
                    auth,
                    append,
                    responseType,
                    httpsAgent,
                }: HttpWrapperProperties, throwOnError?: boolean, numRetries?: number) {
        this.baseUrl = baseUrl || '';
        this.apiKey = apiKey;
        this.auth = auth;
        this.append = append;
        this.headers = {...this.headers, ...headers};
        this.throwOnError = throwOnError ?? true;
        this.numRetries = Math.max(1, numRetries || 1);
        this.responseType = responseType ?? 'json';
        this.httpsAgent = httpsAgent;
    }

    request = async <T>({
                            method,
                            params,
                            path,
                            data,
                            headers,
                            auth,
                            responseType
                        }: HttpRequestPayload, throwOnError: boolean = this.throwOnError, numRetries: number = this.numRetries): Promise<AxiosResponse<T>> => {
        return await this.executeRequest(path, headers, method, data, params, auth, responseType, throwOnError, numRetries);
    };

    private async executeRequest(
        path: string | undefined,
        headers: AxiosRequestHeaders | undefined,
        method: Method | undefined,
        data: any,
        params: string | Object | undefined,
        auth: AxiosBasicCredentials | undefined,
        responseType: ResponseType | undefined,
        throwOnError: boolean,
        numRetries: number
    ): Promise<AxiosResponse<any>> {
        const url = `${this.baseUrl}${path || ''}${this.append || ''}`;
        const maxAttempts = Math.max(1, numRetries);
        let attempts = 0;
        let lastError: unknown;

        while (attempts < maxAttempts) {
            attempts++;
            try {
                const response = await axios({
                    url,
                    method: method,
                    headers: {...this.headers, ...headers},
                    auth: auth || this.auth,
                    data: data,
                    params: params,
                    responseType: responseType || this.responseType,
                    ...(this.httpsAgent ? { httpsAgent: this.httpsAgent } : {}),
                });
                return response;
            } catch (error) {
                lastError = error;
                const canRetry = attempts < maxAttempts && isRetryableHttpError(error);
                if (!canRetry) {
                    if (throwOnError) {
                        throw error;
                    }
                    throw error;
                }
                const delayMs = retryBackoffMs(attempts);
                const status = isAxiosError(error) ? error.response?.status : undefined;
                console.warn(
                    `${method ?? 'GET'} ${url} failed (${status ?? 'network'}) — retry ${attempts}/${maxAttempts} in ${delayMs}ms`,
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }

        if (throwOnError && lastError) {
            throw lastError;
        }
        throw lastError ?? new Error('Request failed without a response.');
    }

}
