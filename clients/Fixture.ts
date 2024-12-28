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

import { CreateFixtureDTO, Fixture } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Fixture<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags fixture
   * @name Create
   * @summary Create Fixture
   * @request POST:/fixture
   * @secure
   */
  create = (data: CreateFixtureDTO, params: RequestParams = {}) =>
    this.request<Fixture, void>({
      path: `/fixture`,
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
   * @tags fixture
   * @name GetAll
   * @summary Get all Fixtures
   * @request GET:/fixture
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Fixture[], void>({
      path: `/fixture`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags fixture
   * @name GetQuery
   * @summary Get all Fixtures
   * @request GET:/fixture/query
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
    this.request<Fixture[], void>({
      path: `/fixture/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags fixture
   * @name GetOne
   * @summary Get one Fixture
   * @request GET:/fixture/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Fixture, void>({
      path: `/fixture/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags fixture
   * @name UpdateOne
   * @summary Update one Fixture
   * @request PATCH:/fixture/{id}
   * @secure
   */
  updateOne = (id: number, data: Fixture, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/fixture/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags fixture
   * @name DeleteOne
   * @summary Delete one Fixture
   * @request DELETE:/fixture/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/fixture/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
