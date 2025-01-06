/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLineUpDTO } from '../models/CreateLineUpDTO';
import type { LineUp } from '../models/LineUp';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LineUp {

    /**
     * Create LineUp
     * @param requestBody 
     * @returns LineUp 
     * @throws ApiError
     */
    public static create(
requestBody: CreateLineUpDTO,
): CancelablePromise<LineUp> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/lineUp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all LineUps
     * @returns LineUp 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<LineUp>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lineUp',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all LineUps
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns LineUp 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<LineUp>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lineUp/query',
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
     * Get one LineUp
     * @param id 
     * @returns LineUp 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<LineUp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lineUp/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one LineUp
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: LineUp,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/lineUp/{id}',
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
     * Delete one LineUp
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/lineUp/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
