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

import { CreateFixtureRefereeDTO, FixtureReferee } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class FixtureReferee<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags fixtureReferee
   * @name Create
   * @summary Create FixtureReferee
   * @request POST:/fixtureReferee
   * @secure
   */
  create = (data: CreateFixtureRefereeDTO, params: RequestParams = {}) =>
    this.request<FixtureReferee, void>({
      path: `/fixtureReferee`,
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
   * @tags fixtureReferee
   * @name GetAll
   * @summary Get all FixtureReferees
   * @request GET:/fixtureReferee
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<FixtureReferee[], void>({
      path: `/fixtureReferee`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags fixtureReferee
   * @name GetQuery
   * @summary Get all FixtureReferees
   * @request GET:/fixtureReferee/query
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
    this.request<FixtureReferee[], void>({
      path: `/fixtureReferee/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags fixtureReferee
   * @name GetOne
   * @summary Get one FixtureReferee
   * @request GET:/fixtureReferee/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<FixtureReferee, void>({
      path: `/fixtureReferee/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags fixtureReferee
   * @name UpdateOne
   * @summary Update one FixtureReferee
   * @request PATCH:/fixtureReferee/{id}
   * @secure
   */
  updateOne = (id: number, data: FixtureReferee, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/fixtureReferee/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags fixtureReferee
   * @name DeleteOne
   * @summary Delete one FixtureReferee
   * @request DELETE:/fixtureReferee/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/fixtureReferee/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
