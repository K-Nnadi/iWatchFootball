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

import { CreatePositionDTO, Position } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Position<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags position
   * @name Create
   * @summary Create Position
   * @request POST:/position
   * @secure
   */
  create = (data: CreatePositionDTO, params: RequestParams = {}) =>
    this.request<Position, void>({
      path: `/position`,
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
   * @tags position
   * @name GetAll
   * @summary Get all Positions
   * @request GET:/position
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Position[], void>({
      path: `/position`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags position
   * @name GetQuery
   * @summary Get all Positions
   * @request GET:/position/query
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
    this.request<Position[], void>({
      path: `/position/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags position
   * @name GetOne
   * @summary Get one Position
   * @request GET:/position/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Position, void>({
      path: `/position/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags position
   * @name UpdateOne
   * @summary Update one Position
   * @request PATCH:/position/{id}
   * @secure
   */
  updateOne = (id: number, data: Position, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/position/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags position
   * @name DeleteOne
   * @summary Delete one Position
   * @request DELETE:/position/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/position/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
