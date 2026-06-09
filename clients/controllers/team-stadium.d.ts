import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateTeamStadiumDTO, GetCountTeamStadiumParams, GetQueryTeamStadiumParams, TeamStadium } from './iWatchFootballAPI.schemas';
/**
 * @summary Create TeamStadium
 */
export declare const createTeamStadium: (createTeamStadiumDTO: CreateTeamStadiumDTO) => Promise<TeamStadium>;
export declare const getCreateTeamStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<TeamStadium, TError, {
        data: CreateTeamStadiumDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<TeamStadium, TError, {
    data: CreateTeamStadiumDTO;
}, TContext>;
export type CreateTeamStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof createTeamStadium>>>;
export type CreateTeamStadiumMutationBody = CreateTeamStadiumDTO;
export type CreateTeamStadiumMutationError = void;
/**
* @summary Create TeamStadium
*/
export declare const useCreateTeamStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<TeamStadium, TError, {
        data: CreateTeamStadiumDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<TeamStadium, TError, {
    data: CreateTeamStadiumDTO;
}, TContext>;
/**
* @summary Get all TeamStadiums
*/
export declare const getAllTeamStadium: (signal?: AbortSignal) => Promise<TeamStadium[]>;
export declare const getGetAllTeamStadiumQueryKey: () => readonly ["/team-stadium"];
export declare const getGetAllTeamStadiumQueryOptions: <TData = TeamStadium[], TError = void>(options?: {
    query?: UseQueryOptions<TeamStadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<TeamStadium[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllTeamStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getAllTeamStadium>>>;
export type GetAllTeamStadiumQueryError = void;
/**
 * @summary Get all TeamStadiums
 */
export declare const useGetAllTeamStadium: <TData = TeamStadium[], TError = void>(options?: {
    query?: UseQueryOptions<TeamStadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all TeamStadiums
 */
export declare const getQueryTeamStadium: (params?: GetQueryTeamStadiumParams, signal?: AbortSignal) => Promise<TeamStadium[]>;
export declare const getGetQueryTeamStadiumQueryKey: (params?: GetQueryTeamStadiumParams) => readonly ["/team-stadium/query", ...GetQueryTeamStadiumParams[]];
export declare const getGetQueryTeamStadiumQueryOptions: <TData = TeamStadium[], TError = void>(params?: GetQueryTeamStadiumParams, options?: {
    query?: UseQueryOptions<TeamStadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<TeamStadium[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryTeamStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryTeamStadium>>>;
export type GetQueryTeamStadiumQueryError = void;
/**
 * @summary Get all TeamStadiums
 */
export declare const useGetQueryTeamStadium: <TData = TeamStadium[], TError = void>(params?: GetQueryTeamStadiumParams, options?: {
    query?: UseQueryOptions<TeamStadium[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of TeamStadiums
 */
export declare const getCountTeamStadium: (params?: GetCountTeamStadiumParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountTeamStadiumQueryKey: (params?: GetCountTeamStadiumParams) => readonly ["/team-stadium/count", ...GetCountTeamStadiumParams[]];
export declare const getGetCountTeamStadiumQueryOptions: <TData = number, TError = void>(params?: GetCountTeamStadiumParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountTeamStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getCountTeamStadium>>>;
export type GetCountTeamStadiumQueryError = void;
/**
 * @summary Get count of TeamStadiums
 */
export declare const useGetCountTeamStadium: <TData = number, TError = void>(params?: GetCountTeamStadiumParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one TeamStadium
 */
export declare const getOneTeamStadium: (id: number, signal?: AbortSignal) => Promise<TeamStadium>;
export declare const getGetOneTeamStadiumQueryKey: (id: number) => readonly [`/team-stadium/${number}`];
export declare const getGetOneTeamStadiumQueryOptions: <TData = TeamStadium, TError = void>(id: number, options?: {
    query?: UseQueryOptions<TeamStadium, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<TeamStadium, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneTeamStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof getOneTeamStadium>>>;
export type GetOneTeamStadiumQueryError = void;
/**
 * @summary Get one TeamStadium
 */
export declare const useGetOneTeamStadium: <TData = TeamStadium, TError = void>(id: number, options?: {
    query?: UseQueryOptions<TeamStadium, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one TeamStadium
 */
export declare const updateOneTeamStadium: (id: number, teamStadium: TeamStadium) => Promise<void>;
export declare const getUpdateOneTeamStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: TeamStadium;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: TeamStadium;
}, TContext>;
export type UpdateOneTeamStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneTeamStadium>>>;
export type UpdateOneTeamStadiumMutationBody = TeamStadium;
export type UpdateOneTeamStadiumMutationError = void;
/**
* @summary Update one TeamStadium
*/
export declare const useUpdateOneTeamStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: TeamStadium;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: TeamStadium;
}, TContext>;
/**
* @summary Delete one TeamStadium
*/
export declare const deleteOneTeamStadium: (id: number) => Promise<void>;
export declare const getDeleteOneTeamStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneTeamStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneTeamStadium>>>;
export type DeleteOneTeamStadiumMutationError = void;
/**
* @summary Delete one TeamStadium
*/
export declare const useDeleteOneTeamStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for TeamStadium
*/
export declare const uploadTeamStadium: () => Promise<void>;
export declare const getUploadTeamStadiumMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadTeamStadiumMutationResult = NonNullable<Awaited<ReturnType<typeof uploadTeamStadium>>>;
export type UploadTeamStadiumMutationError = void;
/**
* @summary Upload a file for TeamStadium
*/
export declare const useUploadTeamStadium: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to TeamStadium
*/
export declare const downloadTeamStadium: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadTeamStadiumQueryKey: (filename: string) => readonly [`/team-stadium/download/${string}`];
export declare const getDownloadTeamStadiumQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadTeamStadiumQueryResult = NonNullable<Awaited<ReturnType<typeof downloadTeamStadium>>>;
export type DownloadTeamStadiumQueryError = void;
/**
 * @summary Download file related to TeamStadium
 */
export declare const useDownloadTeamStadium: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
