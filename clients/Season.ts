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

import { CreateSeasonDTO, Season } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Season<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags season
   * @name Create
   * @summary Create Season
   * @request POST:/season
   * @secure
   */
  create = (data: CreateSeasonDTO, params: RequestParams = {}) =>
    this.request<Season, void>({
      path: `/season`,
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
   * @tags season
   * @name GetAll
   * @summary Get all Seasons
   * @request GET:/season
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Season[], void>({
      path: `/season`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags season
   * @name GetQuery
   * @summary Get all Seasons
   * @request GET:/season/query
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
    this.request<Season[], void>({
      path: `/season/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags season
   * @name GetOne
   * @summary Get one Season
   * @request GET:/season/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Season, void>({
      path: `/season/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags season
   * @name UpdateOne
   * @summary Update one Season
   * @request PATCH:/season/{id}
   * @secure
   */
  updateOne = (id: number, data: Season, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/season/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags season
   * @name DeleteOne
   * @summary Delete one Season
   * @request DELETE:/season/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/season/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
