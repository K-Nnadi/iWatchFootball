/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRefereeDTO } from '../models/CreateRefereeDTO';
import type { Referee } from '../models/Referee';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Referee {

    /**
     * Create Referee
     * @param requestBody 
     * @returns Referee 
     * @throws ApiError
     */
    public static create(
requestBody: CreateRefereeDTO,
): CancelablePromise<Referee> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/referee',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Referees
     * @returns Referee 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Referee>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/referee',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Referees
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Referee 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Referee>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/referee/query',
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
     * Get one Referee
     * @param id 
     * @returns Referee 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Referee> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/referee/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Referee
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Referee,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/referee/{id}',
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
     * Delete one Referee
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/referee/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
