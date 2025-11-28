import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePlayerDTO, GetCountPlayerParams, GetQueryPlayerParams, Player } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Player
 */
export declare const createPlayer: (createPlayerDTO: CreatePlayerDTO) => Promise<Player>;
export declare const getCreatePlayerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Player, TError, {
        data: CreatePlayerDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Player, TError, {
    data: CreatePlayerDTO;
}, TContext>;
export type CreatePlayerMutationResult = NonNullable<Awaited<ReturnType<typeof createPlayer>>>;
export type CreatePlayerMutationBody = CreatePlayerDTO;
export type CreatePlayerMutationError = void;
/**
* @summary Create Player
*/
export declare const useCreatePlayer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Player, TError, {
        data: CreatePlayerDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Player, TError, {
    data: CreatePlayerDTO;
}, TContext>;
/**
* @summary Get all Players
*/
export declare const getAllPlayer: (signal?: AbortSignal) => Promise<Player[]>;
export declare const getGetAllPlayerQueryKey: () => readonly ["/player"];
export declare const getGetAllPlayerQueryOptions: <TData = Player[], TError = void>(options?: {
    query?: UseQueryOptions<Player[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Player[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllPlayerQueryResult = NonNullable<Awaited<ReturnType<typeof getAllPlayer>>>;
export type GetAllPlayerQueryError = void;
/**
 * @summary Get all Players
 */
export declare const useGetAllPlayer: <TData = Player[], TError = void>(options?: {
    query?: UseQueryOptions<Player[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Players
 */
export declare const getQueryPlayer: (params?: GetQueryPlayerParams, signal?: AbortSignal) => Promise<Player[]>;
export declare const getGetQueryPlayerQueryKey: (params?: GetQueryPlayerParams) => readonly ["/player/query", ...GetQueryPlayerParams[]];
export declare const getGetQueryPlayerQueryOptions: <TData = Player[], TError = void>(params?: GetQueryPlayerParams, options?: {
    query?: UseQueryOptions<Player[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Player[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryPlayerQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryPlayer>>>;
export type GetQueryPlayerQueryError = void;
/**
 * @summary Get all Players
 */
export declare const useGetQueryPlayer: <TData = Player[], TError = void>(params?: GetQueryPlayerParams, options?: {
    query?: UseQueryOptions<Player[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Players
 */
export declare const getCountPlayer: (params?: GetCountPlayerParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountPlayerQueryKey: (params?: GetCountPlayerParams) => readonly ["/player/count", ...GetCountPlayerParams[]];
export declare const getGetCountPlayerQueryOptions: <TData = number, TError = void>(params?: GetCountPlayerParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountPlayerQueryResult = NonNullable<Awaited<ReturnType<typeof getCountPlayer>>>;
export type GetCountPlayerQueryError = void;
/**
 * @summary Get count of Players
 */
export declare const useGetCountPlayer: <TData = number, TError = void>(params?: GetCountPlayerParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Player
 */
export declare const getOnePlayer: (id: number, signal?: AbortSignal) => Promise<Player>;
export declare const getGetOnePlayerQueryKey: (id: number) => readonly [`/player/${number}`];
export declare const getGetOnePlayerQueryOptions: <TData = Player, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Player, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Player, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOnePlayerQueryResult = NonNullable<Awaited<ReturnType<typeof getOnePlayer>>>;
export type GetOnePlayerQueryError = void;
/**
 * @summary Get one Player
 */
export declare const useGetOnePlayer: <TData = Player, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Player, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Player
 */
export declare const updateOnePlayer: (id: number, player: Player) => Promise<void>;
export declare const getUpdateOnePlayerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Player;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Player;
}, TContext>;
export type UpdateOnePlayerMutationResult = NonNullable<Awaited<ReturnType<typeof updateOnePlayer>>>;
export type UpdateOnePlayerMutationBody = Player;
export type UpdateOnePlayerMutationError = void;
/**
* @summary Update one Player
*/
export declare const useUpdateOnePlayer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Player;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Player;
}, TContext>;
/**
* @summary Delete one Player
*/
export declare const deleteOnePlayer: (id: number) => Promise<void>;
export declare const getDeleteOnePlayerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOnePlayerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOnePlayer>>>;
export type DeleteOnePlayerMutationError = void;
/**
* @summary Delete one Player
*/
export declare const useDeleteOnePlayer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Player
*/
export declare const uploadPlayer: () => Promise<void>;
export declare const getUploadPlayerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadPlayerMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPlayer>>>;
export type UploadPlayerMutationError = void;
/**
* @summary Upload a file for Player
*/
export declare const useUploadPlayer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Player
*/
export declare const downloadPlayer: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadPlayerQueryKey: (filename: string) => readonly [`/player/download/${string}`];
export declare const getDownloadPlayerQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadPlayerQueryResult = NonNullable<Awaited<ReturnType<typeof downloadPlayer>>>;
export type DownloadPlayerQueryError = void;
/**
 * @summary Download file related to Player
 */
export declare const useDownloadPlayer: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
