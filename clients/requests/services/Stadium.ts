/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateStadiumDTO } from '../models/CreateStadiumDTO';
import type { Stadium } from '../models/Stadium';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Stadium {

    /**
     * Create Stadium
     * @param requestBody 
     * @returns Stadium 
     * @throws ApiError
     */
    public static create(
requestBody: CreateStadiumDTO,
): CancelablePromise<Stadium> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/stadium',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Stadiums
     * @returns Stadium 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Stadium>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/stadium',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Stadiums
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Stadium 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Stadium>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/stadium/query',
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
     * Get one Stadium
     * @param id 
     * @returns Stadium 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Stadium> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/stadium/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Stadium
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Stadium,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/stadium/{id}',
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
     * Delete one Stadium
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/stadium/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
