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

import { Card, CreateCardDTO } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Card<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags card
   * @name Create
   * @summary Create Card
   * @request POST:/card
   * @secure
   */
  create = (data: CreateCardDTO, params: RequestParams = {}) =>
    this.request<Card, void>({
      path: `/card`,
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
   * @tags card
   * @name GetAll
   * @summary Get all Cards
   * @request GET:/card
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Card[], void>({
      path: `/card`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags card
   * @name GetQuery
   * @summary Get all Cards
   * @request GET:/card/query
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
    this.request<Card[], void>({
      path: `/card/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags card
   * @name GetOne
   * @summary Get one Card
   * @request GET:/card/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Card, void>({
      path: `/card/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags card
   * @name UpdateOne
   * @summary Update one Card
   * @request PATCH:/card/{id}
   * @secure
   */
  updateOne = (id: number, data: Card, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/card/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags card
   * @name DeleteOne
   * @summary Delete one Card
   * @request DELETE:/card/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/card/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
