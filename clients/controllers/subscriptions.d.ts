import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { SubscriptionControllerCreateCheckout200, SubscriptionControllerCreateCheckoutBody, SubscriptionControllerCreatePortalBody } from './iWatchFootballAPI.schemas';
/**
 * @summary Current tracker plan and limits for the logged-in user
 */
export declare const subscriptionControllerGetEntitlements: (signal?: AbortSignal) => Promise<void>;
export declare const getSubscriptionControllerGetEntitlementsQueryKey: () => readonly ["/subscriptions/entitlements"];
export declare const getSubscriptionControllerGetEntitlementsQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type SubscriptionControllerGetEntitlementsQueryResult = NonNullable<Awaited<ReturnType<typeof subscriptionControllerGetEntitlements>>>;
export type SubscriptionControllerGetEntitlementsQueryError = void;
/**
 * @summary Current tracker plan and limits for the logged-in user
 */
export declare const useSubscriptionControllerGetEntitlements: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Current tracker plan and limits for the logged-in user
 */
export declare const subscriptionControllerGetEntitlements: (signal?: AbortSignal) => Promise<void>;
export declare const getSubscriptionControllerGetEntitlementsQueryKey: () => readonly ["/subscriptions/entitlements"];
export declare const getSubscriptionControllerGetEntitlementsQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type SubscriptionControllerGetEntitlementsQueryResult = NonNullable<Awaited<ReturnType<typeof subscriptionControllerGetEntitlements>>>;
export type SubscriptionControllerGetEntitlementsQueryError = void;
/**
 * @summary Current tracker plan and limits for the logged-in user
 */
export declare const useSubscriptionControllerGetEntitlements: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create Stripe Checkout session for Premium monthly subscription
 */
export declare const subscriptionControllerCreateCheckout: (subscriptionControllerCreateCheckoutBody: SubscriptionControllerCreateCheckoutBody) => Promise<SubscriptionControllerCreateCheckout200>;
export declare const getSubscriptionControllerCreateCheckoutMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<SubscriptionControllerCreateCheckout200, TError, {
        data: SubscriptionControllerCreateCheckoutBody;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<SubscriptionControllerCreateCheckout200, TError, {
    data: SubscriptionControllerCreateCheckoutBody;
}, TContext>;
export type SubscriptionControllerCreateCheckoutMutationResult = NonNullable<Awaited<ReturnType<typeof subscriptionControllerCreateCheckout>>>;
export type SubscriptionControllerCreateCheckoutMutationBody = SubscriptionControllerCreateCheckoutBody;
export type SubscriptionControllerCreateCheckoutMutationError = void;
/**
* @summary Create Stripe Checkout session for Premium monthly subscription
*/
export declare const useSubscriptionControllerCreateCheckout: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<SubscriptionControllerCreateCheckout200, TError, {
        data: SubscriptionControllerCreateCheckoutBody;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<SubscriptionControllerCreateCheckout200, TError, {
    data: SubscriptionControllerCreateCheckoutBody;
}, TContext>;
/**
* @summary Create Stripe Checkout session for Premium monthly subscription
*/
export declare const subscriptionControllerCreateCheckout: (subscriptionControllerCreateCheckoutBody: SubscriptionControllerCreateCheckoutBody) => Promise<SubscriptionControllerCreateCheckout200>;
export declare const getSubscriptionControllerCreateCheckoutMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<SubscriptionControllerCreateCheckout200, TError, {
        data: SubscriptionControllerCreateCheckoutBody;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<SubscriptionControllerCreateCheckout200, TError, {
    data: SubscriptionControllerCreateCheckoutBody;
}, TContext>;
export type SubscriptionControllerCreateCheckoutMutationResult = NonNullable<Awaited<ReturnType<typeof subscriptionControllerCreateCheckout>>>;
export type SubscriptionControllerCreateCheckoutMutationBody = SubscriptionControllerCreateCheckoutBody;
export type SubscriptionControllerCreateCheckoutMutationError = void;
/**
* @summary Create Stripe Checkout session for Premium monthly subscription
*/
export declare const useSubscriptionControllerCreateCheckout: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<SubscriptionControllerCreateCheckout200, TError, {
        data: SubscriptionControllerCreateCheckoutBody;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<SubscriptionControllerCreateCheckout200, TError, {
    data: SubscriptionControllerCreateCheckoutBody;
}, TContext>;
/**
* @summary Stripe Customer Portal — manage or cancel subscription
*/
export declare const subscriptionControllerCreatePortal: (subscriptionControllerCreatePortalBody: SubscriptionControllerCreatePortalBody) => Promise<void>;
export declare const getSubscriptionControllerCreatePortalMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SubscriptionControllerCreatePortalBody;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: SubscriptionControllerCreatePortalBody;
}, TContext>;
export type SubscriptionControllerCreatePortalMutationResult = NonNullable<Awaited<ReturnType<typeof subscriptionControllerCreatePortal>>>;
export type SubscriptionControllerCreatePortalMutationBody = SubscriptionControllerCreatePortalBody;
export type SubscriptionControllerCreatePortalMutationError = void;
/**
* @summary Stripe Customer Portal — manage or cancel subscription
*/
export declare const useSubscriptionControllerCreatePortal: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SubscriptionControllerCreatePortalBody;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: SubscriptionControllerCreatePortalBody;
}, TContext>;
/**
* @summary Stripe Customer Portal — manage or cancel subscription
*/
export declare const subscriptionControllerCreatePortal: (subscriptionControllerCreatePortalBody: SubscriptionControllerCreatePortalBody) => Promise<void>;
export declare const getSubscriptionControllerCreatePortalMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SubscriptionControllerCreatePortalBody;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: SubscriptionControllerCreatePortalBody;
}, TContext>;
export type SubscriptionControllerCreatePortalMutationResult = NonNullable<Awaited<ReturnType<typeof subscriptionControllerCreatePortal>>>;
export type SubscriptionControllerCreatePortalMutationBody = SubscriptionControllerCreatePortalBody;
export type SubscriptionControllerCreatePortalMutationError = void;
/**
* @summary Stripe Customer Portal — manage or cancel subscription
*/
export declare const useSubscriptionControllerCreatePortal: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SubscriptionControllerCreatePortalBody;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: SubscriptionControllerCreatePortalBody;
}, TContext>;
