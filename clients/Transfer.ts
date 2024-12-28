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

import { CreateTransferDTO, Transfer } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Transfer<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags transfer
   * @name Create
   * @summary Create Transfer
   * @request POST:/transfer
   * @secure
   */
  create = (data: CreateTransferDTO, params: RequestParams = {}) =>
    this.request<Transfer, void>({
      path: `/transfer`,
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
   * @tags transfer
   * @name GetAll
   * @summary Get all Transfers
   * @request GET:/transfer
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Transfer[], void>({
      path: `/transfer`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags transfer
   * @name GetQuery
   * @summary Get all Transfers
   * @request GET:/transfer/query
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
    this.request<Transfer[], void>({
      path: `/transfer/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags transfer
   * @name GetOne
   * @summary Get one Transfer
   * @request GET:/transfer/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Transfer, void>({
      path: `/transfer/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags transfer
   * @name UpdateOne
   * @summary Update one Transfer
   * @request PATCH:/transfer/{id}
   * @secure
   */
  updateOne = (id: number, data: Transfer, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/transfer/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags transfer
   * @name DeleteOne
   * @summary Delete one Transfer
   * @request DELETE:/transfer/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/transfer/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
