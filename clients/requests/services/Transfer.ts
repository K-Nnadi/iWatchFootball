/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTransferDTO } from '../models/CreateTransferDTO';
import type { Transfer } from '../models/Transfer';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Transfer {

    /**
     * Create Transfer
     * @param requestBody 
     * @returns Transfer 
     * @throws ApiError
     */
    public static create(
requestBody: CreateTransferDTO,
): CancelablePromise<Transfer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/transfer',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Transfers
     * @returns Transfer 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Transfer>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/transfer',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Transfers
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Transfer 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Transfer>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/transfer/query',
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
     * Get one Transfer
     * @param id 
     * @returns Transfer 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Transfer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/transfer/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Transfer
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Transfer,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/transfer/{id}',
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
     * Delete one Transfer
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/transfer/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
