import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CompetitionStanding, CreateCompetitionStandingDTO, GetCountCompetitionStandingParams, GetQueryCompetitionStandingParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create CompetitionStanding
 */
export declare const createCompetitionStanding: (createCompetitionStandingDTO: CreateCompetitionStandingDTO) => Promise<CompetitionStanding>;
export declare const getCreateCompetitionStandingMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CompetitionStanding, TError, {
        data: CreateCompetitionStandingDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<CompetitionStanding, TError, {
    data: CreateCompetitionStandingDTO;
}, TContext>;
export type CreateCompetitionStandingMutationResult = NonNullable<Awaited<ReturnType<typeof createCompetitionStanding>>>;
export type CreateCompetitionStandingMutationBody = CreateCompetitionStandingDTO;
export type CreateCompetitionStandingMutationError = void;
/**
* @summary Create CompetitionStanding
*/
export declare const useCreateCompetitionStanding: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CompetitionStanding, TError, {
        data: CreateCompetitionStandingDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<CompetitionStanding, TError, {
    data: CreateCompetitionStandingDTO;
}, TContext>;
/**
* @summary Get all CompetitionStandings
*/
export declare const getAllCompetitionStanding: (signal?: AbortSignal) => Promise<CompetitionStanding[]>;
export declare const getGetAllCompetitionStandingQueryKey: () => readonly ["/competitionStanding"];
export declare const getGetAllCompetitionStandingQueryOptions: <TData = CompetitionStanding[], TError = void>(options?: {
    query?: UseQueryOptions<CompetitionStanding[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<CompetitionStanding[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllCompetitionStandingQueryResult = NonNullable<Awaited<ReturnType<typeof getAllCompetitionStanding>>>;
export type GetAllCompetitionStandingQueryError = void;
/**
 * @summary Get all CompetitionStandings
 */
export declare const useGetAllCompetitionStanding: <TData = CompetitionStanding[], TError = void>(options?: {
    query?: UseQueryOptions<CompetitionStanding[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all CompetitionStandings
 */
export declare const getQueryCompetitionStanding: (params?: GetQueryCompetitionStandingParams, signal?: AbortSignal) => Promise<CompetitionStanding[]>;
export declare const getGetQueryCompetitionStandingQueryKey: (params?: GetQueryCompetitionStandingParams) => readonly ["/competitionStanding/query", ...GetQueryCompetitionStandingParams[]];
export declare const getGetQueryCompetitionStandingQueryOptions: <TData = CompetitionStanding[], TError = void>(params?: GetQueryCompetitionStandingParams, options?: {
    query?: UseQueryOptions<CompetitionStanding[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<CompetitionStanding[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryCompetitionStandingQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryCompetitionStanding>>>;
export type GetQueryCompetitionStandingQueryError = void;
/**
 * @summary Get all CompetitionStandings
 */
export declare const useGetQueryCompetitionStanding: <TData = CompetitionStanding[], TError = void>(params?: GetQueryCompetitionStandingParams, options?: {
    query?: UseQueryOptions<CompetitionStanding[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of CompetitionStandings
 */
export declare const getCountCompetitionStanding: (params?: GetCountCompetitionStandingParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountCompetitionStandingQueryKey: (params?: GetCountCompetitionStandingParams) => readonly ["/competitionStanding/count", ...GetCountCompetitionStandingParams[]];
export declare const getGetCountCompetitionStandingQueryOptions: <TData = number, TError = void>(params?: GetCountCompetitionStandingParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountCompetitionStandingQueryResult = NonNullable<Awaited<ReturnType<typeof getCountCompetitionStanding>>>;
export type GetCountCompetitionStandingQueryError = void;
/**
 * @summary Get count of CompetitionStandings
 */
export declare const useGetCountCompetitionStanding: <TData = number, TError = void>(params?: GetCountCompetitionStandingParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one CompetitionStanding
 */
export declare const getOneCompetitionStanding: (id: number, signal?: AbortSignal) => Promise<CompetitionStanding>;
export declare const getGetOneCompetitionStandingQueryKey: (id: number) => readonly [`/competitionStanding/${number}`];
export declare const getGetOneCompetitionStandingQueryOptions: <TData = CompetitionStanding, TError = void>(id: number, options?: {
    query?: UseQueryOptions<CompetitionStanding, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<CompetitionStanding, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneCompetitionStandingQueryResult = NonNullable<Awaited<ReturnType<typeof getOneCompetitionStanding>>>;
export type GetOneCompetitionStandingQueryError = void;
/**
 * @summary Get one CompetitionStanding
 */
export declare const useGetOneCompetitionStanding: <TData = CompetitionStanding, TError = void>(id: number, options?: {
    query?: UseQueryOptions<CompetitionStanding, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one CompetitionStanding
 */
export declare const updateOneCompetitionStanding: (id: number, competitionStanding: CompetitionStanding) => Promise<void>;
export declare const getUpdateOneCompetitionStandingMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: CompetitionStanding;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: CompetitionStanding;
}, TContext>;
export type UpdateOneCompetitionStandingMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneCompetitionStanding>>>;
export type UpdateOneCompetitionStandingMutationBody = CompetitionStanding;
export type UpdateOneCompetitionStandingMutationError = void;
/**
* @summary Update one CompetitionStanding
*/
export declare const useUpdateOneCompetitionStanding: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: CompetitionStanding;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: CompetitionStanding;
}, TContext>;
/**
* @summary Delete one CompetitionStanding
*/
export declare const deleteOneCompetitionStanding: (id: number) => Promise<void>;
export declare const getDeleteOneCompetitionStandingMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneCompetitionStandingMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneCompetitionStanding>>>;
export type DeleteOneCompetitionStandingMutationError = void;
/**
* @summary Delete one CompetitionStanding
*/
export declare const useDeleteOneCompetitionStanding: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for CompetitionStanding
*/
export declare const uploadCompetitionStanding: () => Promise<void>;
export declare const getUploadCompetitionStandingMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadCompetitionStandingMutationResult = NonNullable<Awaited<ReturnType<typeof uploadCompetitionStanding>>>;
export type UploadCompetitionStandingMutationError = void;
/**
* @summary Upload a file for CompetitionStanding
*/
export declare const useUploadCompetitionStanding: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to CompetitionStanding
*/
export declare const downloadCompetitionStanding: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadCompetitionStandingQueryKey: (filename: string) => readonly [`/competitionStanding/download/${string}`];
export declare const getDownloadCompetitionStandingQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadCompetitionStandingQueryResult = NonNullable<Awaited<ReturnType<typeof downloadCompetitionStanding>>>;
export type DownloadCompetitionStandingQueryError = void;
/**
 * @summary Download file related to CompetitionStanding
 */
export declare const useDownloadCompetitionStanding: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
