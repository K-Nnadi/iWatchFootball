import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePredictionDTO, GetCountPredictionParams, GetQueryPredictionParams, Prediction } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Prediction
 */
export declare const createPrediction: (createPredictionDTO: CreatePredictionDTO) => Promise<Prediction>;
export declare const getCreatePredictionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Prediction, TError, {
        data: CreatePredictionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Prediction, TError, {
    data: CreatePredictionDTO;
}, TContext>;
export type CreatePredictionMutationResult = NonNullable<Awaited<ReturnType<typeof createPrediction>>>;
export type CreatePredictionMutationBody = CreatePredictionDTO;
export type CreatePredictionMutationError = void;
/**
* @summary Create Prediction
*/
export declare const useCreatePrediction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Prediction, TError, {
        data: CreatePredictionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Prediction, TError, {
    data: CreatePredictionDTO;
}, TContext>;
/**
* @summary Get all Predictions
*/
export declare const getAllPrediction: (signal?: AbortSignal) => Promise<Prediction[]>;
export declare const getGetAllPredictionQueryKey: () => readonly ["/prediction"];
export declare const getGetAllPredictionQueryOptions: <TData = Prediction[], TError = void>(options?: {
    query?: UseQueryOptions<Prediction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Prediction[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllPredictionQueryResult = NonNullable<Awaited<ReturnType<typeof getAllPrediction>>>;
export type GetAllPredictionQueryError = void;
/**
 * @summary Get all Predictions
 */
export declare const useGetAllPrediction: <TData = Prediction[], TError = void>(options?: {
    query?: UseQueryOptions<Prediction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Predictions
 */
export declare const getQueryPrediction: (params?: GetQueryPredictionParams, signal?: AbortSignal) => Promise<Prediction[]>;
export declare const getGetQueryPredictionQueryKey: (params?: GetQueryPredictionParams) => readonly ["/prediction/query", ...GetQueryPredictionParams[]];
export declare const getGetQueryPredictionQueryOptions: <TData = Prediction[], TError = void>(params?: GetQueryPredictionParams, options?: {
    query?: UseQueryOptions<Prediction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Prediction[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryPredictionQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryPrediction>>>;
export type GetQueryPredictionQueryError = void;
/**
 * @summary Get all Predictions
 */
export declare const useGetQueryPrediction: <TData = Prediction[], TError = void>(params?: GetQueryPredictionParams, options?: {
    query?: UseQueryOptions<Prediction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Predictions
 */
export declare const getCountPrediction: (params?: GetCountPredictionParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountPredictionQueryKey: (params?: GetCountPredictionParams) => readonly ["/prediction/count", ...GetCountPredictionParams[]];
export declare const getGetCountPredictionQueryOptions: <TData = number, TError = void>(params?: GetCountPredictionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountPredictionQueryResult = NonNullable<Awaited<ReturnType<typeof getCountPrediction>>>;
export type GetCountPredictionQueryError = void;
/**
 * @summary Get count of Predictions
 */
export declare const useGetCountPrediction: <TData = number, TError = void>(params?: GetCountPredictionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Prediction
 */
export declare const getOnePrediction: (id: number, signal?: AbortSignal) => Promise<Prediction>;
export declare const getGetOnePredictionQueryKey: (id: number) => readonly [`/prediction/${number}`];
export declare const getGetOnePredictionQueryOptions: <TData = Prediction, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Prediction, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Prediction, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOnePredictionQueryResult = NonNullable<Awaited<ReturnType<typeof getOnePrediction>>>;
export type GetOnePredictionQueryError = void;
/**
 * @summary Get one Prediction
 */
export declare const useGetOnePrediction: <TData = Prediction, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Prediction, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Prediction
 */
export declare const updateOnePrediction: (id: number, prediction: Prediction) => Promise<void>;
export declare const getUpdateOnePredictionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Prediction;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Prediction;
}, TContext>;
export type UpdateOnePredictionMutationResult = NonNullable<Awaited<ReturnType<typeof updateOnePrediction>>>;
export type UpdateOnePredictionMutationBody = Prediction;
export type UpdateOnePredictionMutationError = void;
/**
* @summary Update one Prediction
*/
export declare const useUpdateOnePrediction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Prediction;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Prediction;
}, TContext>;
/**
* @summary Delete one Prediction
*/
export declare const deleteOnePrediction: (id: number) => Promise<void>;
export declare const getDeleteOnePredictionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOnePredictionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOnePrediction>>>;
export type DeleteOnePredictionMutationError = void;
/**
* @summary Delete one Prediction
*/
export declare const useDeleteOnePrediction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Prediction
*/
export declare const uploadPrediction: () => Promise<void>;
export declare const getUploadPredictionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadPredictionMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPrediction>>>;
export type UploadPredictionMutationError = void;
/**
* @summary Upload a file for Prediction
*/
export declare const useUploadPrediction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Prediction
*/
export declare const downloadPrediction: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadPredictionQueryKey: (filename: string) => readonly [`/prediction/download/${string}`];
export declare const getDownloadPredictionQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadPredictionQueryResult = NonNullable<Awaited<ReturnType<typeof downloadPrediction>>>;
export type DownloadPredictionQueryError = void;
/**
 * @summary Download file related to Prediction
 */
export declare const useDownloadPrediction: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
