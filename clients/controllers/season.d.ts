import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateSeasonDTO, GetCountSeasonParams, GetQuerySeasonParams, Season } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Season
 */
export declare const createSeason: (createSeasonDTO: CreateSeasonDTO) => Promise<Season>;
export declare const getCreateSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Season, TError, {
        data: CreateSeasonDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Season, TError, {
    data: CreateSeasonDTO;
}, TContext>;
export type CreateSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof createSeason>>>;
export type CreateSeasonMutationBody = CreateSeasonDTO;
export type CreateSeasonMutationError = void;
/**
* @summary Create Season
*/
export declare const useCreateSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Season, TError, {
        data: CreateSeasonDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Season, TError, {
    data: CreateSeasonDTO;
}, TContext>;
/**
* @summary Get all Seasons
*/
export declare const getAllSeason: (signal?: AbortSignal) => Promise<Season[]>;
export declare const getGetAllSeasonQueryKey: () => readonly ["/season"];
export declare const getGetAllSeasonQueryOptions: <TData = Season[], TError = void>(options?: {
    query?: UseQueryOptions<Season[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Season[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getAllSeason>>>;
export type GetAllSeasonQueryError = void;
/**
 * @summary Get all Seasons
 */
export declare const useGetAllSeason: <TData = Season[], TError = void>(options?: {
    query?: UseQueryOptions<Season[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Seasons
 */
export declare const getQuerySeason: (params?: GetQuerySeasonParams, signal?: AbortSignal) => Promise<Season[]>;
export declare const getGetQuerySeasonQueryKey: (params?: GetQuerySeasonParams) => readonly ["/season/query", ...GetQuerySeasonParams[]];
export declare const getGetQuerySeasonQueryOptions: <TData = Season[], TError = void>(params?: GetQuerySeasonParams, options?: {
    query?: UseQueryOptions<Season[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Season[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQuerySeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getQuerySeason>>>;
export type GetQuerySeasonQueryError = void;
/**
 * @summary Get all Seasons
 */
export declare const useGetQuerySeason: <TData = Season[], TError = void>(params?: GetQuerySeasonParams, options?: {
    query?: UseQueryOptions<Season[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Seasons
 */
export declare const getCountSeason: (params?: GetCountSeasonParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountSeasonQueryKey: (params?: GetCountSeasonParams) => readonly ["/season/count", ...GetCountSeasonParams[]];
export declare const getGetCountSeasonQueryOptions: <TData = number, TError = void>(params?: GetCountSeasonParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getCountSeason>>>;
export type GetCountSeasonQueryError = void;
/**
 * @summary Get count of Seasons
 */
export declare const useGetCountSeason: <TData = number, TError = void>(params?: GetCountSeasonParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Season
 */
export declare const getOneSeason: (id: number, signal?: AbortSignal) => Promise<Season>;
export declare const getGetOneSeasonQueryKey: (id: number) => readonly [`/season/${number}`];
export declare const getGetOneSeasonQueryOptions: <TData = Season, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Season, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Season, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getOneSeason>>>;
export type GetOneSeasonQueryError = void;
/**
 * @summary Get one Season
 */
export declare const useGetOneSeason: <TData = Season, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Season, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Season
 */
export declare const updateOneSeason: (id: number, season: Season) => Promise<void>;
export declare const getUpdateOneSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Season;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Season;
}, TContext>;
export type UpdateOneSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneSeason>>>;
export type UpdateOneSeasonMutationBody = Season;
export type UpdateOneSeasonMutationError = void;
/**
* @summary Update one Season
*/
export declare const useUpdateOneSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Season;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Season;
}, TContext>;
/**
* @summary Delete one Season
*/
export declare const deleteOneSeason: (id: number) => Promise<void>;
export declare const getDeleteOneSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneSeason>>>;
export type DeleteOneSeasonMutationError = void;
/**
* @summary Delete one Season
*/
export declare const useDeleteOneSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Season
*/
export declare const uploadSeason: () => Promise<void>;
export declare const getUploadSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof uploadSeason>>>;
export type UploadSeasonMutationError = void;
/**
* @summary Upload a file for Season
*/
export declare const useUploadSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Season
*/
export declare const downloadSeason: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadSeasonQueryKey: (filename: string) => readonly [`/season/download/${string}`];
export declare const getDownloadSeasonQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof downloadSeason>>>;
export type DownloadSeasonQueryError = void;
/**
 * @summary Download file related to Season
 */
export declare const useDownloadSeason: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
