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

import { CreateUserDTO, User } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class User<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags user
   * @name Create
   * @summary Create User
   * @request POST:/user
   * @secure
   */
  create = (data: CreateUserDTO, params: RequestParams = {}) =>
    this.request<User, void>({
      path: `/user`,
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
   * @tags user
   * @name GetAll
   * @summary Get all Users
   * @request GET:/user
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<User[], void>({
      path: `/user`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @name GetQuery
   * @summary Get all Users
   * @request GET:/user/query
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
    this.request<User[], void>({
      path: `/user/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @name GetOne
   * @summary Get one User
   * @request GET:/user/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<User, void>({
      path: `/user/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @name UpdateOne
   * @summary Update one User
   * @request PATCH:/user/{id}
   * @secure
   */
  updateOne = (id: number, data: User, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/user/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @name DeleteOne
   * @summary Delete one User
   * @request DELETE:/user/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/user/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
