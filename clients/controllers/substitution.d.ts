import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateSubstitutionDTO, GetCountSubstitutionParams, GetQuerySubstitutionParams, Substitution } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Substitution
 */
export declare const createSubstitution: (createSubstitutionDTO: CreateSubstitutionDTO) => Promise<Substitution>;
export declare const getCreateSubstitutionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Substitution, TError, {
        data: CreateSubstitutionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Substitution, TError, {
    data: CreateSubstitutionDTO;
}, TContext>;
export type CreateSubstitutionMutationResult = NonNullable<Awaited<ReturnType<typeof createSubstitution>>>;
export type CreateSubstitutionMutationBody = CreateSubstitutionDTO;
export type CreateSubstitutionMutationError = void;
/**
* @summary Create Substitution
*/
export declare const useCreateSubstitution: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Substitution, TError, {
        data: CreateSubstitutionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Substitution, TError, {
    data: CreateSubstitutionDTO;
}, TContext>;
/**
* @summary Get all Substitutions
*/
export declare const getAllSubstitution: (signal?: AbortSignal) => Promise<Substitution[]>;
export declare const getGetAllSubstitutionQueryKey: () => readonly ["/substitution"];
export declare const getGetAllSubstitutionQueryOptions: <TData = Substitution[], TError = void>(options?: {
    query?: UseQueryOptions<Substitution[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Substitution[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllSubstitutionQueryResult = NonNullable<Awaited<ReturnType<typeof getAllSubstitution>>>;
export type GetAllSubstitutionQueryError = void;
/**
 * @summary Get all Substitutions
 */
export declare const useGetAllSubstitution: <TData = Substitution[], TError = void>(options?: {
    query?: UseQueryOptions<Substitution[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Substitutions
 */
export declare const getQuerySubstitution: (params?: GetQuerySubstitutionParams, signal?: AbortSignal) => Promise<Substitution[]>;
export declare const getGetQuerySubstitutionQueryKey: (params?: GetQuerySubstitutionParams) => readonly ["/substitution/query", ...GetQuerySubstitutionParams[]];
export declare const getGetQuerySubstitutionQueryOptions: <TData = Substitution[], TError = void>(params?: GetQuerySubstitutionParams, options?: {
    query?: UseQueryOptions<Substitution[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Substitution[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQuerySubstitutionQueryResult = NonNullable<Awaited<ReturnType<typeof getQuerySubstitution>>>;
export type GetQuerySubstitutionQueryError = void;
/**
 * @summary Get all Substitutions
 */
export declare const useGetQuerySubstitution: <TData = Substitution[], TError = void>(params?: GetQuerySubstitutionParams, options?: {
    query?: UseQueryOptions<Substitution[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Substitutions
 */
export declare const getCountSubstitution: (params?: GetCountSubstitutionParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountSubstitutionQueryKey: (params?: GetCountSubstitutionParams) => readonly ["/substitution/count", ...GetCountSubstitutionParams[]];
export declare const getGetCountSubstitutionQueryOptions: <TData = number, TError = void>(params?: GetCountSubstitutionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountSubstitutionQueryResult = NonNullable<Awaited<ReturnType<typeof getCountSubstitution>>>;
export type GetCountSubstitutionQueryError = void;
/**
 * @summary Get count of Substitutions
 */
export declare const useGetCountSubstitution: <TData = number, TError = void>(params?: GetCountSubstitutionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Substitution
 */
export declare const getOneSubstitution: (id: number, signal?: AbortSignal) => Promise<Substitution>;
export declare const getGetOneSubstitutionQueryKey: (id: number) => readonly [`/substitution/${number}`];
export declare const getGetOneSubstitutionQueryOptions: <TData = Substitution, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Substitution, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Substitution, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneSubstitutionQueryResult = NonNullable<Awaited<ReturnType<typeof getOneSubstitution>>>;
export type GetOneSubstitutionQueryError = void;
/**
 * @summary Get one Substitution
 */
export declare const useGetOneSubstitution: <TData = Substitution, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Substitution, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Substitution
 */
export declare const updateOneSubstitution: (id: number, substitution: Substitution) => Promise<void>;
export declare const getUpdateOneSubstitutionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Substitution;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Substitution;
}, TContext>;
export type UpdateOneSubstitutionMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneSubstitution>>>;
export type UpdateOneSubstitutionMutationBody = Substitution;
export type UpdateOneSubstitutionMutationError = void;
/**
* @summary Update one Substitution
*/
export declare const useUpdateOneSubstitution: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Substitution;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Substitution;
}, TContext>;
/**
* @summary Delete one Substitution
*/
export declare const deleteOneSubstitution: (id: number) => Promise<void>;
export declare const getDeleteOneSubstitutionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneSubstitutionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneSubstitution>>>;
export type DeleteOneSubstitutionMutationError = void;
/**
* @summary Delete one Substitution
*/
export declare const useDeleteOneSubstitution: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Substitution
*/
export declare const uploadSubstitution: () => Promise<void>;
export declare const getUploadSubstitutionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadSubstitutionMutationResult = NonNullable<Awaited<ReturnType<typeof uploadSubstitution>>>;
export type UploadSubstitutionMutationError = void;
/**
* @summary Upload a file for Substitution
*/
export declare const useUploadSubstitution: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Substitution
*/
export declare const downloadSubstitution: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadSubstitutionQueryKey: (filename: string) => readonly [`/substitution/download/${string}`];
export declare const getDownloadSubstitutionQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadSubstitutionQueryResult = NonNullable<Awaited<ReturnType<typeof downloadSubstitution>>>;
export type DownloadSubstitutionQueryError = void;
/**
 * @summary Download file related to Substitution
 */
export declare const useDownloadSubstitution: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
