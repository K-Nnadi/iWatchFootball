/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginBody } from '../models/LoginBody';
import type { RegisterBody } from '../models/RegisterBody';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Auth {

    /**
     * @param requestBody 
     * @returns AuthResponse 
     * @throws ApiError
     */
    public static authControllerLogin(
requestBody: LoginBody,
): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns AuthResponse 
     * @throws ApiError
     */
    public static authControllerRegister(
requestBody: RegisterBody,
): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
