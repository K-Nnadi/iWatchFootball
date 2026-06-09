import { useEffect, useRef, useState } from 'react';
import { Box, Skeleton, Stack } from '@mantine/core';
import { loadStripe, type Stripe, type StripeCheckout } from '@stripe/stripe-js';
import { ModernButton } from '../../components/modern';

interface StripeCheckoutPaymentProps {
    publishableKey: string;
    clientSecret: string;
    payLabel: string;
    paymentProcessing: boolean;
    loading: boolean;
    paymentStatus: 'idle' | 'success' | 'error';
    onComplete: () => Promise<void>;
    onError: (message: string) => void;
}

export function StripeCheckoutPayment({
    publishableKey,
    clientSecret,
    payLabel,
    paymentProcessing,
    loading,
    paymentStatus,
    onComplete,
    onError,
}: StripeCheckoutPaymentProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const checkoutRef = useRef<StripeCheckout | null>(null);
    const [elementReady, setElementReady] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let paymentElement: ReturnType<StripeCheckout['createPaymentElement']> | null = null;

        setElementReady(false);
        setInitError(null);
        checkoutRef.current = null;

        void (async () => {
            try {
                const stripe: Stripe | null = await loadStripe(publishableKey);
                if (!stripe || cancelled) return;

                const checkout = await stripe.initCheckout({
                    fetchClientSecret: async () => clientSecret,
                });
                if (cancelled) return;

                checkoutRef.current = checkout;
                paymentElement = checkout.createPaymentElement({ layout: 'tabs' });

                if (mountRef.current) {
                    paymentElement.mount(mountRef.current);
                }
                if (!cancelled) setElementReady(true);
            } catch (e: unknown) {
                if (cancelled) return;
                const msg =
                    e instanceof Error ? e.message : 'Could not load Stripe payment form';
                setInitError(msg);
                onError(msg);
            }
        })();

        return () => {
            cancelled = true;
            paymentElement?.unmount();
            checkoutRef.current = null;
        };
    }, [publishableKey, clientSecret, onError]);

    const handlePay = async () => {
        const checkout = checkoutRef.current;
        if (!checkout) {
            onError('Payment form is not ready yet');
            return;
        }
        const result = await checkout.confirm();
        if (result.type === 'error') {
            throw new Error(result.error.message ?? 'Payment could not be confirmed');
        }
        await onComplete();
    };

    if (initError) {
        return null;
    }

    return (
        <Stack gap="md">
            {!elementReady && <Skeleton height={120} radius="md" />}
            <Box ref={mountRef} style={{ display: elementReady ? 'block' : 'none' }} />
            <ModernButton
                variant="secondary"
                size="md"
                onClick={() => {
                    void handlePay().catch((e: unknown) => {
                        onError(
                            e instanceof Error ? e.message : 'Payment could not be confirmed',
                        );
                    });
                }}
                loading={paymentProcessing}
                disabled={
                    loading ||
                    paymentProcessing ||
                    paymentStatus === 'success' ||
                    !elementReady
                }
            >
                {payLabel}
            </ModernButton>
        </Stack>
    );
}
