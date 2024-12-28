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

import { CreateLogDTO, Log } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Log<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags log
   * @name Create
   * @summary Create Log
   * @request POST:/log
   * @secure
   */
  create = (data: CreateLogDTO, params: RequestParams = {}) =>
    this.request<Log, void>({
      path: `/log`,
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
   * @tags log
   * @name GetAll
   * @summary Get all Logs
   * @request GET:/log
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Log[], void>({
      path: `/log`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags log
   * @name GetQuery
   * @summary Get all Logs
   * @request GET:/log/query
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
    this.request<Log[], void>({
      path: `/log/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags log
   * @name GetOne
   * @summary Get one Log
   * @request GET:/log/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Log, void>({
      path: `/log/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags log
   * @name UpdateOne
   * @summary Update one Log
   * @request PATCH:/log/{id}
   * @secure
   */
  updateOne = (id: number, data: Log, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/log/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags log
   * @name DeleteOne
   * @summary Delete one Log
   * @request DELETE:/log/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/log/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
