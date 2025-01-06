/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePositionDTO } from '../models/CreatePositionDTO';
import type { Position } from '../models/Position';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Position {

    /**
     * Create Position
     * @param requestBody 
     * @returns Position 
     * @throws ApiError
     */
    public static create(
requestBody: CreatePositionDTO,
): CancelablePromise<Position> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/position',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Positions
     * @returns Position 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Position>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/position',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Positions
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Position 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Position>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/position/query',
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
     * Get one Position
     * @param id 
     * @returns Position 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Position> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/position/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Position
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Position,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/position/{id}',
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
     * Delete one Position
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/position/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
