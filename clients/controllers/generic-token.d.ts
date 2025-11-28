import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateGenericTokenDTO, GenericToken, GetCountGenericTokenParams, GetQueryGenericTokenParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create GenericToken
 */
export declare const createGenericToken: (createGenericTokenDTO: CreateGenericTokenDTO) => Promise<GenericToken>;
export declare const getCreateGenericTokenMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<GenericToken, TError, {
        data: CreateGenericTokenDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<GenericToken, TError, {
    data: CreateGenericTokenDTO;
}, TContext>;
export type CreateGenericTokenMutationResult = NonNullable<Awaited<ReturnType<typeof createGenericToken>>>;
export type CreateGenericTokenMutationBody = CreateGenericTokenDTO;
export type CreateGenericTokenMutationError = void;
/**
* @summary Create GenericToken
*/
export declare const useCreateGenericToken: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<GenericToken, TError, {
        data: CreateGenericTokenDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<GenericToken, TError, {
    data: CreateGenericTokenDTO;
}, TContext>;
/**
* @summary Get all GenericTokens
*/
export declare const getAllGenericToken: (signal?: AbortSignal) => Promise<GenericToken[]>;
export declare const getGetAllGenericTokenQueryKey: () => readonly ["/genericToken"];
export declare const getGetAllGenericTokenQueryOptions: <TData = GenericToken[], TError = void>(options?: {
    query?: UseQueryOptions<GenericToken[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<GenericToken[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllGenericTokenQueryResult = NonNullable<Awaited<ReturnType<typeof getAllGenericToken>>>;
export type GetAllGenericTokenQueryError = void;
/**
 * @summary Get all GenericTokens
 */
export declare const useGetAllGenericToken: <TData = GenericToken[], TError = void>(options?: {
    query?: UseQueryOptions<GenericToken[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all GenericTokens
 */
export declare const getQueryGenericToken: (params?: GetQueryGenericTokenParams, signal?: AbortSignal) => Promise<GenericToken[]>;
export declare const getGetQueryGenericTokenQueryKey: (params?: GetQueryGenericTokenParams) => readonly ["/genericToken/query", ...GetQueryGenericTokenParams[]];
export declare const getGetQueryGenericTokenQueryOptions: <TData = GenericToken[], TError = void>(params?: GetQueryGenericTokenParams, options?: {
    query?: UseQueryOptions<GenericToken[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<GenericToken[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryGenericTokenQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryGenericToken>>>;
export type GetQueryGenericTokenQueryError = void;
/**
 * @summary Get all GenericTokens
 */
export declare const useGetQueryGenericToken: <TData = GenericToken[], TError = void>(params?: GetQueryGenericTokenParams, options?: {
    query?: UseQueryOptions<GenericToken[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of GenericTokens
 */
export declare const getCountGenericToken: (params?: GetCountGenericTokenParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountGenericTokenQueryKey: (params?: GetCountGenericTokenParams) => readonly ["/genericToken/count", ...GetCountGenericTokenParams[]];
export declare const getGetCountGenericTokenQueryOptions: <TData = number, TError = void>(params?: GetCountGenericTokenParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountGenericTokenQueryResult = NonNullable<Awaited<ReturnType<typeof getCountGenericToken>>>;
export type GetCountGenericTokenQueryError = void;
/**
 * @summary Get count of GenericTokens
 */
export declare const useGetCountGenericToken: <TData = number, TError = void>(params?: GetCountGenericTokenParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one GenericToken
 */
export declare const getOneGenericToken: (id: number, signal?: AbortSignal) => Promise<GenericToken>;
export declare const getGetOneGenericTokenQueryKey: (id: number) => readonly [`/genericToken/${number}`];
export declare const getGetOneGenericTokenQueryOptions: <TData = GenericToken, TError = void>(id: number, options?: {
    query?: UseQueryOptions<GenericToken, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<GenericToken, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneGenericTokenQueryResult = NonNullable<Awaited<ReturnType<typeof getOneGenericToken>>>;
export type GetOneGenericTokenQueryError = void;
/**
 * @summary Get one GenericToken
 */
export declare const useGetOneGenericToken: <TData = GenericToken, TError = void>(id: number, options?: {
    query?: UseQueryOptions<GenericToken, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one GenericToken
 */
export declare const updateOneGenericToken: (id: number, genericToken: GenericToken) => Promise<void>;
export declare const getUpdateOneGenericTokenMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: GenericToken;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: GenericToken;
}, TContext>;
export type UpdateOneGenericTokenMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneGenericToken>>>;
export type UpdateOneGenericTokenMutationBody = GenericToken;
export type UpdateOneGenericTokenMutationError = void;
/**
* @summary Update one GenericToken
*/
export declare const useUpdateOneGenericToken: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: GenericToken;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: GenericToken;
}, TContext>;
/**
* @summary Delete one GenericToken
*/
export declare const deleteOneGenericToken: (id: number) => Promise<void>;
export declare const getDeleteOneGenericTokenMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneGenericTokenMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneGenericToken>>>;
export type DeleteOneGenericTokenMutationError = void;
/**
* @summary Delete one GenericToken
*/
export declare const useDeleteOneGenericToken: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for GenericToken
*/
export declare const uploadGenericToken: () => Promise<void>;
export declare const getUploadGenericTokenMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadGenericTokenMutationResult = NonNullable<Awaited<ReturnType<typeof uploadGenericToken>>>;
export type UploadGenericTokenMutationError = void;
/**
* @summary Upload a file for GenericToken
*/
export declare const useUploadGenericToken: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to GenericToken
*/
export declare const downloadGenericToken: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadGenericTokenQueryKey: (filename: string) => readonly [`/genericToken/download/${string}`];
export declare const getDownloadGenericTokenQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadGenericTokenQueryResult = NonNullable<Awaited<ReturnType<typeof downloadGenericToken>>>;
export type DownloadGenericTokenQueryError = void;
/**
 * @summary Download file related to GenericToken
 */
export declare const useDownloadGenericToken: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
