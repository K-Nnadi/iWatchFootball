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

import { CreateInjuryDTO, Injury } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Injury<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags injury
   * @name Create
   * @summary Create Injury
   * @request POST:/injury
   * @secure
   */
  create = (data: CreateInjuryDTO, params: RequestParams = {}) =>
    this.request<Injury, void>({
      path: `/injury`,
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
   * @tags injury
   * @name GetAll
   * @summary Get all Injurys
   * @request GET:/injury
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Injury[], void>({
      path: `/injury`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags injury
   * @name GetQuery
   * @summary Get all Injurys
   * @request GET:/injury/query
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
    this.request<Injury[], void>({
      path: `/injury/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags injury
   * @name GetOne
   * @summary Get one Injury
   * @request GET:/injury/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Injury, void>({
      path: `/injury/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags injury
   * @name UpdateOne
   * @summary Update one Injury
   * @request PATCH:/injury/{id}
   * @secure
   */
  updateOne = (id: number, data: Injury, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/injury/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags injury
   * @name DeleteOne
   * @summary Delete one Injury
   * @request DELETE:/injury/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/injury/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
