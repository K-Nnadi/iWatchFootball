import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateRefereeDTO, GetCountRefereeParams, GetQueryRefereeParams, Referee } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Referee
 */
export declare const createReferee: (createRefereeDTO: CreateRefereeDTO) => Promise<Referee>;
export declare const getCreateRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Referee, TError, {
        data: CreateRefereeDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Referee, TError, {
    data: CreateRefereeDTO;
}, TContext>;
export type CreateRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof createReferee>>>;
export type CreateRefereeMutationBody = CreateRefereeDTO;
export type CreateRefereeMutationError = void;
/**
* @summary Create Referee
*/
export declare const useCreateReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Referee, TError, {
        data: CreateRefereeDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Referee, TError, {
    data: CreateRefereeDTO;
}, TContext>;
/**
* @summary Get all Referees
*/
export declare const getAllReferee: (signal?: AbortSignal) => Promise<Referee[]>;
export declare const getGetAllRefereeQueryKey: () => readonly ["/referee"];
export declare const getGetAllRefereeQueryOptions: <TData = Referee[], TError = void>(options?: {
    query?: UseQueryOptions<Referee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Referee[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getAllReferee>>>;
export type GetAllRefereeQueryError = void;
/**
 * @summary Get all Referees
 */
export declare const useGetAllReferee: <TData = Referee[], TError = void>(options?: {
    query?: UseQueryOptions<Referee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Referees
 */
export declare const getQueryReferee: (params?: GetQueryRefereeParams, signal?: AbortSignal) => Promise<Referee[]>;
export declare const getGetQueryRefereeQueryKey: (params?: GetQueryRefereeParams) => readonly ["/referee/query", ...GetQueryRefereeParams[]];
export declare const getGetQueryRefereeQueryOptions: <TData = Referee[], TError = void>(params?: GetQueryRefereeParams, options?: {
    query?: UseQueryOptions<Referee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Referee[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryReferee>>>;
export type GetQueryRefereeQueryError = void;
/**
 * @summary Get all Referees
 */
export declare const useGetQueryReferee: <TData = Referee[], TError = void>(params?: GetQueryRefereeParams, options?: {
    query?: UseQueryOptions<Referee[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Referees
 */
export declare const getCountReferee: (params?: GetCountRefereeParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountRefereeQueryKey: (params?: GetCountRefereeParams) => readonly ["/referee/count", ...GetCountRefereeParams[]];
export declare const getGetCountRefereeQueryOptions: <TData = number, TError = void>(params?: GetCountRefereeParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getCountReferee>>>;
export type GetCountRefereeQueryError = void;
/**
 * @summary Get count of Referees
 */
export declare const useGetCountReferee: <TData = number, TError = void>(params?: GetCountRefereeParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Referee
 */
export declare const getOneReferee: (id: number, signal?: AbortSignal) => Promise<Referee>;
export declare const getGetOneRefereeQueryKey: (id: number) => readonly [`/referee/${number}`];
export declare const getGetOneRefereeQueryOptions: <TData = Referee, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Referee, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Referee, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof getOneReferee>>>;
export type GetOneRefereeQueryError = void;
/**
 * @summary Get one Referee
 */
export declare const useGetOneReferee: <TData = Referee, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Referee, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Referee
 */
export declare const updateOneReferee: (id: number, referee: Referee) => Promise<void>;
export declare const getUpdateOneRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Referee;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Referee;
}, TContext>;
export type UpdateOneRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneReferee>>>;
export type UpdateOneRefereeMutationBody = Referee;
export type UpdateOneRefereeMutationError = void;
/**
* @summary Update one Referee
*/
export declare const useUpdateOneReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Referee;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Referee;
}, TContext>;
/**
* @summary Delete one Referee
*/
export declare const deleteOneReferee: (id: number) => Promise<void>;
export declare const getDeleteOneRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneReferee>>>;
export type DeleteOneRefereeMutationError = void;
/**
* @summary Delete one Referee
*/
export declare const useDeleteOneReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Referee
*/
export declare const uploadReferee: () => Promise<void>;
export declare const getUploadRefereeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadRefereeMutationResult = NonNullable<Awaited<ReturnType<typeof uploadReferee>>>;
export type UploadRefereeMutationError = void;
/**
* @summary Upload a file for Referee
*/
export declare const useUploadReferee: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Referee
*/
export declare const downloadReferee: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadRefereeQueryKey: (filename: string) => readonly [`/referee/download/${string}`];
export declare const getDownloadRefereeQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadRefereeQueryResult = NonNullable<Awaited<ReturnType<typeof downloadReferee>>>;
export type DownloadRefereeQueryError = void;
/**
 * @summary Download file related to Referee
 */
export declare const useDownloadReferee: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
