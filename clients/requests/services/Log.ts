/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLogDTO } from '../models/CreateLogDTO';
import type { Log } from '../models/Log';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Log {

    /**
     * Create Log
     * @param requestBody 
     * @returns Log 
     * @throws ApiError
     */
    public static create(
requestBody: CreateLogDTO,
): CancelablePromise<Log> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/log',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Logs
     * @returns Log 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Log>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/log',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Logs
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Log 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Log>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/log/query',
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
     * Get one Log
     * @param id 
     * @returns Log 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Log> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/log/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Log
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Log,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/log/{id}',
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
     * Delete one Log
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/log/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
