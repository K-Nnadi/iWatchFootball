/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Competition } from '../models/Competition';
import type { CreateCompetitionDTO } from '../models/CreateCompetitionDTO';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Competition {

    /**
     * Create Competition
     * @param requestBody 
     * @returns Competition 
     * @throws ApiError
     */
    public static create(
requestBody: CreateCompetitionDTO,
): CancelablePromise<Competition> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/competition',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Competitions
     * @returns Competition 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Competition>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/competition',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Competitions
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Competition 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Competition>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/competition/query',
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
     * Get one Competition
     * @param id 
     * @returns Competition 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Competition> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/competition/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Competition
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Competition,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/competition/{id}',
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
     * Delete one Competition
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/competition/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
