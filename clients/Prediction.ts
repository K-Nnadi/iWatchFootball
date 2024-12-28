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

import { CreatePredictionDTO, Prediction } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Prediction<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags prediction
   * @name Create
   * @summary Create Prediction
   * @request POST:/prediction
   * @secure
   */
  create = (data: CreatePredictionDTO, params: RequestParams = {}) =>
    this.request<Prediction, void>({
      path: `/prediction`,
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
   * @tags prediction
   * @name GetAll
   * @summary Get all Predictions
   * @request GET:/prediction
   * @secure
   */
  getAll = (params: RequestParams = {}) =>
    this.request<Prediction[], void>({
      path: `/prediction`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags prediction
   * @name GetQuery
   * @summary Get all Predictions
   * @request GET:/prediction/query
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
    this.request<Prediction[], void>({
      path: `/prediction/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags prediction
   * @name GetOne
   * @summary Get one Prediction
   * @request GET:/prediction/{id}
   * @secure
   */
  getOne = (id: number, params: RequestParams = {}) =>
    this.request<Prediction, void>({
      path: `/prediction/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags prediction
   * @name UpdateOne
   * @summary Update one Prediction
   * @request PATCH:/prediction/{id}
   * @secure
   */
  updateOne = (id: number, data: Prediction, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/prediction/${id}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags prediction
   * @name DeleteOne
   * @summary Delete one Prediction
   * @request DELETE:/prediction/{id}
   * @secure
   */
  deleteOne = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/prediction/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
}
