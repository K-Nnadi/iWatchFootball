/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateInjuryDTO } from '../models/CreateInjuryDTO';
import type { Injury } from '../models/Injury';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Injury {

    /**
     * Create Injury
     * @param requestBody 
     * @returns Injury 
     * @throws ApiError
     */
    public static create(
requestBody: CreateInjuryDTO,
): CancelablePromise<Injury> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/injury',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Injurys
     * @returns Injury 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Injury>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/injury',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Injurys
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Injury 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Injury>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/injury/query',
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
     * Get one Injury
     * @param id 
     * @returns Injury 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Injury> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/injury/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Injury
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Injury,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/injury/{id}',
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
     * Delete one Injury
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/injury/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
