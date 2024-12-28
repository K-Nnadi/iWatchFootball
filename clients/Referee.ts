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

import { CreateRefereeDTO, Referee } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Referee<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags referee
   * @name Create
   * @summary Create Referee
   * @request POST:/referee
   * @secure
   */
  create = (data: CreateRefereeDTO, params: RequestParams = {}) =>
    this.request<Referee, void>({
      path: `/referee`,
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
   * @tags referee
   * @name GetAll
   * @summary Get all Referees
   * @request GET:/referee
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Referee[], void>({
      path: `/referee`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags referee
   * @name GetQuery
   * @summary Get all Referees
   * @request GET:/referee/query
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
    this.request<Referee[], void>({
      path: `/referee/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags referee
   * @name GetOne
   * @summary Get one Referee
   * @request GET:/referee/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Referee, void>({
      path: `/referee/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags referee
   * @name UpdateOne
   * @summary Update one Referee
   * @request PATCH:/referee/{id}
   * @secure
   */
  updateOne = (id: number, data: Referee, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/referee/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags referee
   * @name DeleteOne
   * @summary Delete one Referee
   * @request DELETE:/referee/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/referee/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
