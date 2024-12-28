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

import { CreateSubstitutionDTO, Substitution } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Substitution<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags substitution
   * @name Create
   * @summary Create Substitution
   * @request POST:/substitution
   * @secure
   */
  create = (data: CreateSubstitutionDTO, params: RequestParams = {}) =>
    this.request<Substitution, void>({
      path: `/substitution`,
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
   * @tags substitution
   * @name GetAll
   * @summary Get all Substitutions
   * @request GET:/substitution
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Substitution[], void>({
      path: `/substitution`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags substitution
   * @name GetQuery
   * @summary Get all Substitutions
   * @request GET:/substitution/query
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
    this.request<Substitution[], void>({
      path: `/substitution/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags substitution
   * @name GetOne
   * @summary Get one Substitution
   * @request GET:/substitution/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Substitution, void>({
      path: `/substitution/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags substitution
   * @name UpdateOne
   * @summary Update one Substitution
   * @request PATCH:/substitution/{id}
   * @secure
   */
  updateOne = (id: number, data: Substitution, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/substitution/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags substitution
   * @name DeleteOne
   * @summary Delete one Substitution
   * @request DELETE:/substitution/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/substitution/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
