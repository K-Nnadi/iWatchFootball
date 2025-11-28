import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateStadiumDTO, GetCountStadiumParams, GetQueryStadiumParams, Stadium } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Stadium
 */
export declare const createStadium: (createStadiumDTO: CreateStadiumDTO) => Promise<Stadium>;
export declare const getCreateStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Stadium, TError, {
        data: CreateStadiumDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Stadium, TError, {
    data: CreateStadiumDTO;
}, TContext>;
export type CreateStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof createStadium>>>;
export type CreateStadiumMutationBody = CreateStadiumDTO;
export type CreateStadiumMutationError = void;
/**
* @summary Create Stadium
*/
export declare const useCreateStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Stadium, TError, {
        data: CreateStadiumDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Stadium, TError, {
    data: CreateStadiumDTO;
}, TContext>;
/**
* @summary Get all Stadiums
*/
export declare const getAllStadium: (signal?: AbortSignal) => Promise<Stadium[]>;
export declare const getGetAllStadiumQueryKey: () => readonly ["/stadium"];
export declare const getGetAllStadiumQueryOptions: <TData = Stadium[], TError = void>(options?: {
    query?: UseQueryOptions<Stadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Stadium[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getAllStadium>>>;
export type GetAllStadiumQueryError = void;
/**
 * @summary Get all Stadiums
 */
export declare const useGetAllStadium: <TData = Stadium[], TError = void>(options?: {
    query?: UseQueryOptions<Stadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Stadiums
 */
export declare const getQueryStadium: (params?: GetQueryStadiumParams, signal?: AbortSignal) => Promise<Stadium[]>;
export declare const getGetQueryStadiumQueryKey: (params?: GetQueryStadiumParams) => readonly ["/stadium/query", ...GetQueryStadiumParams[]];
export declare const getGetQueryStadiumQueryOptions: <TData = Stadium[], TError = void>(params?: GetQueryStadiumParams, options?: {
    query?: UseQueryOptions<Stadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Stadium[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryStadium>>>;
export type GetQueryStadiumQueryError = void;
/**
 * @summary Get all Stadiums
 */
export declare const useGetQueryStadium: <TData = Stadium[], TError = void>(params?: GetQueryStadiumParams, options?: {
    query?: UseQueryOptions<Stadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Stadiums
 */
export declare const getCountStadium: (params?: GetCountStadiumParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountStadiumQueryKey: (params?: GetCountStadiumParams) => readonly ["/stadium/count", ...GetCountStadiumParams[]];
export declare const getGetCountStadiumQueryOptions: <TData = number, TError = void>(params?: GetCountStadiumParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getCountStadium>>>;
export type GetCountStadiumQueryError = void;
/**
 * @summary Get count of Stadiums
 */
export declare const useGetCountStadium: <TData = number, TError = void>(params?: GetCountStadiumParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Stadium
 */
export declare const getOneStadium: (id: number, signal?: AbortSignal) => Promise<Stadium>;
export declare const getGetOneStadiumQueryKey: (id: number) => readonly [`/stadium/${number}`];
export declare const getGetOneStadiumQueryOptions: <TData = Stadium, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Stadium, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Stadium, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getOneStadium>>>;
export type GetOneStadiumQueryError = void;
/**
 * @summary Get one Stadium
 */
export declare const useGetOneStadium: <TData = Stadium, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Stadium, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Stadium
 */
export declare const updateOneStadium: (id: number, stadium: Stadium) => Promise<void>;
export declare const getUpdateOneStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Stadium;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Stadium;
}, TContext>;
export type UpdateOneStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneStadium>>>;
export type UpdateOneStadiumMutationBody = Stadium;
export type UpdateOneStadiumMutationError = void;
/**
* @summary Update one Stadium
*/
export declare const useUpdateOneStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Stadium;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Stadium;
}, TContext>;
/**
* @summary Delete one Stadium
*/
export declare const deleteOneStadium: (id: number) => Promise<void>;
export declare const getDeleteOneStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneStadium>>>;
export type DeleteOneStadiumMutationError = void;
/**
* @summary Delete one Stadium
*/
export declare const useDeleteOneStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Stadium
*/
export declare const uploadStadium: () => Promise<void>;
export declare const getUploadStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof uploadStadium>>>;
export type UploadStadiumMutationError = void;
/**
* @summary Upload a file for Stadium
*/
export declare const useUploadStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Stadium
*/
export declare const downloadStadium: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadStadiumQueryKey: (filename: string) => readonly [`/stadium/download/${string}`];
export declare const getDownloadStadiumQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof downloadStadium>>>;
export type DownloadStadiumQueryError = void;
/**
 * @summary Download file related to Stadium
 */
export declare const useDownloadStadium: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
