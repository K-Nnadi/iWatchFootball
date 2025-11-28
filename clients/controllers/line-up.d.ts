import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateLineUpDTO, GetCountLineUpParams, GetQueryLineUpParams, LineUp } from './iWatchFootballAPI.schemas';
/**
 * @summary Create LineUp
 */
export declare const createLineUp: (createLineUpDTO: CreateLineUpDTO) => Promise<LineUp>;
export declare const getCreateLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<LineUp, TError, {
        data: CreateLineUpDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<LineUp, TError, {
    data: CreateLineUpDTO;
}, TContext>;
export type CreateLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof createLineUp>>>;
export type CreateLineUpMutationBody = CreateLineUpDTO;
export type CreateLineUpMutationError = void;
/**
* @summary Create LineUp
*/
export declare const useCreateLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<LineUp, TError, {
        data: CreateLineUpDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<LineUp, TError, {
    data: CreateLineUpDTO;
}, TContext>;
/**
* @summary Get all LineUps
*/
export declare const getAllLineUp: (signal?: AbortSignal) => Promise<LineUp[]>;
export declare const getGetAllLineUpQueryKey: () => readonly ["/lineUp"];
export declare const getGetAllLineUpQueryOptions: <TData = LineUp[], TError = void>(options?: {
    query?: UseQueryOptions<LineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LineUp[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getAllLineUp>>>;
export type GetAllLineUpQueryError = void;
/**
 * @summary Get all LineUps
 */
export declare const useGetAllLineUp: <TData = LineUp[], TError = void>(options?: {
    query?: UseQueryOptions<LineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all LineUps
 */
export declare const getQueryLineUp: (params?: GetQueryLineUpParams, signal?: AbortSignal) => Promise<LineUp[]>;
export declare const getGetQueryLineUpQueryKey: (params?: GetQueryLineUpParams) => readonly ["/lineUp/query", ...GetQueryLineUpParams[]];
export declare const getGetQueryLineUpQueryOptions: <TData = LineUp[], TError = void>(params?: GetQueryLineUpParams, options?: {
    query?: UseQueryOptions<LineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LineUp[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryLineUp>>>;
export type GetQueryLineUpQueryError = void;
/**
 * @summary Get all LineUps
 */
export declare const useGetQueryLineUp: <TData = LineUp[], TError = void>(params?: GetQueryLineUpParams, options?: {
    query?: UseQueryOptions<LineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of LineUps
 */
export declare const getCountLineUp: (params?: GetCountLineUpParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountLineUpQueryKey: (params?: GetCountLineUpParams) => readonly ["/lineUp/count", ...GetCountLineUpParams[]];
export declare const getGetCountLineUpQueryOptions: <TData = number, TError = void>(params?: GetCountLineUpParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getCountLineUp>>>;
export type GetCountLineUpQueryError = void;
/**
 * @summary Get count of LineUps
 */
export declare const useGetCountLineUp: <TData = number, TError = void>(params?: GetCountLineUpParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one LineUp
 */
export declare const getOneLineUp: (id: number, signal?: AbortSignal) => Promise<LineUp>;
export declare const getGetOneLineUpQueryKey: (id: number) => readonly [`/lineUp/${number}`];
export declare const getGetOneLineUpQueryOptions: <TData = LineUp, TError = void>(id: number, options?: {
    query?: UseQueryOptions<LineUp, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LineUp, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getOneLineUp>>>;
export type GetOneLineUpQueryError = void;
/**
 * @summary Get one LineUp
 */
export declare const useGetOneLineUp: <TData = LineUp, TError = void>(id: number, options?: {
    query?: UseQueryOptions<LineUp, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one LineUp
 */
export declare const updateOneLineUp: (id: number, lineUp: LineUp) => Promise<void>;
export declare const getUpdateOneLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: LineUp;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: LineUp;
}, TContext>;
export type UpdateOneLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneLineUp>>>;
export type UpdateOneLineUpMutationBody = LineUp;
export type UpdateOneLineUpMutationError = void;
/**
* @summary Update one LineUp
*/
export declare const useUpdateOneLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: LineUp;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: LineUp;
}, TContext>;
/**
* @summary Delete one LineUp
*/
export declare const deleteOneLineUp: (id: number) => Promise<void>;
export declare const getDeleteOneLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneLineUp>>>;
export type DeleteOneLineUpMutationError = void;
/**
* @summary Delete one LineUp
*/
export declare const useDeleteOneLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for LineUp
*/
export declare const uploadLineUp: () => Promise<void>;
export declare const getUploadLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof uploadLineUp>>>;
export type UploadLineUpMutationError = void;
/**
* @summary Upload a file for LineUp
*/
export declare const useUploadLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to LineUp
*/
export declare const downloadLineUp: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadLineUpQueryKey: (filename: string) => readonly [`/lineUp/download/${string}`];
export declare const getDownloadLineUpQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof downloadLineUp>>>;
export type DownloadLineUpQueryError = void;
/**
 * @summary Download file related to LineUp
 */
export declare const useDownloadLineUp: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
