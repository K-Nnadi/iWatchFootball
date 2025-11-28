import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePlayerLineUpDTO, GetCountPlayerLineUpParams, GetQueryPlayerLineUpParams, PlayerLineUp } from './iWatchFootballAPI.schemas';
/**
 * @summary Create PlayerLineUp
 */
export declare const createPlayerLineUp: (createPlayerLineUpDTO: CreatePlayerLineUpDTO) => Promise<PlayerLineUp>;
export declare const getCreatePlayerLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<PlayerLineUp, TError, {
        data: CreatePlayerLineUpDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<PlayerLineUp, TError, {
    data: CreatePlayerLineUpDTO;
}, TContext>;
export type CreatePlayerLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof createPlayerLineUp>>>;
export type CreatePlayerLineUpMutationBody = CreatePlayerLineUpDTO;
export type CreatePlayerLineUpMutationError = void;
/**
* @summary Create PlayerLineUp
*/
export declare const useCreatePlayerLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<PlayerLineUp, TError, {
        data: CreatePlayerLineUpDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<PlayerLineUp, TError, {
    data: CreatePlayerLineUpDTO;
}, TContext>;
/**
* @summary Get all PlayerLineUps
*/
export declare const getAllPlayerLineUp: (signal?: AbortSignal) => Promise<PlayerLineUp[]>;
export declare const getGetAllPlayerLineUpQueryKey: () => readonly ["/playerLineUp"];
export declare const getGetAllPlayerLineUpQueryOptions: <TData = PlayerLineUp[], TError = void>(options?: {
    query?: UseQueryOptions<PlayerLineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PlayerLineUp[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllPlayerLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getAllPlayerLineUp>>>;
export type GetAllPlayerLineUpQueryError = void;
/**
 * @summary Get all PlayerLineUps
 */
export declare const useGetAllPlayerLineUp: <TData = PlayerLineUp[], TError = void>(options?: {
    query?: UseQueryOptions<PlayerLineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all PlayerLineUps
 */
export declare const getQueryPlayerLineUp: (params?: GetQueryPlayerLineUpParams, signal?: AbortSignal) => Promise<PlayerLineUp[]>;
export declare const getGetQueryPlayerLineUpQueryKey: (params?: GetQueryPlayerLineUpParams) => readonly ["/playerLineUp/query", ...GetQueryPlayerLineUpParams[]];
export declare const getGetQueryPlayerLineUpQueryOptions: <TData = PlayerLineUp[], TError = void>(params?: GetQueryPlayerLineUpParams, options?: {
    query?: UseQueryOptions<PlayerLineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PlayerLineUp[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryPlayerLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryPlayerLineUp>>>;
export type GetQueryPlayerLineUpQueryError = void;
/**
 * @summary Get all PlayerLineUps
 */
export declare const useGetQueryPlayerLineUp: <TData = PlayerLineUp[], TError = void>(params?: GetQueryPlayerLineUpParams, options?: {
    query?: UseQueryOptions<PlayerLineUp[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of PlayerLineUps
 */
export declare const getCountPlayerLineUp: (params?: GetCountPlayerLineUpParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountPlayerLineUpQueryKey: (params?: GetCountPlayerLineUpParams) => readonly ["/playerLineUp/count", ...GetCountPlayerLineUpParams[]];
export declare const getGetCountPlayerLineUpQueryOptions: <TData = number, TError = void>(params?: GetCountPlayerLineUpParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountPlayerLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getCountPlayerLineUp>>>;
export type GetCountPlayerLineUpQueryError = void;
/**
 * @summary Get count of PlayerLineUps
 */
export declare const useGetCountPlayerLineUp: <TData = number, TError = void>(params?: GetCountPlayerLineUpParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one PlayerLineUp
 */
export declare const getOnePlayerLineUp: (id: number, signal?: AbortSignal) => Promise<PlayerLineUp>;
export declare const getGetOnePlayerLineUpQueryKey: (id: number) => readonly [`/playerLineUp/${number}`];
export declare const getGetOnePlayerLineUpQueryOptions: <TData = PlayerLineUp, TError = void>(id: number, options?: {
    query?: UseQueryOptions<PlayerLineUp, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PlayerLineUp, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOnePlayerLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof getOnePlayerLineUp>>>;
export type GetOnePlayerLineUpQueryError = void;
/**
 * @summary Get one PlayerLineUp
 */
export declare const useGetOnePlayerLineUp: <TData = PlayerLineUp, TError = void>(id: number, options?: {
    query?: UseQueryOptions<PlayerLineUp, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one PlayerLineUp
 */
export declare const updateOnePlayerLineUp: (id: number, playerLineUp: PlayerLineUp) => Promise<void>;
export declare const getUpdateOnePlayerLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: PlayerLineUp;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: PlayerLineUp;
}, TContext>;
export type UpdateOnePlayerLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof updateOnePlayerLineUp>>>;
export type UpdateOnePlayerLineUpMutationBody = PlayerLineUp;
export type UpdateOnePlayerLineUpMutationError = void;
/**
* @summary Update one PlayerLineUp
*/
export declare const useUpdateOnePlayerLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: PlayerLineUp;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: PlayerLineUp;
}, TContext>;
/**
* @summary Delete one PlayerLineUp
*/
export declare const deleteOnePlayerLineUp: (id: number) => Promise<void>;
export declare const getDeleteOnePlayerLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOnePlayerLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOnePlayerLineUp>>>;
export type DeleteOnePlayerLineUpMutationError = void;
/**
* @summary Delete one PlayerLineUp
*/
export declare const useDeleteOnePlayerLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for PlayerLineUp
*/
export declare const uploadPlayerLineUp: () => Promise<void>;
export declare const getUploadPlayerLineUpMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadPlayerLineUpMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPlayerLineUp>>>;
export type UploadPlayerLineUpMutationError = void;
/**
* @summary Upload a file for PlayerLineUp
*/
export declare const useUploadPlayerLineUp: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to PlayerLineUp
*/
export declare const downloadPlayerLineUp: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadPlayerLineUpQueryKey: (filename: string) => readonly [`/playerLineUp/download/${string}`];
export declare const getDownloadPlayerLineUpQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadPlayerLineUpQueryResult = NonNullable<Awaited<ReturnType<typeof downloadPlayerLineUp>>>;
export type DownloadPlayerLineUpQueryError = void;
/**
 * @summary Download file related to PlayerLineUp
 */
export declare const useDownloadPlayerLineUp: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
