/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type {Address} from '../models/Address';
import type {CreateAddressDTO} from '../models/CreateAddressDTO';

import type {CancelablePromise} from '../core/CancelablePromise';
import {OpenAPI} from '../core/OpenAPI';
import {request as __request} from '../core/request';

export class Address {

    /**
     * Create Address
     * @param requestBody
     * @returns Address
     * @throws ApiError
     */
    public static create(
        requestBody: CreateAddressDTO,
    ): CancelablePromise<Address> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/address',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Addresss
     * @returns Address
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<Address>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/address',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all Addresss
     * @param skip
     * @param take
     * @param withDeleted
     * @param loadEagerRelations
     * @param transaction
     * @param comment
     * @returns Address
     * @throws ApiError
     */
    public static getQuery(
        skip: number,
        take: number,
        withDeleted: boolean,
        loadEagerRelations: boolean,
        transaction: boolean,
        comment: string,
    ): CancelablePromise<Array<Address>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/address/query',
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
     * Get one Address
     * @param id
     * @returns Address
     * @throws ApiError
     */
    public static getOne(
        id: number,
    ): CancelablePromise<Address> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/address/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one Address
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static updateOne(
        id: number,
        requestBody: Address,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/address/{id}',
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
     * Delete one Address
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static deleteOne(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/address/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
