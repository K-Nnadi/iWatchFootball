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

import { CreateTrophyDTO, Trophy } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Trophy<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags trophy
   * @name Create
   * @summary Create Trophy
   * @request POST:/trophy
   * @secure
   */
  create = (data: CreateTrophyDTO, params: RequestParams = {}) =>
    this.request<Trophy, void>({
      path: `/trophy`,
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
   * @tags trophy
   * @name GetAll
   * @summary Get all Trophys
   * @request GET:/trophy
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Trophy[], void>({
      path: `/trophy`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags trophy
   * @name GetQuery
   * @summary Get all Trophys
   * @request GET:/trophy/query
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
    this.request<Trophy[], void>({
      path: `/trophy/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags trophy
   * @name GetOne
   * @summary Get one Trophy
   * @request GET:/trophy/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Trophy, void>({
      path: `/trophy/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags trophy
   * @name UpdateOne
   * @summary Update one Trophy
   * @request PATCH:/trophy/{id}
   * @secure
   */
  updateOne = (id: number, data: Trophy, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/trophy/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags trophy
   * @name DeleteOne
   * @summary Delete one Trophy
   * @request DELETE:/trophy/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/trophy/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
