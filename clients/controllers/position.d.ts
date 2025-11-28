import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePositionDTO, GetCountPositionParams, GetQueryPositionParams, Position } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Position
 */
export declare const createPosition: (createPositionDTO: CreatePositionDTO) => Promise<Position>;
export declare const getCreatePositionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Position, TError, {
        data: CreatePositionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Position, TError, {
    data: CreatePositionDTO;
}, TContext>;
export type CreatePositionMutationResult = NonNullable<Awaited<ReturnType<typeof createPosition>>>;
export type CreatePositionMutationBody = CreatePositionDTO;
export type CreatePositionMutationError = void;
/**
* @summary Create Position
*/
export declare const useCreatePosition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Position, TError, {
        data: CreatePositionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Position, TError, {
    data: CreatePositionDTO;
}, TContext>;
/**
* @summary Get all Positions
*/
export declare const getAllPosition: (signal?: AbortSignal) => Promise<Position[]>;
export declare const getGetAllPositionQueryKey: () => readonly ["/position"];
export declare const getGetAllPositionQueryOptions: <TData = Position[], TError = void>(options?: {
    query?: UseQueryOptions<Position[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Position[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllPositionQueryResult = NonNullable<Awaited<ReturnType<typeof getAllPosition>>>;
export type GetAllPositionQueryError = void;
/**
 * @summary Get all Positions
 */
export declare const useGetAllPosition: <TData = Position[], TError = void>(options?: {
    query?: UseQueryOptions<Position[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Positions
 */
export declare const getQueryPosition: (params?: GetQueryPositionParams, signal?: AbortSignal) => Promise<Position[]>;
export declare const getGetQueryPositionQueryKey: (params?: GetQueryPositionParams) => readonly ["/position/query", ...GetQueryPositionParams[]];
export declare const getGetQueryPositionQueryOptions: <TData = Position[], TError = void>(params?: GetQueryPositionParams, options?: {
    query?: UseQueryOptions<Position[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Position[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryPositionQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryPosition>>>;
export type GetQueryPositionQueryError = void;
/**
 * @summary Get all Positions
 */
export declare const useGetQueryPosition: <TData = Position[], TError = void>(params?: GetQueryPositionParams, options?: {
    query?: UseQueryOptions<Position[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Positions
 */
export declare const getCountPosition: (params?: GetCountPositionParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountPositionQueryKey: (params?: GetCountPositionParams) => readonly ["/position/count", ...GetCountPositionParams[]];
export declare const getGetCountPositionQueryOptions: <TData = number, TError = void>(params?: GetCountPositionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountPositionQueryResult = NonNullable<Awaited<ReturnType<typeof getCountPosition>>>;
export type GetCountPositionQueryError = void;
/**
 * @summary Get count of Positions
 */
export declare const useGetCountPosition: <TData = number, TError = void>(params?: GetCountPositionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Position
 */
export declare const getOnePosition: (id: number, signal?: AbortSignal) => Promise<Position>;
export declare const getGetOnePositionQueryKey: (id: number) => readonly [`/position/${number}`];
export declare const getGetOnePositionQueryOptions: <TData = Position, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Position, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Position, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOnePositionQueryResult = NonNullable<Awaited<ReturnType<typeof getOnePosition>>>;
export type GetOnePositionQueryError = void;
/**
 * @summary Get one Position
 */
export declare const useGetOnePosition: <TData = Position, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Position, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Position
 */
export declare const updateOnePosition: (id: number, position: Position) => Promise<void>;
export declare const getUpdateOnePositionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Position;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Position;
}, TContext>;
export type UpdateOnePositionMutationResult = NonNullable<Awaited<ReturnType<typeof updateOnePosition>>>;
export type UpdateOnePositionMutationBody = Position;
export type UpdateOnePositionMutationError = void;
/**
* @summary Update one Position
*/
export declare const useUpdateOnePosition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Position;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Position;
}, TContext>;
/**
* @summary Delete one Position
*/
export declare const deleteOnePosition: (id: number) => Promise<void>;
export declare const getDeleteOnePositionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOnePositionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOnePosition>>>;
export type DeleteOnePositionMutationError = void;
/**
* @summary Delete one Position
*/
export declare const useDeleteOnePosition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Position
*/
export declare const uploadPosition: () => Promise<void>;
export declare const getUploadPositionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadPositionMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPosition>>>;
export type UploadPositionMutationError = void;
/**
* @summary Upload a file for Position
*/
export declare const useUploadPosition: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Position
*/
export declare const downloadPosition: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadPositionQueryKey: (filename: string) => readonly [`/position/download/${string}`];
export declare const getDownloadPositionQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadPositionQueryResult = NonNullable<Awaited<ReturnType<typeof downloadPosition>>>;
export type DownloadPositionQueryError = void;
/**
 * @summary Download file related to Position
 */
export declare const useDownloadPosition: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
