import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePaymentProcessorDTO, GetCountPaymentProcessorParams, GetQueryPaymentProcessorParams, PaymentProcessor } from './iWatchFootballAPI.schemas';
/**
 * @summary Create PaymentProcessor
 */
export declare const createPaymentProcessor: (createPaymentProcessorDTO: CreatePaymentProcessorDTO) => Promise<PaymentProcessor>;
export declare const getCreatePaymentProcessorMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<PaymentProcessor, TError, {
        data: CreatePaymentProcessorDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<PaymentProcessor, TError, {
    data: CreatePaymentProcessorDTO;
}, TContext>;
export type CreatePaymentProcessorMutationResult = NonNullable<Awaited<ReturnType<typeof createPaymentProcessor>>>;
export type CreatePaymentProcessorMutationBody = CreatePaymentProcessorDTO;
export type CreatePaymentProcessorMutationError = void;
/**
* @summary Create PaymentProcessor
*/
export declare const useCreatePaymentProcessor: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<PaymentProcessor, TError, {
        data: CreatePaymentProcessorDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<PaymentProcessor, TError, {
    data: CreatePaymentProcessorDTO;
}, TContext>;
/**
* @summary Get all PaymentProcessors
*/
export declare const getAllPaymentProcessor: (signal?: AbortSignal) => Promise<PaymentProcessor[]>;
export declare const getGetAllPaymentProcessorQueryKey: () => readonly ["/paymentProcessor"];
export declare const getGetAllPaymentProcessorQueryOptions: <TData = PaymentProcessor[], TError = void>(options?: {
    query?: UseQueryOptions<PaymentProcessor[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PaymentProcessor[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllPaymentProcessorQueryResult = NonNullable<Awaited<ReturnType<typeof getAllPaymentProcessor>>>;
export type GetAllPaymentProcessorQueryError = void;
/**
 * @summary Get all PaymentProcessors
 */
export declare const useGetAllPaymentProcessor: <TData = PaymentProcessor[], TError = void>(options?: {
    query?: UseQueryOptions<PaymentProcessor[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all PaymentProcessors
 */
export declare const getQueryPaymentProcessor: (params?: GetQueryPaymentProcessorParams, signal?: AbortSignal) => Promise<PaymentProcessor[]>;
export declare const getGetQueryPaymentProcessorQueryKey: (params?: GetQueryPaymentProcessorParams) => readonly ["/paymentProcessor/query", ...GetQueryPaymentProcessorParams[]];
export declare const getGetQueryPaymentProcessorQueryOptions: <TData = PaymentProcessor[], TError = void>(params?: GetQueryPaymentProcessorParams, options?: {
    query?: UseQueryOptions<PaymentProcessor[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PaymentProcessor[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryPaymentProcessorQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryPaymentProcessor>>>;
export type GetQueryPaymentProcessorQueryError = void;
/**
 * @summary Get all PaymentProcessors
 */
export declare const useGetQueryPaymentProcessor: <TData = PaymentProcessor[], TError = void>(params?: GetQueryPaymentProcessorParams, options?: {
    query?: UseQueryOptions<PaymentProcessor[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of PaymentProcessors
 */
export declare const getCountPaymentProcessor: (params?: GetCountPaymentProcessorParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountPaymentProcessorQueryKey: (params?: GetCountPaymentProcessorParams) => readonly ["/paymentProcessor/count", ...GetCountPaymentProcessorParams[]];
export declare const getGetCountPaymentProcessorQueryOptions: <TData = number, TError = void>(params?: GetCountPaymentProcessorParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountPaymentProcessorQueryResult = NonNullable<Awaited<ReturnType<typeof getCountPaymentProcessor>>>;
export type GetCountPaymentProcessorQueryError = void;
/**
 * @summary Get count of PaymentProcessors
 */
export declare const useGetCountPaymentProcessor: <TData = number, TError = void>(params?: GetCountPaymentProcessorParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one PaymentProcessor
 */
export declare const getOnePaymentProcessor: (id: number, signal?: AbortSignal) => Promise<PaymentProcessor>;
export declare const getGetOnePaymentProcessorQueryKey: (id: number) => readonly [`/paymentProcessor/${number}`];
export declare const getGetOnePaymentProcessorQueryOptions: <TData = PaymentProcessor, TError = void>(id: number, options?: {
    query?: UseQueryOptions<PaymentProcessor, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PaymentProcessor, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOnePaymentProcessorQueryResult = NonNullable<Awaited<ReturnType<typeof getOnePaymentProcessor>>>;
export type GetOnePaymentProcessorQueryError = void;
/**
 * @summary Get one PaymentProcessor
 */
export declare const useGetOnePaymentProcessor: <TData = PaymentProcessor, TError = void>(id: number, options?: {
    query?: UseQueryOptions<PaymentProcessor, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one PaymentProcessor
 */
export declare const updateOnePaymentProcessor: (id: number, paymentProcessor: PaymentProcessor) => Promise<void>;
export declare const getUpdateOnePaymentProcessorMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: PaymentProcessor;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: PaymentProcessor;
}, TContext>;
export type UpdateOnePaymentProcessorMutationResult = NonNullable<Awaited<ReturnType<typeof updateOnePaymentProcessor>>>;
export type UpdateOnePaymentProcessorMutationBody = PaymentProcessor;
export type UpdateOnePaymentProcessorMutationError = void;
/**
* @summary Update one PaymentProcessor
*/
export declare const useUpdateOnePaymentProcessor: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: PaymentProcessor;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: PaymentProcessor;
}, TContext>;
/**
* @summary Delete one PaymentProcessor
*/
export declare const deleteOnePaymentProcessor: (id: number) => Promise<void>;
export declare const getDeleteOnePaymentProcessorMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOnePaymentProcessorMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOnePaymentProcessor>>>;
export type DeleteOnePaymentProcessorMutationError = void;
/**
* @summary Delete one PaymentProcessor
*/
export declare const useDeleteOnePaymentProcessor: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for PaymentProcessor
*/
export declare const uploadPaymentProcessor: () => Promise<void>;
export declare const getUploadPaymentProcessorMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadPaymentProcessorMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPaymentProcessor>>>;
export type UploadPaymentProcessorMutationError = void;
/**
* @summary Upload a file for PaymentProcessor
*/
export declare const useUploadPaymentProcessor: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to PaymentProcessor
*/
export declare const downloadPaymentProcessor: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadPaymentProcessorQueryKey: (filename: string) => readonly [`/paymentProcessor/download/${string}`];
export declare const getDownloadPaymentProcessorQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadPaymentProcessorQueryResult = NonNullable<Awaited<ReturnType<typeof downloadPaymentProcessor>>>;
export type DownloadPaymentProcessorQueryError = void;
/**
 * @summary Download file related to PaymentProcessor
 */
export declare const useDownloadPaymentProcessor: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
