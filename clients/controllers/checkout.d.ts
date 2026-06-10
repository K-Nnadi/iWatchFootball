import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import type { CheckoutControllerConfirm200, CheckoutControllerRefundPrimary200, ConfirmCheckoutDto } from './iWatchFootballAPI.schemas';
/**
 * @summary Confirm ticket purchase (atomic payment + tickets + hold release)
 */
export declare const checkoutControllerConfirm: (confirmCheckoutDto: ConfirmCheckoutDto) => Promise<CheckoutControllerConfirm200>;
export declare const getCheckoutControllerConfirmMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CheckoutControllerConfirm200, TError, {
        data: ConfirmCheckoutDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<CheckoutControllerConfirm200, TError, {
    data: ConfirmCheckoutDto;
}, TContext>;
export type CheckoutControllerConfirmMutationResult = NonNullable<Awaited<ReturnType<typeof checkoutControllerConfirm>>>;
export type CheckoutControllerConfirmMutationBody = ConfirmCheckoutDto;
export type CheckoutControllerConfirmMutationError = void;
/**
* @summary Confirm ticket purchase (atomic payment + tickets + hold release)
*/
export declare const useCheckoutControllerConfirm: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CheckoutControllerConfirm200, TError, {
        data: ConfirmCheckoutDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<CheckoutControllerConfirm200, TError, {
    data: ConfirmCheckoutDto;
}, TContext>;
/**
* Does not initiate Stripe/card network refunds or marketplace reversals.
* @summary Full primary-market refund (admin): VOID tickets + REFUND ledger + release discount usage
*/
export declare const checkoutControllerRefundPrimary: (paymentId: number) => Promise<CheckoutControllerRefundPrimary200>;
export declare const getCheckoutControllerRefundPrimaryMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CheckoutControllerRefundPrimary200, TError, {
        paymentId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<CheckoutControllerRefundPrimary200, TError, {
    paymentId: number;
}, TContext>;
export type CheckoutControllerRefundPrimaryMutationResult = NonNullable<Awaited<ReturnType<typeof checkoutControllerRefundPrimary>>>;
export type CheckoutControllerRefundPrimaryMutationError = void;
/**
* @summary Full primary-market refund (admin): VOID tickets + REFUND ledger + release discount usage
*/
export declare const useCheckoutControllerRefundPrimary: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<CheckoutControllerRefundPrimary200, TError, {
        paymentId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<CheckoutControllerRefundPrimary200, TError, {
    paymentId: number;
}, TContext>;
