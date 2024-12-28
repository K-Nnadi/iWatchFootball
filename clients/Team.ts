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

import { CreateTeamDTO, Team } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Team<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags team
   * @name Create
   * @summary Create Team
   * @request POST:/team
   * @secure
   */
  create = (data: CreateTeamDTO, params: RequestParams = {}) =>
    this.request<Team, void>({
      path: `/team`,
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
   * @tags team
   * @name GetAll
   * @summary Get all Teams
   * @request GET:/team
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Team[], void>({
      path: `/team`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags team
   * @name GetQuery
   * @summary Get all Teams
   * @request GET:/team/query
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
    this.request<Team[], void>({
      path: `/team/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags team
   * @name GetOne
   * @summary Get one Team
   * @request GET:/team/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Team, void>({
      path: `/team/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags team
   * @name UpdateOne
   * @summary Update one Team
   * @request PATCH:/team/{id}
   * @secure
   */
  updateOne = (id: number, data: Team, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/team/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags team
   * @name DeleteOne
   * @summary Delete one Team
   * @request DELETE:/team/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/team/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
