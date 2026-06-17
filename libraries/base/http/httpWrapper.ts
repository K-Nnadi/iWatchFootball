import axios, {AxiosBasicCredentials, AxiosRequestHeaders, AxiosResponse, Method, ResponseType} from 'axios';
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
        this.numRetries = numRetries || 1;
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
        // Call the executeRequest method with all expected parameters
        return await this.executeRequest(path, headers, method, data, params, auth, responseType, throwOnError, numRetries
        );
    };

    private async executeRequest(
        path: string | undefined,
        headers: AxiosRequestHeaders | undefined,
        method: Method | undefined,
        data: any,
        params: string | Object | undefined,
        auth: AxiosBasicCredentials | undefined,
        responseType: ResponseType | undefined,
        throwOnError: boolean,  // Added parameter
        numRetries: number      // Added parameter
    ): Promise<AxiosResponse<any>> {  // Ensure the return type is specified correctly
        const url = `${this.baseUrl}${path || ''}${this.append || ''}`;
        console.log(`${method} request to ${url}`);

        let attempts = 0;
        while (attempts < numRetries) {
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
                return response; // If successful, return the response
            } catch (error) {
                attempts++;
                if (attempts >= numRetries || throwOnError) {
                    console.error(`Failed after ${attempts} attempts: ${error}`);
                    throw error; // After max attempts or if throwing on error, rethrow the error
                }
                console.log(`Retrying... Attempt ${attempts}`);
            }
        }
        throw new Error("Request failed without a response."); // Safety throw if while loop exits without a return
    }

}