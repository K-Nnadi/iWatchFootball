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

import { CreateGenericTokenDTO, GenericToken } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class GenericToken<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags genericToken
   * @name Create
   * @summary Create GenericToken
   * @request POST:/genericToken
   * @secure
   */
  create = (data: CreateGenericTokenDTO, params: RequestParams = {}) =>
    this.request<GenericToken, void>({
      path: `/genericToken`,
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
   * @tags genericToken
   * @name GetAll
   * @summary Get all GenericTokens
   * @request GET:/genericToken
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<GenericToken[], void>({
      path: `/genericToken`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags genericToken
   * @name GetQuery
   * @summary Get all GenericTokens
   * @request GET:/genericToken/query
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
    this.request<GenericToken[], void>({
      path: `/genericToken/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags genericToken
   * @name GetOne
   * @summary Get one GenericToken
   * @request GET:/genericToken/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<GenericToken, void>({
      path: `/genericToken/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags genericToken
   * @name UpdateOne
   * @summary Update one GenericToken
   * @request PATCH:/genericToken/{id}
   * @secure
   */
  updateOne = (id: number, data: GenericToken, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/genericToken/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags genericToken
   * @name DeleteOne
   * @summary Delete one GenericToken
   * @request DELETE:/genericToken/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/genericToken/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
