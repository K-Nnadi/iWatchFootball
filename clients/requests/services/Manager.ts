/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateManagerDTO } from '../models/CreateManagerDTO';
import type { Manager } from '../models/Manager';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Manager {

    /**
     * Create Manager
     * @param requestBody 
     * @returns Manager 
     * @throws ApiError
     */
    public static create(
requestBody: CreateManagerDTO,
): CancelablePromise<Manager> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/manager',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Managers
     * @returns Manager 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Manager>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/manager',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Managers
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Manager 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Manager>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/manager/query',
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
     * Get one Manager
     * @param id 
     * @returns Manager 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Manager> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/manager/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Manager
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Manager,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/manager/{id}',
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
     * Delete one Manager
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/manager/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
