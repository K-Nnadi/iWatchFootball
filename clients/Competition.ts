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

import { Competition, CreateCompetitionDTO } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Competition<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags competition
   * @name Create
   * @summary Create Competition
   * @request POST:/competition
   * @secure
   */
  create = (data: CreateCompetitionDTO, params: RequestParams = {}) =>
    this.request<Competition, void>({
      path: `/competition`,
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
   * @tags competition
   * @name GetAll
   * @summary Get all Competitions
   * @request GET:/competition
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Competition[], void>({
      path: `/competition`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags competition
   * @name GetQuery
   * @summary Get all Competitions
   * @request GET:/competition/query
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
    this.request<Competition[], void>({
      path: `/competition/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags competition
   * @name GetOne
   * @summary Get one Competition
   * @request GET:/competition/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Competition, void>({
      path: `/competition/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags competition
   * @name UpdateOne
   * @summary Update one Competition
   * @request PATCH:/competition/{id}
   * @secure
   */
  updateOne = (id: number, data: Competition, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/competition/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags competition
   * @name DeleteOne
   * @summary Delete one Competition
   * @request DELETE:/competition/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/competition/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
