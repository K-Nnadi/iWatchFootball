import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CommsPreference, CommsPreferenceDTO, GetCountCommsPreferenceParams, GetQueryCommsPreferenceParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create CommsPreference
 */
export declare const createCommsPreference: (commsPreferenceDTO: CommsPreferenceDTO) => Promise<CommsPreference>;
export declare const getCreateCommsPreferenceMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CommsPreference, TError, {
        data: CommsPreferenceDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<CommsPreference, TError, {
    data: CommsPreferenceDTO;
}, TContext>;
export type CreateCommsPreferenceMutationResult = NonNullable<Awaited<ReturnType<typeof createCommsPreference>>>;
export type CreateCommsPreferenceMutationBody = CommsPreferenceDTO;
export type CreateCommsPreferenceMutationError = void;
/**
* @summary Create CommsPreference
*/
export declare const useCreateCommsPreference: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CommsPreference, TError, {
        data: CommsPreferenceDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<CommsPreference, TError, {
    data: CommsPreferenceDTO;
}, TContext>;
/**
* @summary Get all CommsPreferences
*/
export declare const getAllCommsPreference: (signal?: AbortSignal) => Promise<CommsPreference[]>;
export declare const getGetAllCommsPreferenceQueryKey: () => readonly ["/commsPreference"];
export declare const getGetAllCommsPreferenceQueryOptions: <TData = CommsPreference[], TError = void>(options?: {
    query?: UseQueryOptions<CommsPreference[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<CommsPreference[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllCommsPreferenceQueryResult = NonNullable<Awaited<ReturnType<typeof getAllCommsPreference>>>;
export type GetAllCommsPreferenceQueryError = void;
/**
 * @summary Get all CommsPreferences
 */
export declare const useGetAllCommsPreference: <TData = CommsPreference[], TError = void>(options?: {
    query?: UseQueryOptions<CommsPreference[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all CommsPreferences
 */
export declare const getQueryCommsPreference: (params?: GetQueryCommsPreferenceParams, signal?: AbortSignal) => Promise<CommsPreference[]>;
export declare const getGetQueryCommsPreferenceQueryKey: (params?: GetQueryCommsPreferenceParams) => readonly ["/commsPreference/query", ...GetQueryCommsPreferenceParams[]];
export declare const getGetQueryCommsPreferenceQueryOptions: <TData = CommsPreference[], TError = void>(params?: GetQueryCommsPreferenceParams, options?: {
    query?: UseQueryOptions<CommsPreference[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<CommsPreference[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryCommsPreferenceQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryCommsPreference>>>;
export type GetQueryCommsPreferenceQueryError = void;
/**
 * @summary Get all CommsPreferences
 */
export declare const useGetQueryCommsPreference: <TData = CommsPreference[], TError = void>(params?: GetQueryCommsPreferenceParams, options?: {
    query?: UseQueryOptions<CommsPreference[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of CommsPreferences
 */
export declare const getCountCommsPreference: (params?: GetCountCommsPreferenceParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountCommsPreferenceQueryKey: (params?: GetCountCommsPreferenceParams) => readonly ["/commsPreference/count", ...GetCountCommsPreferenceParams[]];
export declare const getGetCountCommsPreferenceQueryOptions: <TData = number, TError = void>(params?: GetCountCommsPreferenceParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountCommsPreferenceQueryResult = NonNullable<Awaited<ReturnType<typeof getCountCommsPreference>>>;
export type GetCountCommsPreferenceQueryError = void;
/**
 * @summary Get count of CommsPreferences
 */
export declare const useGetCountCommsPreference: <TData = number, TError = void>(params?: GetCountCommsPreferenceParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one CommsPreference
 */
export declare const getOneCommsPreference: (id: number, signal?: AbortSignal) => Promise<CommsPreference>;
export declare const getGetOneCommsPreferenceQueryKey: (id: number) => readonly [`/commsPreference/${number}`];
export declare const getGetOneCommsPreferenceQueryOptions: <TData = CommsPreference, TError = void>(id: number, options?: {
    query?: UseQueryOptions<CommsPreference, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<CommsPreference, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneCommsPreferenceQueryResult = NonNullable<Awaited<ReturnType<typeof getOneCommsPreference>>>;
export type GetOneCommsPreferenceQueryError = void;
/**
 * @summary Get one CommsPreference
 */
export declare const useGetOneCommsPreference: <TData = CommsPreference, TError = void>(id: number, options?: {
    query?: UseQueryOptions<CommsPreference, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one CommsPreference
 */
export declare const updateOneCommsPreference: (id: number, commsPreference: CommsPreference) => Promise<void>;
export declare const getUpdateOneCommsPreferenceMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: CommsPreference;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: CommsPreference;
}, TContext>;
export type UpdateOneCommsPreferenceMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneCommsPreference>>>;
export type UpdateOneCommsPreferenceMutationBody = CommsPreference;
export type UpdateOneCommsPreferenceMutationError = void;
/**
* @summary Update one CommsPreference
*/
export declare const useUpdateOneCommsPreference: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: CommsPreference;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: CommsPreference;
}, TContext>;
/**
* @summary Delete one CommsPreference
*/
export declare const deleteOneCommsPreference: (id: number) => Promise<void>;
export declare const getDeleteOneCommsPreferenceMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneCommsPreferenceMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneCommsPreference>>>;
export type DeleteOneCommsPreferenceMutationError = void;
/**
* @summary Delete one CommsPreference
*/
export declare const useDeleteOneCommsPreference: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for CommsPreference
*/
export declare const uploadCommsPreference: () => Promise<void>;
export declare const getUploadCommsPreferenceMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadCommsPreferenceMutationResult = NonNullable<Awaited<ReturnType<typeof uploadCommsPreference>>>;
export type UploadCommsPreferenceMutationError = void;
/**
* @summary Upload a file for CommsPreference
*/
export declare const useUploadCommsPreference: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to CommsPreference
*/
export declare const downloadCommsPreference: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadCommsPreferenceQueryKey: (filename: string) => readonly [`/commsPreference/download/${string}`];
export declare const getDownloadCommsPreferenceQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadCommsPreferenceQueryResult = NonNullable<Awaited<ReturnType<typeof downloadCommsPreference>>>;
export type DownloadCommsPreferenceQueryError = void;
/**
 * @summary Download file related to CommsPreference
 */
export declare const useDownloadCommsPreference: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
