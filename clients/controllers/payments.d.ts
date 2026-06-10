import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePaymentSessionDto, PaymentsControllerGetProviders200Item } from './iWatchFootballAPI.schemas';
/**
 * @summary Enabled payment processors for checkout UI
 */
export declare const paymentsControllerGetProviders: (signal?: AbortSignal) => Promise<PaymentsControllerGetProviders200Item[]>;
export declare const getPaymentsControllerGetProvidersQueryKey: () => readonly ["/payments/providers"];
export declare const getPaymentsControllerGetProvidersQueryOptions: <TData = PaymentsControllerGetProviders200Item[], TError = void>(options?: {
    query?: UseQueryOptions<PaymentsControllerGetProviders200Item[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PaymentsControllerGetProviders200Item[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type PaymentsControllerGetProvidersQueryResult = NonNullable<Awaited<ReturnType<typeof paymentsControllerGetProviders>>>;
export type PaymentsControllerGetProvidersQueryError = void;
/**
 * @summary Enabled payment processors for checkout UI
 */
export declare const usePaymentsControllerGetProviders: <TData = PaymentsControllerGetProviders200Item[], TError = void>(options?: {
    query?: UseQueryOptions<PaymentsControllerGetProviders200Item[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a PSP checkout session for primary ticket purchase
 */
export declare const paymentsControllerCreateSession: (createPaymentSessionDto: CreatePaymentSessionDto) => Promise<void>;
export declare const getPaymentsControllerCreateSessionMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: CreatePaymentSessionDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: CreatePaymentSessionDto;
}, TContext>;
export type PaymentsControllerCreateSessionMutationResult = NonNullable<Awaited<ReturnType<typeof paymentsControllerCreateSession>>>;
export type PaymentsControllerCreateSessionMutationBody = CreatePaymentSessionDto;
export type PaymentsControllerCreateSessionMutationError = void;
/**
* @summary Create a PSP checkout session for primary ticket purchase
*/
export declare const usePaymentsControllerCreateSession: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: CreatePaymentSessionDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: CreatePaymentSessionDto;
}, TContext>;
/**
* @summary Poll payment session status after Stripe confirm
*/
export declare const paymentsControllerGetSession: (id: number, signal?: AbortSignal) => Promise<void>;
export declare const getPaymentsControllerGetSessionQueryKey: (id: number) => readonly [`/payments/sessions/${number}`];
export declare const getPaymentsControllerGetSessionQueryOptions: <TData = void, TError = void>(id: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type PaymentsControllerGetSessionQueryResult = NonNullable<Awaited<ReturnType<typeof paymentsControllerGetSession>>>;
export type PaymentsControllerGetSessionQueryError = void;
/**
 * @summary Poll payment session status after Stripe confirm
 */
export declare const usePaymentsControllerGetSession: <TData = void, TError = void>(id: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
