/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePlayerLineUpDTO } from '../models/CreatePlayerLineUpDTO';
import type { PlayerLineUp } from '../models/PlayerLineUp';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PlayerLineUp {

    /**
     * Create PlayerLineUp
     * @param requestBody 
     * @returns PlayerLineUp 
     * @throws ApiError
     */
    public static create(
requestBody: CreatePlayerLineUpDTO,
): CancelablePromise<PlayerLineUp> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/playerLineUp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all PlayerLineUps
     * @returns PlayerLineUp 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<PlayerLineUp>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/playerLineUp',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all PlayerLineUps
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns PlayerLineUp 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<PlayerLineUp>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/playerLineUp/query',
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
     * Get one PlayerLineUp
     * @param id 
     * @returns PlayerLineUp 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<PlayerLineUp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/playerLineUp/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one PlayerLineUp
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: PlayerLineUp,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/playerLineUp/{id}',
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
     * Delete one PlayerLineUp
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/playerLineUp/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
