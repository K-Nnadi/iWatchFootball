/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateGoalDTO } from '../models/CreateGoalDTO';
import type { Goal } from '../models/Goal';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Goal {

    /**
     * Create Goal
     * @param requestBody 
     * @returns Goal 
     * @throws ApiError
     */
    public static create(
requestBody: CreateGoalDTO,
): CancelablePromise<Goal> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/goal',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Goals
     * @returns Goal 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Goal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/goal',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Goals
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Goal 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Goal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/goal/query',
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
     * Get one Goal
     * @param id 
     * @returns Goal 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Goal> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/goal/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Goal
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Goal,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/goal/{id}',
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
     * Delete one Goal
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/goal/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
