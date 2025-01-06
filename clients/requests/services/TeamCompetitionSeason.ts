/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTeamCompetitionSeasonDTO } from '../models/CreateTeamCompetitionSeasonDTO';
import type { TeamCompetitionSeason } from '../models/TeamCompetitionSeason';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TeamCompetitionSeason {

    /**
     * Create TeamCompetitionSeason
     * @param requestBody 
     * @returns TeamCompetitionSeason 
     * @throws ApiError
     */
    public static create(
requestBody: CreateTeamCompetitionSeasonDTO,
): CancelablePromise<TeamCompetitionSeason> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/teamCompetitionSeason',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all TeamCompetitionSeasons
     * @returns TeamCompetitionSeason 
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<TeamCompetitionSeason>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/teamCompetitionSeason',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get all TeamCompetitionSeasons
     * @param skip 
     * @param take 
     * @param withDeleted 
     * @param loadEagerRelations 
     * @param transaction 
     * @param comment 
     * @returns TeamCompetitionSeason 
     * @throws ApiError
     */
    public static getQuery(
skip: number,
take: number,
withDeleted: boolean,
loadEagerRelations: boolean,
transaction: boolean,
comment: string,
): CancelablePromise<Array<TeamCompetitionSeason>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/teamCompetitionSeason/query',
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
     * Get one TeamCompetitionSeason
     * @param id 
     * @returns TeamCompetitionSeason 
     * @throws ApiError
     */
    public static getOne(
id: number,
): CancelablePromise<TeamCompetitionSeason> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/teamCompetitionSeason/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Update one TeamCompetitionSeason
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateOne(
id: number,
requestBody: TeamCompetitionSeason,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/teamCompetitionSeason/{id}',
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
     * Delete one TeamCompetitionSeason
     * @param id 
     * @returns any 
     * @throws ApiError
     */
    public static deleteOne(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/teamCompetitionSeason/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
