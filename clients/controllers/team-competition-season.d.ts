import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateTeamCompetitionSeasonDTO, GetCountTeamCompetitionSeasonParams, GetQueryTeamCompetitionSeasonParams, TeamCompetitionSeason } from './iWatchFootballAPI.schemas';
/**
 * @summary Create TeamCompetitionSeason
 */
export declare const createTeamCompetitionSeason: (createTeamCompetitionSeasonDTO: CreateTeamCompetitionSeasonDTO) => Promise<TeamCompetitionSeason>;
export declare const getCreateTeamCompetitionSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<TeamCompetitionSeason, TError, {
        data: CreateTeamCompetitionSeasonDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<TeamCompetitionSeason, TError, {
    data: CreateTeamCompetitionSeasonDTO;
}, TContext>;
export type CreateTeamCompetitionSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof createTeamCompetitionSeason>>>;
export type CreateTeamCompetitionSeasonMutationBody = CreateTeamCompetitionSeasonDTO;
export type CreateTeamCompetitionSeasonMutationError = void;
/**
* @summary Create TeamCompetitionSeason
*/
export declare const useCreateTeamCompetitionSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<TeamCompetitionSeason, TError, {
        data: CreateTeamCompetitionSeasonDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<TeamCompetitionSeason, TError, {
    data: CreateTeamCompetitionSeasonDTO;
}, TContext>;
/**
* @summary Get all TeamCompetitionSeasons
*/
export declare const getAllTeamCompetitionSeason: (signal?: AbortSignal) => Promise<TeamCompetitionSeason[]>;
export declare const getGetAllTeamCompetitionSeasonQueryKey: () => readonly ["/teamCompetitionSeason"];
export declare const getGetAllTeamCompetitionSeasonQueryOptions: <TData = TeamCompetitionSeason[], TError = void>(options?: {
    query?: UseQueryOptions<TeamCompetitionSeason[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<TeamCompetitionSeason[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllTeamCompetitionSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getAllTeamCompetitionSeason>>>;
export type GetAllTeamCompetitionSeasonQueryError = void;
/**
 * @summary Get all TeamCompetitionSeasons
 */
export declare const useGetAllTeamCompetitionSeason: <TData = TeamCompetitionSeason[], TError = void>(options?: {
    query?: UseQueryOptions<TeamCompetitionSeason[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all TeamCompetitionSeasons
 */
export declare const getQueryTeamCompetitionSeason: (params?: GetQueryTeamCompetitionSeasonParams, signal?: AbortSignal) => Promise<TeamCompetitionSeason[]>;
export declare const getGetQueryTeamCompetitionSeasonQueryKey: (params?: GetQueryTeamCompetitionSeasonParams) => readonly ["/teamCompetitionSeason/query", ...GetQueryTeamCompetitionSeasonParams[]];
export declare const getGetQueryTeamCompetitionSeasonQueryOptions: <TData = TeamCompetitionSeason[], TError = void>(params?: GetQueryTeamCompetitionSeasonParams, options?: {
    query?: UseQueryOptions<TeamCompetitionSeason[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<TeamCompetitionSeason[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryTeamCompetitionSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryTeamCompetitionSeason>>>;
export type GetQueryTeamCompetitionSeasonQueryError = void;
/**
 * @summary Get all TeamCompetitionSeasons
 */
export declare const useGetQueryTeamCompetitionSeason: <TData = TeamCompetitionSeason[], TError = void>(params?: GetQueryTeamCompetitionSeasonParams, options?: {
    query?: UseQueryOptions<TeamCompetitionSeason[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of TeamCompetitionSeasons
 */
export declare const getCountTeamCompetitionSeason: (params?: GetCountTeamCompetitionSeasonParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountTeamCompetitionSeasonQueryKey: (params?: GetCountTeamCompetitionSeasonParams) => readonly ["/teamCompetitionSeason/count", ...GetCountTeamCompetitionSeasonParams[]];
export declare const getGetCountTeamCompetitionSeasonQueryOptions: <TData = number, TError = void>(params?: GetCountTeamCompetitionSeasonParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountTeamCompetitionSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getCountTeamCompetitionSeason>>>;
export type GetCountTeamCompetitionSeasonQueryError = void;
/**
 * @summary Get count of TeamCompetitionSeasons
 */
export declare const useGetCountTeamCompetitionSeason: <TData = number, TError = void>(params?: GetCountTeamCompetitionSeasonParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one TeamCompetitionSeason
 */
export declare const getOneTeamCompetitionSeason: (id: number, signal?: AbortSignal) => Promise<TeamCompetitionSeason>;
export declare const getGetOneTeamCompetitionSeasonQueryKey: (id: number) => readonly [`/teamCompetitionSeason/${number}`];
export declare const getGetOneTeamCompetitionSeasonQueryOptions: <TData = TeamCompetitionSeason, TError = void>(id: number, options?: {
    query?: UseQueryOptions<TeamCompetitionSeason, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<TeamCompetitionSeason, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneTeamCompetitionSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof getOneTeamCompetitionSeason>>>;
export type GetOneTeamCompetitionSeasonQueryError = void;
/**
 * @summary Get one TeamCompetitionSeason
 */
export declare const useGetOneTeamCompetitionSeason: <TData = TeamCompetitionSeason, TError = void>(id: number, options?: {
    query?: UseQueryOptions<TeamCompetitionSeason, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one TeamCompetitionSeason
 */
export declare const updateOneTeamCompetitionSeason: (id: number, teamCompetitionSeason: TeamCompetitionSeason) => Promise<void>;
export declare const getUpdateOneTeamCompetitionSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: TeamCompetitionSeason;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: TeamCompetitionSeason;
}, TContext>;
export type UpdateOneTeamCompetitionSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneTeamCompetitionSeason>>>;
export type UpdateOneTeamCompetitionSeasonMutationBody = TeamCompetitionSeason;
export type UpdateOneTeamCompetitionSeasonMutationError = void;
/**
* @summary Update one TeamCompetitionSeason
*/
export declare const useUpdateOneTeamCompetitionSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: TeamCompetitionSeason;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: TeamCompetitionSeason;
}, TContext>;
/**
* @summary Delete one TeamCompetitionSeason
*/
export declare const deleteOneTeamCompetitionSeason: (id: number) => Promise<void>;
export declare const getDeleteOneTeamCompetitionSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneTeamCompetitionSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneTeamCompetitionSeason>>>;
export type DeleteOneTeamCompetitionSeasonMutationError = void;
/**
* @summary Delete one TeamCompetitionSeason
*/
export declare const useDeleteOneTeamCompetitionSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for TeamCompetitionSeason
*/
export declare const uploadTeamCompetitionSeason: () => Promise<void>;
export declare const getUploadTeamCompetitionSeasonMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadTeamCompetitionSeasonMutationResult = NonNullable<Awaited<ReturnType<typeof uploadTeamCompetitionSeason>>>;
export type UploadTeamCompetitionSeasonMutationError = void;
/**
* @summary Upload a file for TeamCompetitionSeason
*/
export declare const useUploadTeamCompetitionSeason: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to TeamCompetitionSeason
*/
export declare const downloadTeamCompetitionSeason: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadTeamCompetitionSeasonQueryKey: (filename: string) => readonly [`/teamCompetitionSeason/download/${string}`];
export declare const getDownloadTeamCompetitionSeasonQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadTeamCompetitionSeasonQueryResult = NonNullable<Awaited<ReturnType<typeof downloadTeamCompetitionSeason>>>;
export type DownloadTeamCompetitionSeasonQueryError = void;
/**
 * @summary Download file related to TeamCompetitionSeason
 */
export declare const useDownloadTeamCompetitionSeason: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
