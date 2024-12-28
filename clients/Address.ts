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

import { Address, CreateAddressDTO } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Address<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags address
   * @name Create
   * @summary Create Address
   * @request POST:/address
   * @secure
   */
  create = (data: CreateAddressDTO, params: RequestParams = {}) =>
    this.request<Address, void>({
      path: `/address`,
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
   * @tags address
   * @name GetAll
   * @summary Get all Addresss
   * @request GET:/address
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Address[], void>({
      path: `/address`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags address
   * @name GetQuery
   * @summary Get all Addresss
   * @request GET:/address/query
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
    this.request<Address[], void>({
      path: `/address/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags address
   * @name GetOne
   * @summary Get one Address
   * @request GET:/address/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Address, void>({
      path: `/address/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags address
   * @name UpdateOne
   * @summary Update one Address
   * @request PATCH:/address/{id}
   * @secure
   */
  updateOne = (id: number, data: Address, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/address/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags address
   * @name DeleteOne
   * @summary Delete one Address
   * @request DELETE:/address/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/address/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
