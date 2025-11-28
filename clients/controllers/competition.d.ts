import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Competition, CreateCompetitionDTO, GetCountCompetitionParams, GetQueryCompetitionParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Competition
 */
export declare const createCompetition: (createCompetitionDTO: CreateCompetitionDTO) => Promise<Competition>;
export declare const getCreateCompetitionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Competition, TError, {
        data: CreateCompetitionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Competition, TError, {
    data: CreateCompetitionDTO;
}, TContext>;
export type CreateCompetitionMutationResult = NonNullable<Awaited<ReturnType<typeof createCompetition>>>;
export type CreateCompetitionMutationBody = CreateCompetitionDTO;
export type CreateCompetitionMutationError = void;
/**
* @summary Create Competition
*/
export declare const useCreateCompetition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Competition, TError, {
        data: CreateCompetitionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Competition, TError, {
    data: CreateCompetitionDTO;
}, TContext>;
/**
* @summary Get all Competitions
*/
export declare const getAllCompetition: (signal?: AbortSignal) => Promise<Competition[]>;
export declare const getGetAllCompetitionQueryKey: () => readonly ["/competition"];
export declare const getGetAllCompetitionQueryOptions: <TData = Competition[], TError = void>(options?: {
    query?: UseQueryOptions<Competition[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Competition[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllCompetitionQueryResult = NonNullable<Awaited<ReturnType<typeof getAllCompetition>>>;
export type GetAllCompetitionQueryError = void;
/**
 * @summary Get all Competitions
 */
export declare const useGetAllCompetition: <TData = Competition[], TError = void>(options?: {
    query?: UseQueryOptions<Competition[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Competitions
 */
export declare const getQueryCompetition: (params?: GetQueryCompetitionParams, signal?: AbortSignal) => Promise<Competition[]>;
export declare const getGetQueryCompetitionQueryKey: (params?: GetQueryCompetitionParams) => readonly ["/competition/query", ...GetQueryCompetitionParams[]];
export declare const getGetQueryCompetitionQueryOptions: <TData = Competition[], TError = void>(params?: GetQueryCompetitionParams, options?: {
    query?: UseQueryOptions<Competition[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Competition[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryCompetitionQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryCompetition>>>;
export type GetQueryCompetitionQueryError = void;
/**
 * @summary Get all Competitions
 */
export declare const useGetQueryCompetition: <TData = Competition[], TError = void>(params?: GetQueryCompetitionParams, options?: {
    query?: UseQueryOptions<Competition[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Competitions
 */
export declare const getCountCompetition: (params?: GetCountCompetitionParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountCompetitionQueryKey: (params?: GetCountCompetitionParams) => readonly ["/competition/count", ...GetCountCompetitionParams[]];
export declare const getGetCountCompetitionQueryOptions: <TData = number, TError = void>(params?: GetCountCompetitionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountCompetitionQueryResult = NonNullable<Awaited<ReturnType<typeof getCountCompetition>>>;
export type GetCountCompetitionQueryError = void;
/**
 * @summary Get count of Competitions
 */
export declare const useGetCountCompetition: <TData = number, TError = void>(params?: GetCountCompetitionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Competition
 */
export declare const getOneCompetition: (id: number, signal?: AbortSignal) => Promise<Competition>;
export declare const getGetOneCompetitionQueryKey: (id: number) => readonly [`/competition/${number}`];
export declare const getGetOneCompetitionQueryOptions: <TData = Competition, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Competition, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Competition, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneCompetitionQueryResult = NonNullable<Awaited<ReturnType<typeof getOneCompetition>>>;
export type GetOneCompetitionQueryError = void;
/**
 * @summary Get one Competition
 */
export declare const useGetOneCompetition: <TData = Competition, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Competition, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Competition
 */
export declare const updateOneCompetition: (id: number, competition: Competition) => Promise<void>;
export declare const getUpdateOneCompetitionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Competition;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Competition;
}, TContext>;
export type UpdateOneCompetitionMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneCompetition>>>;
export type UpdateOneCompetitionMutationBody = Competition;
export type UpdateOneCompetitionMutationError = void;
/**
* @summary Update one Competition
*/
export declare const useUpdateOneCompetition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Competition;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Competition;
}, TContext>;
/**
* @summary Delete one Competition
*/
export declare const deleteOneCompetition: (id: number) => Promise<void>;
export declare const getDeleteOneCompetitionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneCompetitionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneCompetition>>>;
export type DeleteOneCompetitionMutationError = void;
/**
* @summary Delete one Competition
*/
export declare const useDeleteOneCompetition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Competition
*/
export declare const uploadCompetition: () => Promise<void>;
export declare const getUploadCompetitionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadCompetitionMutationResult = NonNullable<Awaited<ReturnType<typeof uploadCompetition>>>;
export type UploadCompetitionMutationError = void;
/**
* @summary Upload a file for Competition
*/
export declare const useUploadCompetition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Competition
*/
export declare const downloadCompetition: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadCompetitionQueryKey: (filename: string) => readonly [`/competition/download/${string}`];
export declare const getDownloadCompetitionQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadCompetitionQueryResult = NonNullable<Awaited<ReturnType<typeof downloadCompetition>>>;
export type DownloadCompetitionQueryError = void;
/**
 * @summary Download file related to Competition
 */
export declare const useDownloadCompetition: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
