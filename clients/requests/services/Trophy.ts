/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTrophyDTO } from '../models/CreateTrophyDTO';
import type { Trophy } from '../models/Trophy';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Trophy {

    /**
     * Create Trophy
     * @param requestBody 
     * @returns Trophy 
     * @throws ApiError
     */
    public static create(
requestBody: CreateTrophyDTO,
): CancelablePromise<Trophy> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/trophy',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Trophys
     * @returns Trophy 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Trophy>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trophy',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Trophys
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Trophy 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Trophy>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trophy/query',
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
     * Get one Trophy
     * @param id 
     * @returns Trophy 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Trophy> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trophy/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Trophy
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Trophy,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/trophy/{id}',
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
     * Delete one Trophy
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/trophy/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
