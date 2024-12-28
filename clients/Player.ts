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

import { CreatePlayerDTO, Player } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Player<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags player
   * @name Create
   * @summary Create Player
   * @request POST:/player
   * @secure
   */
  create = (data: CreatePlayerDTO, params: RequestParams = {}) =>
    this.request<Player, void>({
      path: `/player`,
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
   * @tags player
   * @name GetAll
   * @summary Get all Players
   * @request GET:/player
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Player[], void>({
      path: `/player`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags player
   * @name GetQuery
   * @summary Get all Players
   * @request GET:/player/query
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
    this.request<Player[], void>({
      path: `/player/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags player
   * @name GetOne
   * @summary Get one Player
   * @request GET:/player/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Player, void>({
      path: `/player/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags player
   * @name UpdateOne
   * @summary Update one Player
   * @request PATCH:/player/{id}
   * @secure
   */
  updateOne = (id: number, data: Player, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/player/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags player
   * @name DeleteOne
   * @summary Delete one Player
   * @request DELETE:/player/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/player/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
