import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateFixtureRefereeDTO, FixtureReferee, GetCountFixtureRefereeParams, GetQueryFixtureRefereeParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create FixtureReferee
 */
export declare const createFixtureReferee: (createFixtureRefereeDTO: CreateFixtureRefereeDTO) => Promise<FixtureReferee>;
export declare const getCreateFixtureRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<FixtureReferee, TError, {
        data: CreateFixtureRefereeDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<FixtureReferee, TError, {
    data: CreateFixtureRefereeDTO;
}, TContext>;
export type CreateFixtureRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof createFixtureReferee>>>;
export type CreateFixtureRefereeMutationBody = CreateFixtureRefereeDTO;
export type CreateFixtureRefereeMutationError = void;
/**
* @summary Create FixtureReferee
*/
export declare const useCreateFixtureReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<FixtureReferee, TError, {
        data: CreateFixtureRefereeDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<FixtureReferee, TError, {
    data: CreateFixtureRefereeDTO;
}, TContext>;
/**
* @summary Get all FixtureReferees
*/
export declare const getAllFixtureReferee: (signal?: AbortSignal) => Promise<FixtureReferee[]>;
export declare const getGetAllFixtureRefereeQueryKey: () => readonly ["/fixtureReferee"];
export declare const getGetAllFixtureRefereeQueryOptions: <TData = FixtureReferee[], TError = void>(options?: {
    query?: UseQueryOptions<FixtureReferee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<FixtureReferee[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllFixtureRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getAllFixtureReferee>>>;
export type GetAllFixtureRefereeQueryError = void;
/**
 * @summary Get all FixtureReferees
 */
export declare const useGetAllFixtureReferee: <TData = FixtureReferee[], TError = void>(options?: {
    query?: UseQueryOptions<FixtureReferee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all FixtureReferees
 */
export declare const getQueryFixtureReferee: (params?: GetQueryFixtureRefereeParams, signal?: AbortSignal) => Promise<FixtureReferee[]>;
export declare const getGetQueryFixtureRefereeQueryKey: (params?: GetQueryFixtureRefereeParams) => readonly ["/fixtureReferee/query", ...GetQueryFixtureRefereeParams[]];
export declare const getGetQueryFixtureRefereeQueryOptions: <TData = FixtureReferee[], TError = void>(params?: GetQueryFixtureRefereeParams, options?: {
    query?: UseQueryOptions<FixtureReferee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<FixtureReferee[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryFixtureRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryFixtureReferee>>>;
export type GetQueryFixtureRefereeQueryError = void;
/**
 * @summary Get all FixtureReferees
 */
export declare const useGetQueryFixtureReferee: <TData = FixtureReferee[], TError = void>(params?: GetQueryFixtureRefereeParams, options?: {
    query?: UseQueryOptions<FixtureReferee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of FixtureReferees
 */
export declare const getCountFixtureReferee: (params?: GetCountFixtureRefereeParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountFixtureRefereeQueryKey: (params?: GetCountFixtureRefereeParams) => readonly ["/fixtureReferee/count", ...GetCountFixtureRefereeParams[]];
export declare const getGetCountFixtureRefereeQueryOptions: <TData = number, TError = void>(params?: GetCountFixtureRefereeParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountFixtureRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getCountFixtureReferee>>>;
export type GetCountFixtureRefereeQueryError = void;
/**
 * @summary Get count of FixtureReferees
 */
export declare const useGetCountFixtureReferee: <TData = number, TError = void>(params?: GetCountFixtureRefereeParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one FixtureReferee
 */
export declare const getOneFixtureReferee: (id: number, signal?: AbortSignal) => Promise<FixtureReferee>;
export declare const getGetOneFixtureRefereeQueryKey: (id: number) => readonly [`/fixtureReferee/${number}`];
export declare const getGetOneFixtureRefereeQueryOptions: <TData = FixtureReferee, TError = void>(id: number, options?: {
    query?: UseQueryOptions<FixtureReferee, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<FixtureReferee, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneFixtureRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getOneFixtureReferee>>>;
export type GetOneFixtureRefereeQueryError = void;
/**
 * @summary Get one FixtureReferee
 */
export declare const useGetOneFixtureReferee: <TData = FixtureReferee, TError = void>(id: number, options?: {
    query?: UseQueryOptions<FixtureReferee, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one FixtureReferee
 */
export declare const updateOneFixtureReferee: (id: number, fixtureReferee: FixtureReferee) => Promise<void>;
export declare const getUpdateOneFixtureRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: FixtureReferee;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: FixtureReferee;
}, TContext>;
export type UpdateOneFixtureRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneFixtureReferee>>>;
export type UpdateOneFixtureRefereeMutationBody = FixtureReferee;
export type UpdateOneFixtureRefereeMutationError = void;
/**
* @summary Update one FixtureReferee
*/
export declare const useUpdateOneFixtureReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: FixtureReferee;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: FixtureReferee;
}, TContext>;
/**
* @summary Delete one FixtureReferee
*/
export declare const deleteOneFixtureReferee: (id: number) => Promise<void>;
export declare const getDeleteOneFixtureRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneFixtureRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneFixtureReferee>>>;
export type DeleteOneFixtureRefereeMutationError = void;
/**
* @summary Delete one FixtureReferee
*/
export declare const useDeleteOneFixtureReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for FixtureReferee
*/
export declare const uploadFixtureReferee: () => Promise<void>;
export declare const getUploadFixtureRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadFixtureRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof uploadFixtureReferee>>>;
export type UploadFixtureRefereeMutationError = void;
/**
* @summary Upload a file for FixtureReferee
*/
export declare const useUploadFixtureReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to FixtureReferee
*/
export declare const downloadFixtureReferee: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadFixtureRefereeQueryKey: (filename: string) => readonly [`/fixtureReferee/download/${string}`];
export declare const getDownloadFixtureRefereeQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadFixtureRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof downloadFixtureReferee>>>;
export type DownloadFixtureRefereeQueryError = void;
/**
 * @summary Download file related to FixtureReferee
 */
export declare const useDownloadFixtureReferee: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
