import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import type { WebhookConfirmCheckoutDto } from './iWatchFootballAPI.schemas';
/**
 * @summary Stripe webhook (ticket payments + subscriptions)
 */
export declare const stripeWebhookControllerHandleStripeWebhook: () => Promise<void>;
export declare const getStripeWebhookControllerHandleStripeWebhookMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type StripeWebhookControllerHandleStripeWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof stripeWebhookControllerHandleStripeWebhook>>>;
export type StripeWebhookControllerHandleStripeWebhookMutationError = unknown;
/**
* @summary Stripe webhook (ticket payments + subscriptions)
*/
export declare const useStripeWebhookControllerHandleStripeWebhook: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Complete checkout after external PSP success (shared-secret trusted relay)
*/
export declare const paymentWebhookControllerHandlePaymentConfirmed: (webhookConfirmCheckoutDto: WebhookConfirmCheckoutDto) => Promise<void>;
export declare const getPaymentWebhookControllerHandlePaymentConfirmedMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: WebhookConfirmCheckoutDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: WebhookConfirmCheckoutDto;
}, TContext>;
export type PaymentWebhookControllerHandlePaymentConfirmedMutationResult = NonNullable<Awaited<ReturnType<typeof paymentWebhookControllerHandlePaymentConfirmed>>>;
export type PaymentWebhookControllerHandlePaymentConfirmedMutationBody = WebhookConfirmCheckoutDto;
export type PaymentWebhookControllerHandlePaymentConfirmedMutationError = unknown;
/**
* @summary Complete checkout after external PSP success (shared-secret trusted relay)
*/
export declare const usePaymentWebhookControllerHandlePaymentConfirmed: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: WebhookConfirmCheckoutDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: WebhookConfirmCheckoutDto;
}, TContext>;
