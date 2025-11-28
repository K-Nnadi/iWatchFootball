import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateGoalDTO, GetCountGoalParams, GetQueryGoalParams, Goal } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Goal
 */
export declare const createGoal: (createGoalDTO: CreateGoalDTO) => Promise<Goal>;
export declare const getCreateGoalMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Goal, TError, {
        data: CreateGoalDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Goal, TError, {
    data: CreateGoalDTO;
}, TContext>;
export type CreateGoalMutationResult = NonNullable<Awaited<ReturnType<typeof createGoal>>>;
export type CreateGoalMutationBody = CreateGoalDTO;
export type CreateGoalMutationError = void;
/**
* @summary Create Goal
*/
export declare const useCreateGoal: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Goal, TError, {
        data: CreateGoalDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Goal, TError, {
    data: CreateGoalDTO;
}, TContext>;
/**
* @summary Get all Goals
*/
export declare const getAllGoal: (signal?: AbortSignal) => Promise<Goal[]>;
export declare const getGetAllGoalQueryKey: () => readonly ["/goal"];
export declare const getGetAllGoalQueryOptions: <TData = Goal[], TError = void>(options?: {
    query?: UseQueryOptions<Goal[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Goal[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllGoalQueryResult = NonNullable<Awaited<ReturnType<typeof getAllGoal>>>;
export type GetAllGoalQueryError = void;
/**
 * @summary Get all Goals
 */
export declare const useGetAllGoal: <TData = Goal[], TError = void>(options?: {
    query?: UseQueryOptions<Goal[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Goals
 */
export declare const getQueryGoal: (params?: GetQueryGoalParams, signal?: AbortSignal) => Promise<Goal[]>;
export declare const getGetQueryGoalQueryKey: (params?: GetQueryGoalParams) => readonly ["/goal/query", ...GetQueryGoalParams[]];
export declare const getGetQueryGoalQueryOptions: <TData = Goal[], TError = void>(params?: GetQueryGoalParams, options?: {
    query?: UseQueryOptions<Goal[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Goal[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryGoalQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryGoal>>>;
export type GetQueryGoalQueryError = void;
/**
 * @summary Get all Goals
 */
export declare const useGetQueryGoal: <TData = Goal[], TError = void>(params?: GetQueryGoalParams, options?: {
    query?: UseQueryOptions<Goal[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Goals
 */
export declare const getCountGoal: (params?: GetCountGoalParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountGoalQueryKey: (params?: GetCountGoalParams) => readonly ["/goal/count", ...GetCountGoalParams[]];
export declare const getGetCountGoalQueryOptions: <TData = number, TError = void>(params?: GetCountGoalParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountGoalQueryResult = NonNullable<Awaited<ReturnType<typeof getCountGoal>>>;
export type GetCountGoalQueryError = void;
/**
 * @summary Get count of Goals
 */
export declare const useGetCountGoal: <TData = number, TError = void>(params?: GetCountGoalParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Goal
 */
export declare const getOneGoal: (id: number, signal?: AbortSignal) => Promise<Goal>;
export declare const getGetOneGoalQueryKey: (id: number) => readonly [`/goal/${number}`];
export declare const getGetOneGoalQueryOptions: <TData = Goal, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Goal, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Goal, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneGoalQueryResult = NonNullable<Awaited<ReturnType<typeof getOneGoal>>>;
export type GetOneGoalQueryError = void;
/**
 * @summary Get one Goal
 */
export declare const useGetOneGoal: <TData = Goal, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Goal, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Goal
 */
export declare const updateOneGoal: (id: number, goal: Goal) => Promise<void>;
export declare const getUpdateOneGoalMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Goal;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Goal;
}, TContext>;
export type UpdateOneGoalMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneGoal>>>;
export type UpdateOneGoalMutationBody = Goal;
export type UpdateOneGoalMutationError = void;
/**
* @summary Update one Goal
*/
export declare const useUpdateOneGoal: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Goal;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Goal;
}, TContext>;
/**
* @summary Delete one Goal
*/
export declare const deleteOneGoal: (id: number) => Promise<void>;
export declare const getDeleteOneGoalMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneGoalMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneGoal>>>;
export type DeleteOneGoalMutationError = void;
/**
* @summary Delete one Goal
*/
export declare const useDeleteOneGoal: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Goal
*/
export declare const uploadGoal: () => Promise<void>;
export declare const getUploadGoalMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadGoalMutationResult = NonNullable<Awaited<ReturnType<typeof uploadGoal>>>;
export type UploadGoalMutationError = void;
/**
* @summary Upload a file for Goal
*/
export declare const useUploadGoal: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Goal
*/
export declare const downloadGoal: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadGoalQueryKey: (filename: string) => readonly [`/goal/download/${string}`];
export declare const getDownloadGoalQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadGoalQueryResult = NonNullable<Awaited<ReturnType<typeof downloadGoal>>>;
export type DownloadGoalQueryError = void;
/**
 * @summary Download file related to Goal
 */
export declare const useDownloadGoal: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
