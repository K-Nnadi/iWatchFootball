/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFixtureDTO } from '../models/CreateFixtureDTO';
import type { Fixture } from '../models/Fixture';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Fixture {

    /**
     * Create Fixture
     * @param requestBody 
     * @returns Fixture 
     * @throws ApiError
     */
    public static create(
requestBody: CreateFixtureDTO,
): CancelablePromise<Fixture> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/fixture',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Fixtures
     * @returns Fixture 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Fixture>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fixture',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Fixtures
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Fixture 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Fixture>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fixture/query',
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
     * Get one Fixture
     * @param id 
     * @returns Fixture 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Fixture> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fixture/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Fixture
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Fixture,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/fixture/{id}',
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
     * Delete one Fixture
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/fixture/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
