/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateGenericTokenDTO } from '../models/CreateGenericTokenDTO';
import type { GenericToken } from '../models/GenericToken';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class GenericToken {

    /**
     * Create GenericToken
     * @param requestBody 
     * @returns GenericToken 
     * @throws ApiError
     */
    public static create(
requestBody: CreateGenericTokenDTO,
): CancelablePromise<GenericToken> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/genericToken',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all GenericTokens
     * @returns GenericToken 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<GenericToken>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/genericToken',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all GenericTokens
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns GenericToken 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<GenericToken>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/genericToken/query',
            query: {
                'skip': skip,
                'take': take,
                'withDeleted': withDeleted,
                'loadEagerRelations': loadEagerRelations,
                'transaction': transaction,
                'comment': comment,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get one GenericToken
     * @param id 
     * @returns GenericToken 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<GenericToken> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/genericToken/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one GenericToken
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: GenericToken,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/genericToken/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Delete one GenericToken
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/genericToken/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
