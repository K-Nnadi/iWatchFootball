/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { CreateTeamCompetitionSeasonDTO, TeamCompetitionSeason } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class TeamCompetitionSeason<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags teamCompetitionSeason
   * @name Create
   * @summary Create TeamCompetitionSeason
   * @request POST:/teamCompetitionSeason
   * @secure
   */
  create = (data: CreateTeamCompetitionSeasonDTO, params: RequestParams = {}) =>
    this.request<TeamCompetitionSeason, void>({
      path: `/teamCompetitionSeason`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags teamCompetitionSeason
   * @name GetAll
   * @summary Get all TeamCompetitionSeasons
   * @request GET:/teamCompetitionSeason
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<TeamCompetitionSeason[], void>({
      path: `/teamCompetitionSeason`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags teamCompetitionSeason
   * @name GetQuery
   * @summary Get all TeamCompetitionSeasons
   * @request GET:/teamCompetitionSeason/query
   * @secure
   */
  getQuery = (
    query: {
      skip: number;
      take: number;
      withDeleted: boolean;
      loadEagerRelations: boolean;
      transaction: boolean;
      comment: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<TeamCompetitionSeason[], void>({
      path: `/teamCompetitionSeason/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags teamCompetitionSeason
   * @name GetOne
   * @summary Get one TeamCompetitionSeason
   * @request GET:/teamCompetitionSeason/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<TeamCompetitionSeason, void>({
      path: `/teamCompetitionSeason/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags teamCompetitionSeason
   * @name UpdateOne
   * @summary Update one TeamCompetitionSeason
   * @request PATCH:/teamCompetitionSeason/{id}
   * @secure
   */
  updateOne = (id: number, data: TeamCompetitionSeason, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/teamCompetitionSeason/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags teamCompetitionSeason
   * @name DeleteOne
   * @summary Delete one TeamCompetitionSeason
   * @request DELETE:/teamCompetitionSeason/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/teamCompetitionSeason/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
