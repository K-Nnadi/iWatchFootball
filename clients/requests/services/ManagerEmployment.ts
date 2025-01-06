/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateManagerEmploymentDTO } from '../models/CreateManagerEmploymentDTO';
import type { ManagerEmployment } from '../models/ManagerEmployment';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ManagerEmployment {

    /**
     * Create ManagerEmployment
     * @param requestBody 
     * @returns ManagerEmployment 
     * @throws ApiError
     */
    public static create(
requestBody: CreateManagerEmploymentDTO,
): CancelablePromise<ManagerEmployment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/managerEmployment',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all ManagerEmployments
     * @returns ManagerEmployment 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<ManagerEmployment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/managerEmployment',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all ManagerEmployments
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns ManagerEmployment 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<ManagerEmployment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/managerEmployment/query',
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
     * Get one ManagerEmployment
     * @param id 
     * @returns ManagerEmployment 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<ManagerEmployment> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/managerEmployment/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one ManagerEmployment
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: ManagerEmployment,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/managerEmployment/{id}',
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
     * Delete one ManagerEmployment
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/managerEmployment/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
