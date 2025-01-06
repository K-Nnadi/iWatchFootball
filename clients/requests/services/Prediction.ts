/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePredictionDTO } from '../models/CreatePredictionDTO';
import type { Prediction } from '../models/Prediction';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Prediction {

    /**
     * Create Prediction
     * @param requestBody 
     * @returns Prediction 
     * @throws ApiError
     */
    public static create(
requestBody: CreatePredictionDTO,
): CancelablePromise<Prediction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/prediction',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Predictions
     * @returns Prediction 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Prediction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/prediction',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Predictions
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Prediction 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Prediction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/prediction/query',
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
     * Get one Prediction
     * @param id 
     * @returns Prediction 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Prediction> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/prediction/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Prediction
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Prediction,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/prediction/{id}',
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
     * Delete one Prediction
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/prediction/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
