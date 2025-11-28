import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateTrophyDTO, GetCountTrophyParams, GetQueryTrophyParams, Trophy } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Trophy
 */
export declare const createTrophy: (createTrophyDTO: CreateTrophyDTO) => Promise<Trophy>;
export declare const getCreateTrophyMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Trophy, TError, {
        data: CreateTrophyDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Trophy, TError, {
    data: CreateTrophyDTO;
}, TContext>;
export type CreateTrophyMutationResult = NonNullable<Awaited<ReturnType<typeof createTrophy>>>;
export type CreateTrophyMutationBody = CreateTrophyDTO;
export type CreateTrophyMutationError = void;
/**
* @summary Create Trophy
*/
export declare const useCreateTrophy: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Trophy, TError, {
        data: CreateTrophyDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Trophy, TError, {
    data: CreateTrophyDTO;
}, TContext>;
/**
* @summary Get all Trophys
*/
export declare const getAllTrophy: (signal?: AbortSignal) => Promise<Trophy[]>;
export declare const getGetAllTrophyQueryKey: () => readonly ["/trophy"];
export declare const getGetAllTrophyQueryOptions: <TData = Trophy[], TError = void>(options?: {
    query?: UseQueryOptions<Trophy[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Trophy[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllTrophyQueryResult = NonNullable<Awaited<ReturnType<typeof getAllTrophy>>>;
export type GetAllTrophyQueryError = void;
/**
 * @summary Get all Trophys
 */
export declare const useGetAllTrophy: <TData = Trophy[], TError = void>(options?: {
    query?: UseQueryOptions<Trophy[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Trophys
 */
export declare const getQueryTrophy: (params?: GetQueryTrophyParams, signal?: AbortSignal) => Promise<Trophy[]>;
export declare const getGetQueryTrophyQueryKey: (params?: GetQueryTrophyParams) => readonly ["/trophy/query", ...GetQueryTrophyParams[]];
export declare const getGetQueryTrophyQueryOptions: <TData = Trophy[], TError = void>(params?: GetQueryTrophyParams, options?: {
    query?: UseQueryOptions<Trophy[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Trophy[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryTrophyQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryTrophy>>>;
export type GetQueryTrophyQueryError = void;
/**
 * @summary Get all Trophys
 */
export declare const useGetQueryTrophy: <TData = Trophy[], TError = void>(params?: GetQueryTrophyParams, options?: {
    query?: UseQueryOptions<Trophy[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Trophys
 */
export declare const getCountTrophy: (params?: GetCountTrophyParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountTrophyQueryKey: (params?: GetCountTrophyParams) => readonly ["/trophy/count", ...GetCountTrophyParams[]];
export declare const getGetCountTrophyQueryOptions: <TData = number, TError = void>(params?: GetCountTrophyParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountTrophyQueryResult = NonNullable<Awaited<ReturnType<typeof getCountTrophy>>>;
export type GetCountTrophyQueryError = void;
/**
 * @summary Get count of Trophys
 */
export declare const useGetCountTrophy: <TData = number, TError = void>(params?: GetCountTrophyParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Trophy
 */
export declare const getOneTrophy: (id: number, signal?: AbortSignal) => Promise<Trophy>;
export declare const getGetOneTrophyQueryKey: (id: number) => readonly [`/trophy/${number}`];
export declare const getGetOneTrophyQueryOptions: <TData = Trophy, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Trophy, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Trophy, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneTrophyQueryResult = NonNullable<Awaited<ReturnType<typeof getOneTrophy>>>;
export type GetOneTrophyQueryError = void;
/**
 * @summary Get one Trophy
 */
export declare const useGetOneTrophy: <TData = Trophy, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Trophy, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Trophy
 */
export declare const updateOneTrophy: (id: number, trophy: Trophy) => Promise<void>;
export declare const getUpdateOneTrophyMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Trophy;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Trophy;
}, TContext>;
export type UpdateOneTrophyMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneTrophy>>>;
export type UpdateOneTrophyMutationBody = Trophy;
export type UpdateOneTrophyMutationError = void;
/**
* @summary Update one Trophy
*/
export declare const useUpdateOneTrophy: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Trophy;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Trophy;
}, TContext>;
/**
* @summary Delete one Trophy
*/
export declare const deleteOneTrophy: (id: number) => Promise<void>;
export declare const getDeleteOneTrophyMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneTrophyMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneTrophy>>>;
export type DeleteOneTrophyMutationError = void;
/**
* @summary Delete one Trophy
*/
export declare const useDeleteOneTrophy: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Trophy
*/
export declare const uploadTrophy: () => Promise<void>;
export declare const getUploadTrophyMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadTrophyMutationResult = NonNullable<Awaited<ReturnType<typeof uploadTrophy>>>;
export type UploadTrophyMutationError = void;
/**
* @summary Upload a file for Trophy
*/
export declare const useUploadTrophy: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Trophy
*/
export declare const downloadTrophy: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadTrophyQueryKey: (filename: string) => readonly [`/trophy/download/${string}`];
export declare const getDownloadTrophyQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadTrophyQueryResult = NonNullable<Awaited<ReturnType<typeof downloadTrophy>>>;
export type DownloadTrophyQueryError = void;
/**
 * @summary Download file related to Trophy
 */
export declare const useDownloadTrophy: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
