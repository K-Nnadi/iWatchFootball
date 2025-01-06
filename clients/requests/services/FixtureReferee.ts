/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFixtureRefereeDTO } from '../models/CreateFixtureRefereeDTO';
import type { FixtureReferee } from '../models/FixtureReferee';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FixtureReferee {

    /**
     * Create FixtureReferee
     * @param requestBody 
     * @returns FixtureReferee 
     * @throws ApiError
     */
    public static create(
requestBody: CreateFixtureRefereeDTO,
): CancelablePromise<FixtureReferee> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/fixtureReferee',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all FixtureReferees
     * @returns FixtureReferee 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<FixtureReferee>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fixtureReferee',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all FixtureReferees
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns FixtureReferee 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<FixtureReferee>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fixtureReferee/query',
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
     * Get one FixtureReferee
     * @param id 
     * @returns FixtureReferee 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<FixtureReferee> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fixtureReferee/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one FixtureReferee
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: FixtureReferee,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/fixtureReferee/{id}',
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
     * Delete one FixtureReferee
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/fixtureReferee/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
