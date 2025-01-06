/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSubstitutionDTO } from '../models/CreateSubstitutionDTO';
import type { Substitution } from '../models/Substitution';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Substitution {

    /**
     * Create Substitution
     * @param requestBody 
     * @returns Substitution 
     * @throws ApiError
     */
    public static create(
requestBody: CreateSubstitutionDTO,
): CancelablePromise<Substitution> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/substitution',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Substitutions
     * @returns Substitution 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Substitution>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/substitution',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Substitutions
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns Substitution 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<Substitution>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/substitution/query',
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
     * Get one Substitution
     * @param id 
     * @returns Substitution 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<Substitution> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/substitution/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Substitution
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: Substitution,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/substitution/{id}',
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
     * Delete one Substitution
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/substitution/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
