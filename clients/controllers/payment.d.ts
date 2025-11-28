import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePaymentDTO, GetCountPaymentParams, GetQueryPaymentParams, Payment } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Payment
 */
export declare const createPayment: (createPaymentDTO: CreatePaymentDTO) => Promise<Payment>;
export declare const getCreatePaymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Payment, TError, {
        data: CreatePaymentDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Payment, TError, {
    data: CreatePaymentDTO;
}, TContext>;
export type CreatePaymentMutationResult = NonNullable<Awaited<ReturnType<typeof createPayment>>>;
export type CreatePaymentMutationBody = CreatePaymentDTO;
export type CreatePaymentMutationError = void;
/**
* @summary Create Payment
*/
export declare const useCreatePayment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Payment, TError, {
        data: CreatePaymentDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Payment, TError, {
    data: CreatePaymentDTO;
}, TContext>;
/**
* @summary Get all Payments
*/
export declare const getAllPayment: (signal?: AbortSignal) => Promise<Payment[]>;
export declare const getGetAllPaymentQueryKey: () => readonly ["/payment"];
export declare const getGetAllPaymentQueryOptions: <TData = Payment[], TError = void>(options?: {
    query?: UseQueryOptions<Payment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Payment[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllPaymentQueryResult = NonNullable<Awaited<ReturnType<typeof getAllPayment>>>;
export type GetAllPaymentQueryError = void;
/**
 * @summary Get all Payments
 */
export declare const useGetAllPayment: <TData = Payment[], TError = void>(options?: {
    query?: UseQueryOptions<Payment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Payments
 */
export declare const getQueryPayment: (params?: GetQueryPaymentParams, signal?: AbortSignal) => Promise<Payment[]>;
export declare const getGetQueryPaymentQueryKey: (params?: GetQueryPaymentParams) => readonly ["/payment/query", ...GetQueryPaymentParams[]];
export declare const getGetQueryPaymentQueryOptions: <TData = Payment[], TError = void>(params?: GetQueryPaymentParams, options?: {
    query?: UseQueryOptions<Payment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Payment[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryPaymentQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryPayment>>>;
export type GetQueryPaymentQueryError = void;
/**
 * @summary Get all Payments
 */
export declare const useGetQueryPayment: <TData = Payment[], TError = void>(params?: GetQueryPaymentParams, options?: {
    query?: UseQueryOptions<Payment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Payments
 */
export declare const getCountPayment: (params?: GetCountPaymentParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountPaymentQueryKey: (params?: GetCountPaymentParams) => readonly ["/payment/count", ...GetCountPaymentParams[]];
export declare const getGetCountPaymentQueryOptions: <TData = number, TError = void>(params?: GetCountPaymentParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountPaymentQueryResult = NonNullable<Awaited<ReturnType<typeof getCountPayment>>>;
export type GetCountPaymentQueryError = void;
/**
 * @summary Get count of Payments
 */
export declare const useGetCountPayment: <TData = number, TError = void>(params?: GetCountPaymentParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Payment
 */
export declare const getOnePayment: (id: number, signal?: AbortSignal) => Promise<Payment>;
export declare const getGetOnePaymentQueryKey: (id: number) => readonly [`/payment/${number}`];
export declare const getGetOnePaymentQueryOptions: <TData = Payment, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Payment, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Payment, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOnePaymentQueryResult = NonNullable<Awaited<ReturnType<typeof getOnePayment>>>;
export type GetOnePaymentQueryError = void;
/**
 * @summary Get one Payment
 */
export declare const useGetOnePayment: <TData = Payment, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Payment, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Payment
 */
export declare const updateOnePayment: (id: number, payment: Payment) => Promise<void>;
export declare const getUpdateOnePaymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Payment;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Payment;
}, TContext>;
export type UpdateOnePaymentMutationResult = NonNullable<Awaited<ReturnType<typeof updateOnePayment>>>;
export type UpdateOnePaymentMutationBody = Payment;
export type UpdateOnePaymentMutationError = void;
/**
* @summary Update one Payment
*/
export declare const useUpdateOnePayment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Payment;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Payment;
}, TContext>;
/**
* @summary Delete one Payment
*/
export declare const deleteOnePayment: (id: number) => Promise<void>;
export declare const getDeleteOnePaymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOnePaymentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOnePayment>>>;
export type DeleteOnePaymentMutationError = void;
/**
* @summary Delete one Payment
*/
export declare const useDeleteOnePayment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Payment
*/
export declare const uploadPayment: () => Promise<void>;
export declare const getUploadPaymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadPaymentMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPayment>>>;
export type UploadPaymentMutationError = void;
/**
* @summary Upload a file for Payment
*/
export declare const useUploadPayment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Payment
*/
export declare const downloadPayment: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadPaymentQueryKey: (filename: string) => readonly [`/payment/download/${string}`];
export declare const getDownloadPaymentQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadPaymentQueryResult = NonNullable<Awaited<ReturnType<typeof downloadPayment>>>;
export type DownloadPaymentQueryError = void;
/**
 * @summary Download file related to Payment
 */
export declare const useDownloadPayment: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
