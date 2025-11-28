import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateLogDTO, GetCountLogParams, GetQueryLogParams, Log } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Log
 */
export declare const createLog: (createLogDTO: CreateLogDTO) => Promise<Log>;
export declare const getCreateLogMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Log, TError, {
        data: CreateLogDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Log, TError, {
    data: CreateLogDTO;
}, TContext>;
export type CreateLogMutationResult = NonNullable<Awaited<ReturnType<typeof createLog>>>;
export type CreateLogMutationBody = CreateLogDTO;
export type CreateLogMutationError = void;
/**
* @summary Create Log
*/
export declare const useCreateLog: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Log, TError, {
        data: CreateLogDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Log, TError, {
    data: CreateLogDTO;
}, TContext>;
/**
* @summary Get all Logs
*/
export declare const getAllLog: (signal?: AbortSignal) => Promise<Log[]>;
export declare const getGetAllLogQueryKey: () => readonly ["/log"];
export declare const getGetAllLogQueryOptions: <TData = Log[], TError = void>(options?: {
    query?: UseQueryOptions<Log[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Log[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllLogQueryResult = NonNullable<Awaited<ReturnType<typeof getAllLog>>>;
export type GetAllLogQueryError = void;
/**
 * @summary Get all Logs
 */
export declare const useGetAllLog: <TData = Log[], TError = void>(options?: {
    query?: UseQueryOptions<Log[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Logs
 */
export declare const getQueryLog: (params?: GetQueryLogParams, signal?: AbortSignal) => Promise<Log[]>;
export declare const getGetQueryLogQueryKey: (params?: GetQueryLogParams) => readonly ["/log/query", ...GetQueryLogParams[]];
export declare const getGetQueryLogQueryOptions: <TData = Log[], TError = void>(params?: GetQueryLogParams, options?: {
    query?: UseQueryOptions<Log[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Log[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryLogQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryLog>>>;
export type GetQueryLogQueryError = void;
/**
 * @summary Get all Logs
 */
export declare const useGetQueryLog: <TData = Log[], TError = void>(params?: GetQueryLogParams, options?: {
    query?: UseQueryOptions<Log[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Logs
 */
export declare const getCountLog: (params?: GetCountLogParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountLogQueryKey: (params?: GetCountLogParams) => readonly ["/log/count", ...GetCountLogParams[]];
export declare const getGetCountLogQueryOptions: <TData = number, TError = void>(params?: GetCountLogParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountLogQueryResult = NonNullable<Awaited<ReturnType<typeof getCountLog>>>;
export type GetCountLogQueryError = void;
/**
 * @summary Get count of Logs
 */
export declare const useGetCountLog: <TData = number, TError = void>(params?: GetCountLogParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Log
 */
export declare const getOneLog: (id: number, signal?: AbortSignal) => Promise<Log>;
export declare const getGetOneLogQueryKey: (id: number) => readonly [`/log/${number}`];
export declare const getGetOneLogQueryOptions: <TData = Log, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Log, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Log, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneLogQueryResult = NonNullable<Awaited<ReturnType<typeof getOneLog>>>;
export type GetOneLogQueryError = void;
/**
 * @summary Get one Log
 */
export declare const useGetOneLog: <TData = Log, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Log, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Log
 */
export declare const updateOneLog: (id: number, log: Log) => Promise<void>;
export declare const getUpdateOneLogMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Log;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Log;
}, TContext>;
export type UpdateOneLogMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneLog>>>;
export type UpdateOneLogMutationBody = Log;
export type UpdateOneLogMutationError = void;
/**
* @summary Update one Log
*/
export declare const useUpdateOneLog: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Log;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Log;
}, TContext>;
/**
* @summary Delete one Log
*/
export declare const deleteOneLog: (id: number) => Promise<void>;
export declare const getDeleteOneLogMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneLogMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneLog>>>;
export type DeleteOneLogMutationError = void;
/**
* @summary Delete one Log
*/
export declare const useDeleteOneLog: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Log
*/
export declare const uploadLog: () => Promise<void>;
export declare const getUploadLogMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadLogMutationResult = NonNullable<Awaited<ReturnType<typeof uploadLog>>>;
export type UploadLogMutationError = void;
/**
* @summary Upload a file for Log
*/
export declare const useUploadLog: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Log
*/
export declare const downloadLog: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadLogQueryKey: (filename: string) => readonly [`/log/download/${string}`];
export declare const getDownloadLogQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadLogQueryResult = NonNullable<Awaited<ReturnType<typeof downloadLog>>>;
export type DownloadLogQueryError = void;
/**
 * @summary Download file related to Log
 */
export declare const useDownloadLog: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
