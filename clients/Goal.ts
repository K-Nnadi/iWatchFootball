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

import { CreateGoalDTO, Goal } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Goal<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags goal
   * @name Create
   * @summary Create Goal
   * @request POST:/goal
   * @secure
   */
  create = (data: CreateGoalDTO, params: RequestParams = {}) =>
    this.request<Goal, void>({
      path: `/goal`,
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
   * @tags goal
   * @name GetAll
   * @summary Get all Goals
   * @request GET:/goal
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Goal[], void>({
      path: `/goal`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags goal
   * @name GetQuery
   * @summary Get all Goals
   * @request GET:/goal/query
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
    this.request<Goal[], void>({
      path: `/goal/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags goal
   * @name GetOne
   * @summary Get one Goal
   * @request GET:/goal/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Goal, void>({
      path: `/goal/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags goal
   * @name UpdateOne
   * @summary Update one Goal
   * @request PATCH:/goal/{id}
   * @secure
   */
  updateOne = (id: number, data: Goal, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/goal/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags goal
   * @name DeleteOne
   * @summary Delete one Goal
   * @request DELETE:/goal/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/goal/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
