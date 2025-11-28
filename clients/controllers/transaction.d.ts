import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateTransactionDTO, GetCountTransactionParams, GetQueryTransactionParams, Transaction } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Transaction
 */
export declare const createTransaction: (createTransactionDTO: CreateTransactionDTO) => Promise<Transaction>;
export declare const getCreateTransactionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Transaction, TError, {
        data: CreateTransactionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Transaction, TError, {
    data: CreateTransactionDTO;
}, TContext>;
export type CreateTransactionMutationResult = NonNullable<Awaited<ReturnType<typeof createTransaction>>>;
export type CreateTransactionMutationBody = CreateTransactionDTO;
export type CreateTransactionMutationError = void;
/**
* @summary Create Transaction
*/
export declare const useCreateTransaction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Transaction, TError, {
        data: CreateTransactionDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Transaction, TError, {
    data: CreateTransactionDTO;
}, TContext>;
/**
* @summary Get all Transactions
*/
export declare const getAllTransaction: (signal?: AbortSignal) => Promise<Transaction[]>;
export declare const getGetAllTransactionQueryKey: () => readonly ["/transaction"];
export declare const getGetAllTransactionQueryOptions: <TData = Transaction[], TError = void>(options?: {
    query?: UseQueryOptions<Transaction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Transaction[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllTransactionQueryResult = NonNullable<Awaited<ReturnType<typeof getAllTransaction>>>;
export type GetAllTransactionQueryError = void;
/**
 * @summary Get all Transactions
 */
export declare const useGetAllTransaction: <TData = Transaction[], TError = void>(options?: {
    query?: UseQueryOptions<Transaction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Transactions
 */
export declare const getQueryTransaction: (params?: GetQueryTransactionParams, signal?: AbortSignal) => Promise<Transaction[]>;
export declare const getGetQueryTransactionQueryKey: (params?: GetQueryTransactionParams) => readonly ["/transaction/query", ...GetQueryTransactionParams[]];
export declare const getGetQueryTransactionQueryOptions: <TData = Transaction[], TError = void>(params?: GetQueryTransactionParams, options?: {
    query?: UseQueryOptions<Transaction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Transaction[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryTransactionQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryTransaction>>>;
export type GetQueryTransactionQueryError = void;
/**
 * @summary Get all Transactions
 */
export declare const useGetQueryTransaction: <TData = Transaction[], TError = void>(params?: GetQueryTransactionParams, options?: {
    query?: UseQueryOptions<Transaction[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Transactions
 */
export declare const getCountTransaction: (params?: GetCountTransactionParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountTransactionQueryKey: (params?: GetCountTransactionParams) => readonly ["/transaction/count", ...GetCountTransactionParams[]];
export declare const getGetCountTransactionQueryOptions: <TData = number, TError = void>(params?: GetCountTransactionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountTransactionQueryResult = NonNullable<Awaited<ReturnType<typeof getCountTransaction>>>;
export type GetCountTransactionQueryError = void;
/**
 * @summary Get count of Transactions
 */
export declare const useGetCountTransaction: <TData = number, TError = void>(params?: GetCountTransactionParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Transaction
 */
export declare const getOneTransaction: (id: number, signal?: AbortSignal) => Promise<Transaction>;
export declare const getGetOneTransactionQueryKey: (id: number) => readonly [`/transaction/${number}`];
export declare const getGetOneTransactionQueryOptions: <TData = Transaction, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Transaction, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Transaction, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneTransactionQueryResult = NonNullable<Awaited<ReturnType<typeof getOneTransaction>>>;
export type GetOneTransactionQueryError = void;
/**
 * @summary Get one Transaction
 */
export declare const useGetOneTransaction: <TData = Transaction, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Transaction, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Transaction
 */
export declare const updateOneTransaction: (id: number, transaction: Transaction) => Promise<void>;
export declare const getUpdateOneTransactionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Transaction;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Transaction;
}, TContext>;
export type UpdateOneTransactionMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneTransaction>>>;
export type UpdateOneTransactionMutationBody = Transaction;
export type UpdateOneTransactionMutationError = void;
/**
* @summary Update one Transaction
*/
export declare const useUpdateOneTransaction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Transaction;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Transaction;
}, TContext>;
/**
* @summary Delete one Transaction
*/
export declare const deleteOneTransaction: (id: number) => Promise<void>;
export declare const getDeleteOneTransactionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneTransactionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneTransaction>>>;
export type DeleteOneTransactionMutationError = void;
/**
* @summary Delete one Transaction
*/
export declare const useDeleteOneTransaction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Transaction
*/
export declare const uploadTransaction: () => Promise<void>;
export declare const getUploadTransactionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadTransactionMutationResult = NonNullable<Awaited<ReturnType<typeof uploadTransaction>>>;
export type UploadTransactionMutationError = void;
/**
* @summary Upload a file for Transaction
*/
export declare const useUploadTransaction: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Transaction
*/
export declare const downloadTransaction: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadTransactionQueryKey: (filename: string) => readonly [`/transaction/download/${string}`];
export declare const getDownloadTransactionQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadTransactionQueryResult = NonNullable<Awaited<ReturnType<typeof downloadTransaction>>>;
export type DownloadTransactionQueryError = void;
/**
 * @summary Download file related to Transaction
 */
export declare const useDownloadTransaction: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
