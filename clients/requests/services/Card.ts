/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Card } from '../models/Card';
import type { CreateCardDTO } from '../models/CreateCardDTO';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Card {

    /**
     * Create Card
     * @param requestBody 
     * @returns Card 
     * @throws ApiError
     */
    public static create(
requestBody: CreateCardDTO,
): CancelablePromise<Card> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/card',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Cards
     * @returns Card 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Card>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/card',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Cards
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Card 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Card>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/card/query',
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
     * Get one Card
     * @param id 
     * @returns Card 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Card> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/card/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Card
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Card,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/card/{id}',
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
     * Delete one Card
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/card/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
