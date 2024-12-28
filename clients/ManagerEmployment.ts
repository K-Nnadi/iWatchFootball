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

import { CreateManagerEmploymentDTO, ManagerEmployment } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class ManagerEmployment<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags managerEmployment
   * @name Create
   * @summary Create ManagerEmployment
   * @request POST:/managerEmployment
   * @secure
   */
  create = (data: CreateManagerEmploymentDTO, params: RequestParams = {}) =>
    this.request<ManagerEmployment, void>({
      path: `/managerEmployment`,
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
   * @tags managerEmployment
   * @name GetAll
   * @summary Get all ManagerEmployments
   * @request GET:/managerEmployment
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<ManagerEmployment[], void>({
      path: `/managerEmployment`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags managerEmployment
   * @name GetQuery
   * @summary Get all ManagerEmployments
   * @request GET:/managerEmployment/query
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
    this.request<ManagerEmployment[], void>({
      path: `/managerEmployment/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags managerEmployment
   * @name GetOne
   * @summary Get one ManagerEmployment
   * @request GET:/managerEmployment/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<ManagerEmployment, void>({
      path: `/managerEmployment/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags managerEmployment
   * @name UpdateOne
   * @summary Update one ManagerEmployment
   * @request PATCH:/managerEmployment/{id}
   * @secure
   */
  updateOne = (id: number, data: ManagerEmployment, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/managerEmployment/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags managerEmployment
   * @name DeleteOne
   * @summary Delete one ManagerEmployment
   * @request DELETE:/managerEmployment/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/managerEmployment/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
