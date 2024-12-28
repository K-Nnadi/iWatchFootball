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

import { CreateManagerDTO, Manager } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Manager<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags manager
   * @name Create
   * @summary Create Manager
   * @request POST:/manager
   * @secure
   */
  create = (data: CreateManagerDTO, params: RequestParams = {}) =>
    this.request<Manager, void>({
      path: `/manager`,
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
   * @tags manager
   * @name GetAll
   * @summary Get all Managers
   * @request GET:/manager
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Manager[], void>({
      path: `/manager`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags manager
   * @name GetQuery
   * @summary Get all Managers
   * @request GET:/manager/query
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
    this.request<Manager[], void>({
      path: `/manager/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags manager
   * @name GetOne
   * @summary Get one Manager
   * @request GET:/manager/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Manager, void>({
      path: `/manager/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags manager
   * @name UpdateOne
   * @summary Update one Manager
   * @request PATCH:/manager/{id}
   * @secure
   */
  updateOne = (id: number, data: Manager, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/manager/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags manager
   * @name DeleteOne
   * @summary Delete one Manager
   * @request DELETE:/manager/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/manager/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
