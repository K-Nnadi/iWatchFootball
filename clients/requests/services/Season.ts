/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSeasonDTO } from '../models/CreateSeasonDTO';
import type { Season } from '../models/Season';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Season {

    /**
     * Create Season
     * @param requestBody 
     * @returns Season 
     * @throws ApiError
     */
    public static create(
requestBody: CreateSeasonDTO,
): CancelablePromise<Season> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/season',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Seasons
     * @returns Season 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Season>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/season',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Seasons
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Season 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Season>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/season/query',
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
     * Get one Season
     * @param id 
     * @returns Season 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Season> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/season/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Season
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Season,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/season/{id}',
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
     * Delete one Season
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/season/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
