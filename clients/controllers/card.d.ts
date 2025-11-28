import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Card, CreateCardDTO, GetCountCardParams, GetQueryCardParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Card
 */
export declare const createCard: (createCardDTO: CreateCardDTO) => Promise<Card>;
export declare const getCreateCardMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Card, TError, {
        data: CreateCardDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Card, TError, {
    data: CreateCardDTO;
}, TContext>;
export type CreateCardMutationResult = NonNullable<Awaited<ReturnType<typeof createCard>>>;
export type CreateCardMutationBody = CreateCardDTO;
export type CreateCardMutationError = void;
/**
* @summary Create Card
*/
export declare const useCreateCard: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Card, TError, {
        data: CreateCardDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Card, TError, {
    data: CreateCardDTO;
}, TContext>;
/**
* @summary Get all Cards
*/
export declare const getAllCard: (signal?: AbortSignal) => Promise<Card[]>;
export declare const getGetAllCardQueryKey: () => readonly ["/card"];
export declare const getGetAllCardQueryOptions: <TData = Card[], TError = void>(options?: {
    query?: UseQueryOptions<Card[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Card[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllCardQueryResult = NonNullable<Awaited<ReturnType<typeof getAllCard>>>;
export type GetAllCardQueryError = void;
/**
 * @summary Get all Cards
 */
export declare const useGetAllCard: <TData = Card[], TError = void>(options?: {
    query?: UseQueryOptions<Card[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Cards
 */
export declare const getQueryCard: (params?: GetQueryCardParams, signal?: AbortSignal) => Promise<Card[]>;
export declare const getGetQueryCardQueryKey: (params?: GetQueryCardParams) => readonly ["/card/query", ...GetQueryCardParams[]];
export declare const getGetQueryCardQueryOptions: <TData = Card[], TError = void>(params?: GetQueryCardParams, options?: {
    query?: UseQueryOptions<Card[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Card[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryCardQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryCard>>>;
export type GetQueryCardQueryError = void;
/**
 * @summary Get all Cards
 */
export declare const useGetQueryCard: <TData = Card[], TError = void>(params?: GetQueryCardParams, options?: {
    query?: UseQueryOptions<Card[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Cards
 */
export declare const getCountCard: (params?: GetCountCardParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountCardQueryKey: (params?: GetCountCardParams) => readonly ["/card/count", ...GetCountCardParams[]];
export declare const getGetCountCardQueryOptions: <TData = number, TError = void>(params?: GetCountCardParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountCardQueryResult = NonNullable<Awaited<ReturnType<typeof getCountCard>>>;
export type GetCountCardQueryError = void;
/**
 * @summary Get count of Cards
 */
export declare const useGetCountCard: <TData = number, TError = void>(params?: GetCountCardParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Card
 */
export declare const getOneCard: (id: number, signal?: AbortSignal) => Promise<Card>;
export declare const getGetOneCardQueryKey: (id: number) => readonly [`/card/${number}`];
export declare const getGetOneCardQueryOptions: <TData = Card, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Card, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Card, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneCardQueryResult = NonNullable<Awaited<ReturnType<typeof getOneCard>>>;
export type GetOneCardQueryError = void;
/**
 * @summary Get one Card
 */
export declare const useGetOneCard: <TData = Card, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Card, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Card
 */
export declare const updateOneCard: (id: number, card: Card) => Promise<void>;
export declare const getUpdateOneCardMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Card;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Card;
}, TContext>;
export type UpdateOneCardMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneCard>>>;
export type UpdateOneCardMutationBody = Card;
export type UpdateOneCardMutationError = void;
/**
* @summary Update one Card
*/
export declare const useUpdateOneCard: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Card;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Card;
}, TContext>;
/**
* @summary Delete one Card
*/
export declare const deleteOneCard: (id: number) => Promise<void>;
export declare const getDeleteOneCardMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneCardMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneCard>>>;
export type DeleteOneCardMutationError = void;
/**
* @summary Delete one Card
*/
export declare const useDeleteOneCard: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Card
*/
export declare const uploadCard: () => Promise<void>;
export declare const getUploadCardMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadCardMutationResult = NonNullable<Awaited<ReturnType<typeof uploadCard>>>;
export type UploadCardMutationError = void;
/**
* @summary Upload a file for Card
*/
export declare const useUploadCard: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Card
*/
export declare const downloadCard: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadCardQueryKey: (filename: string) => readonly [`/card/download/${string}`];
export declare const getDownloadCardQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadCardQueryResult = NonNullable<Awaited<ReturnType<typeof downloadCard>>>;
export type DownloadCardQueryError = void;
/**
 * @summary Download file related to Card
 */
export declare const useDownloadCard: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
