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

import { CreateLineUpDTO, LineUp } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class LineUp<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags lineUp
   * @name Create
   * @summary Create LineUp
   * @request POST:/lineUp
   * @secure
   */
  create = (data: CreateLineUpDTO, params: RequestParams = {}) =>
    this.request<LineUp, void>({
      path: `/lineUp`,
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
   * @tags lineUp
   * @name GetAll
   * @summary Get all LineUps
   * @request GET:/lineUp
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<LineUp[], void>({
      path: `/lineUp`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags lineUp
   * @name GetQuery
   * @summary Get all LineUps
   * @request GET:/lineUp/query
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
    this.request<LineUp[], void>({
      path: `/lineUp/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags lineUp
   * @name GetOne
   * @summary Get one LineUp
   * @request GET:/lineUp/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<LineUp, void>({
      path: `/lineUp/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags lineUp
   * @name UpdateOne
   * @summary Update one LineUp
   * @request PATCH:/lineUp/{id}
   * @secure
   */
  updateOne = (id: number, data: LineUp, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/lineUp/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags lineUp
   * @name DeleteOne
   * @summary Delete one LineUp
   * @request DELETE:/lineUp/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/lineUp/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
