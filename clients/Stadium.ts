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

import { CreateStadiumDTO, Stadium } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Stadium<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags stadium
   * @name Create
   * @summary Create Stadium
   * @request POST:/stadium
   * @secure
   */
  create = (data: CreateStadiumDTO, params: RequestParams = {}) =>
    this.request<Stadium, void>({
      path: `/stadium`,
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
   * @tags stadium
   * @name GetAll
   * @summary Get all Stadiums
   * @request GET:/stadium
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Stadium[], void>({
      path: `/stadium`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags stadium
   * @name GetQuery
   * @summary Get all Stadiums
   * @request GET:/stadium/query
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
    this.request<Stadium[], void>({
      path: `/stadium/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags stadium
   * @name GetOne
   * @summary Get one Stadium
   * @request GET:/stadium/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Stadium, void>({
      path: `/stadium/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags stadium
   * @name UpdateOne
   * @summary Update one Stadium
   * @request PATCH:/stadium/{id}
   * @secure
   */
  updateOne = (id: number, data: Stadium, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/stadium/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags stadium
   * @name DeleteOne
   * @summary Delete one Stadium
   * @request DELETE:/stadium/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/stadium/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
