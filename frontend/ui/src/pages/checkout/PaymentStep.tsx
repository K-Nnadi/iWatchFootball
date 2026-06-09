import {
    Paper,
    Title,
    Text,
    Stack,
    Group,
    Image,
    Badge,
    Box,
    Notification,
    Flex,
    ThemeIcon,
    Skeleton,
    UnstyledButton,
    Alert,
} from '@mantine/core';
import { IconCheck, IconAlertCircle, IconCreditCard, IconCurrencyPound } from '@tabler/icons-react';
import { UiButton } from '../../components/ui';
import { StripeCheckoutPayment } from './StripeCheckoutPayment';
import { PaymentProcessor, StripeCheckoutSession, CheckoutErrors } from './types';

interface PaymentStepProps {
    paymentProcessors: PaymentProcessor[];
    selectedProcessor: PaymentProcessor | null;
    errors: CheckoutErrors;
    loading: boolean;
    paymentProcessing: boolean;
    paymentStatus: 'idle' | 'success' | 'error';
    payAmountDue: number;
    stripeCheckout: StripeCheckoutSession | null;
    stripeSessionLoading: boolean;
    stripeSessionError: string | null;
    onProcessorSelect: (processor: PaymentProcessor | null) => void;
    onBack: () => void;
    onCreditPaymentSubmit: () => void;
    onStripePaymentComplete: () => Promise<void>;
    onPaymentStatusChange: (status: 'idle' | 'success' | 'error') => void;
    onStripeError: (message: string) => void;
}

function PaymentMethodIcon({ processor }: { processor: PaymentProcessor }) {
    const isStripe = processor.slug === 'stripe';
    const isPaypal = processor.slug === 'paypal';

    if (processor.type === 'CREDIT') {
        return (
            <ThemeIcon size={44} radius="md" variant="light" color="teal">
                <IconCurrencyPound size={24} stroke={1.5} />
            </ThemeIcon>
        );
    }
    if (processor.logoUrl) {
        return (
            <Box
                w={isStripe ? 100 : isPaypal ? 108 : 88}
                h={40}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    borderRadius: 'var(--mantine-radius-md)',
                    overflow: 'hidden',
                    backgroundColor: isStripe ? '#ffffff' : undefined,
                    padding: isStripe ? '6px 12px' : 0,
                    border: isStripe ? '1px solid var(--mantine-color-default-border)' : undefined,
                }}
            >
                <Image
                    src={processor.logoUrl}
                    alt=""
                    h={isStripe ? 22 : undefined}
                    w={isPaypal ? '100%' : undefined}
                    maw={isPaypal ? '100%' : undefined}
                    mah={isPaypal ? 36 : undefined}
                    fit="contain"
                />
            </Box>
        );
    }
    return (
        <ThemeIcon size={44} radius="md" variant="light" color="gray">
            <IconCreditCard size={24} stroke={1.5} />
        </ThemeIcon>
    );
}

function StripePaymentSection({
    stripeCheckout,
    payLabel,
    paymentProcessing,
    loading,
    paymentStatus,
    onStripePaymentComplete,
    onStripeError,
}: {
    stripeCheckout: StripeCheckoutSession;
    payLabel: string;
    paymentProcessing: boolean;
    loading: boolean;
    paymentStatus: 'idle' | 'success' | 'error';
    onStripePaymentComplete: () => Promise<void>;
    onStripeError: (message: string) => void;
}) {
    return (
        <StripeCheckoutPayment
            publishableKey={stripeCheckout.publishableKey}
            clientSecret={stripeCheckout.clientSecret}
            payLabel={payLabel}
            paymentProcessing={paymentProcessing}
            loading={loading}
            paymentStatus={paymentStatus}
            onComplete={onStripePaymentComplete}
            onError={onStripeError}
        />
    );
}

export function PaymentStep({
    paymentProcessors,
    selectedProcessor,
    errors: _errors,
    loading,
    paymentProcessing,
    paymentStatus,
    payAmountDue,
    stripeCheckout,
    stripeSessionLoading,
    stripeSessionError,
    onProcessorSelect,
    onBack,
    onCreditPaymentSubmit,
    onStripePaymentComplete,
    onPaymentStatusChange,
    onStripeError,
}: PaymentStepProps) {
    const borderSubtle = 'var(--mantine-color-default-border)';
    const borderSelected = 'var(--mantine-color-blue-filled)';
    const payLabel = `Pay £${payAmountDue.toFixed(2)}`;
    const isStripeCard =
        selectedProcessor?.type === 'CARD' && selectedProcessor.slug === 'stripe';

    return (
        <Paper shadow="sm" radius="md" p="lg" withBorder>
            <Title order={3} size="h5" mb="md" fw={600}>
                Select payment method
            </Title>

            {loading ? (
                <Stack gap="sm">
                    <Skeleton height={64} radius="md" />
                    <Skeleton height={64} radius="md" />
                    <Skeleton height={64} radius="md" />
                </Stack>
            ) : paymentProcessors.length === 0 ? (
                <Text size="sm" c="dimmed">
                    No payment methods available
                </Text>
            ) : (
                <Stack gap="sm" mt="xs" role="radiogroup" aria-label="Select payment method">
                    {paymentProcessors.map((processor) => {
                        const checked = selectedProcessor?.id === processor.id;
                        const disabled = processor.disabled === true;
                        const select = (): void => {
                            if (disabled) return;
                            onProcessorSelect(processor);
                        };
                        return (
                            <UnstyledButton
                                key={processor.id}
                                type="button"
                                role="radio"
                                aria-checked={checked}
                                aria-disabled={disabled}
                                tabIndex={disabled ? -1 : 0}
                                onClick={select}
                                onKeyDown={(e) => {
                                    if (disabled) return;
                                    if (e.key !== 'Enter' && e.key !== ' ') return;
                                    e.preventDefault();
                                    select();
                                }}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    borderRadius: 'var(--mantine-radius-md)',
                                    border: `1px solid ${checked ? borderSelected : borderSubtle}`,
                                    backgroundColor: checked
                                        ? 'var(--mantine-color-blue-light)'
                                        : undefined,
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    opacity: disabled ? 0.55 : 1,
                                    outline: 'none',
                                    transition:
                                        'border-color 0.15s ease, background-color 0.15s ease',
                                    textAlign: 'left',
                                }}
                            >
                                <Flex align="center" gap="md" wrap="nowrap" p="md" style={{ flex: 1 }}>
                                    <PaymentMethodIcon processor={processor} />
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Text fw={600} size="sm" lineClamp={2}>
                                            {processor.name}
                                        </Text>
                                        {processor.type === 'CREDIT' &&
                                            processor.creditBalance != null && (
                                                <Text size="xs" c="dimmed" mt={2}>
                                                    Available balance
                                                </Text>
                                            )}
                                        {disabled && processor.slug === 'paypal' && (
                                            <Text size="xs" c="dimmed" mt={2}>
                                                Coming soon
                                            </Text>
                                        )}
                                    </Box>
                                    <Badge size="sm" variant="light" color="blue" tt="uppercase">
                                        {processor.type}
                                    </Badge>
                                </Flex>
                            </UnstyledButton>
                        );
                    })}
                </Stack>
            )}

            {selectedProcessor && (
                <Box mt="xl">
                    <Title order={4} size="h6" mb="md" fw={600}>
                        Payment information
                    </Title>

                    {isStripeCard && (
                        <>
                            {stripeSessionError && (
                                <Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
                                    {stripeSessionError}
                                </Alert>
                            )}
                            {stripeSessionLoading && (
                                <Stack gap="sm">
                                    <Skeleton height={120} radius="md" />
                                    <Skeleton height={44} radius="md" />
                                </Stack>
                            )}
                            {!stripeSessionLoading && stripeCheckout && (
                                <StripePaymentSection
                                    stripeCheckout={stripeCheckout}
                                    payLabel={payLabel}
                                    paymentProcessing={paymentProcessing}
                                    loading={loading}
                                    paymentStatus={paymentStatus}
                                    onStripePaymentComplete={onStripePaymentComplete}
                                    onStripeError={onStripeError}
                                />
                            )}
                        </>
                    )}

                    {selectedProcessor.type === 'WALLET' && (
                        <Text size="sm" c="dimmed">
                            PayPal checkout is not available yet. Choose card or platform credit.
                        </Text>
                    )}

                    {selectedProcessor.type === 'CREDIT' && (
                        <Text size="sm" c="dimmed">
                            Your platform credit balance will be debited when you confirm — no
                            separate card step.
                        </Text>
                    )}

                    <Group mt="xl" grow>
                        <UiButton variant="outline" onClick={onBack}>
                            Back
                        </UiButton>
                        {selectedProcessor.type === 'CREDIT' && (
                            <UiButton
                                variant="secondary"
                                size="md"
                                onClick={onCreditPaymentSubmit}
                                loading={paymentProcessing}
                                disabled={loading || paymentProcessing || paymentStatus === 'success'}
                            >
                                {payLabel}
                            </UiButton>
                        )}
                    </Group>
                </Box>
            )}

            {paymentStatus === 'success' && (
                <Notification
                    mt="lg"
                    icon={<IconCheck />}
                    color="green"
                    title="Payment successful"
                    onClose={() => onPaymentStatusChange('idle')}
                >
                    Thank you for your purchase! Redirecting…
                </Notification>
            )}

            {paymentStatus === 'error' && (
                <Notification
                    mt="lg"
                    icon={<IconAlertCircle />}
                    color="red"
                    title="Payment failed"
                    onClose={() => onPaymentStatusChange('idle')}
                >
                    There was an issue with your payment. Please try again.
                </Notification>
            )}
        </Paper>
    );
}
