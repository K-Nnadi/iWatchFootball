import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateTeamDTO, GetCountTeamParams, GetQueryTeamParams, Team } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Team
 */
export declare const createTeam: (createTeamDTO: CreateTeamDTO) => Promise<Team>;
export declare const getCreateTeamMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Team, TError, {
        data: CreateTeamDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Team, TError, {
    data: CreateTeamDTO;
}, TContext>;
export type CreateTeamMutationResult = NonNullable<Awaited<ReturnType<typeof createTeam>>>;
export type CreateTeamMutationBody = CreateTeamDTO;
export type CreateTeamMutationError = void;
/**
* @summary Create Team
*/
export declare const useCreateTeam: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Team, TError, {
        data: CreateTeamDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Team, TError, {
    data: CreateTeamDTO;
}, TContext>;
/**
* @summary Get all Teams
*/
export declare const getAllTeam: (signal?: AbortSignal) => Promise<Team[]>;
export declare const getGetAllTeamQueryKey: () => readonly ["/team"];
export declare const getGetAllTeamQueryOptions: <TData = Team[], TError = void>(options?: {
    query?: UseQueryOptions<Team[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Team[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllTeamQueryResult = NonNullable<Awaited<ReturnType<typeof getAllTeam>>>;
export type GetAllTeamQueryError = void;
/**
 * @summary Get all Teams
 */
export declare const useGetAllTeam: <TData = Team[], TError = void>(options?: {
    query?: UseQueryOptions<Team[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Teams
 */
export declare const getQueryTeam: (params?: GetQueryTeamParams, signal?: AbortSignal) => Promise<Team[]>;
export declare const getGetQueryTeamQueryKey: (params?: GetQueryTeamParams) => readonly ["/team/query", ...GetQueryTeamParams[]];
export declare const getGetQueryTeamQueryOptions: <TData = Team[], TError = void>(params?: GetQueryTeamParams, options?: {
    query?: UseQueryOptions<Team[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Team[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryTeamQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryTeam>>>;
export type GetQueryTeamQueryError = void;
/**
 * @summary Get all Teams
 */
export declare const useGetQueryTeam: <TData = Team[], TError = void>(params?: GetQueryTeamParams, options?: {
    query?: UseQueryOptions<Team[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Teams
 */
export declare const getCountTeam: (params?: GetCountTeamParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountTeamQueryKey: (params?: GetCountTeamParams) => readonly ["/team/count", ...GetCountTeamParams[]];
export declare const getGetCountTeamQueryOptions: <TData = number, TError = void>(params?: GetCountTeamParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountTeamQueryResult = NonNullable<Awaited<ReturnType<typeof getCountTeam>>>;
export type GetCountTeamQueryError = void;
/**
 * @summary Get count of Teams
 */
export declare const useGetCountTeam: <TData = number, TError = void>(params?: GetCountTeamParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Team
 */
export declare const getOneTeam: (id: number, signal?: AbortSignal) => Promise<Team>;
export declare const getGetOneTeamQueryKey: (id: number) => readonly [`/team/${number}`];
export declare const getGetOneTeamQueryOptions: <TData = Team, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Team, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Team, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneTeamQueryResult = NonNullable<Awaited<ReturnType<typeof getOneTeam>>>;
export type GetOneTeamQueryError = void;
/**
 * @summary Get one Team
 */
export declare const useGetOneTeam: <TData = Team, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Team, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Team
 */
export declare const updateOneTeam: (id: number, team: Team) => Promise<void>;
export declare const getUpdateOneTeamMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Team;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Team;
}, TContext>;
export type UpdateOneTeamMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneTeam>>>;
export type UpdateOneTeamMutationBody = Team;
export type UpdateOneTeamMutationError = void;
/**
* @summary Update one Team
*/
export declare const useUpdateOneTeam: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Team;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Team;
}, TContext>;
/**
* @summary Delete one Team
*/
export declare const deleteOneTeam: (id: number) => Promise<void>;
export declare const getDeleteOneTeamMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneTeamMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneTeam>>>;
export type DeleteOneTeamMutationError = void;
/**
* @summary Delete one Team
*/
export declare const useDeleteOneTeam: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Team
*/
export declare const uploadTeam: () => Promise<void>;
export declare const getUploadTeamMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadTeamMutationResult = NonNullable<Awaited<ReturnType<typeof uploadTeam>>>;
export type UploadTeamMutationError = void;
/**
* @summary Upload a file for Team
*/
export declare const useUploadTeam: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Team
*/
export declare const downloadTeam: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadTeamQueryKey: (filename: string) => readonly [`/team/download/${string}`];
export declare const getDownloadTeamQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadTeamQueryResult = NonNullable<Awaited<ReturnType<typeof downloadTeam>>>;
export type DownloadTeamQueryError = void;
/**
 * @summary Download file related to Team
 */
export declare const useDownloadTeam: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
