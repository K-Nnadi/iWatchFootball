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

import { CreatePlayerLineUpDTO, PlayerLineUp } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class PlayerLineUp<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags playerLineUp
   * @name Create
   * @summary Create PlayerLineUp
   * @request POST:/playerLineUp
   * @secure
   */
  create = (data: CreatePlayerLineUpDTO, params: RequestParams = {}) =>
    this.request<PlayerLineUp, void>({
      path: `/playerLineUp`,
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
   * @tags playerLineUp
   * @name GetAll
   * @summary Get all PlayerLineUps
   * @request GET:/playerLineUp
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<PlayerLineUp[], void>({
      path: `/playerLineUp`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags playerLineUp
   * @name GetQuery
   * @summary Get all PlayerLineUps
   * @request GET:/playerLineUp/query
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
    this.request<PlayerLineUp[], void>({
      path: `/playerLineUp/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags playerLineUp
   * @name GetOne
   * @summary Get one PlayerLineUp
   * @request GET:/playerLineUp/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<PlayerLineUp, void>({
      path: `/playerLineUp/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags playerLineUp
   * @name UpdateOne
   * @summary Update one PlayerLineUp
   * @request PATCH:/playerLineUp/{id}
   * @secure
   */
  updateOne = (id: number, data: PlayerLineUp, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/playerLineUp/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags playerLineUp
   * @name DeleteOne
   * @summary Delete one PlayerLineUp
   * @request DELETE:/playerLineUp/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/playerLineUp/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
