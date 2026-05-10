import {
    Paper,
    Title,
    Text,
    Stack,
    Group,
    Image,
    Badge,
    Box,
    TextInput,
    Button,
    Notification,
    Flex,
    ThemeIcon,
    Skeleton,
    UnstyledButton,
} from '@mantine/core';
import { IconCheck, IconAlertCircle, IconCreditCard, IconCurrencyPound } from '@tabler/icons-react';
import { ModernButton } from '../../components/modern';
import { PaymentProvider, PaymentInfo, CheckoutErrors } from './types';

interface PaymentStepProps {
    paymentProviders: PaymentProvider[];
    selectedProvider: PaymentProvider | null;
    paymentInfo: PaymentInfo;
    errors: CheckoutErrors;
    loading: boolean;
    paymentProcessing: boolean;
    paymentStatus: 'idle' | 'success' | 'error';
    /** Total shown on Pay button — primary subtotal − discount when applicable */
    payAmountDue: number;
    onProviderSelect: (provider: PaymentProvider | null) => void;
    onPaymentInfoChange: (field: string, value: string) => void;
    onBack: () => void;
    onPaymentSubmit: () => void;
    onPaymentStatusChange: (status: 'idle' | 'success' | 'error') => void;
}

function PaymentMethodIcon({ provider }: { provider: PaymentProvider }) {
    const isStripe = provider.slug === 'stripe';
    const isPaypal = provider.slug === 'paypal';

    if (provider.type === 'CREDIT') {
        return (
            <ThemeIcon size={44} radius="md" variant="light" color="teal">
                <IconCurrencyPound size={24} stroke={1.5} />
            </ThemeIcon>
        );
    }
    if (provider.logoUrl) {
        /** Brand PNGs from `public/logos`: Stripe needs a light tray on dark chrome; PayPal artwork includes its panel. */
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
                    border:
                        isStripe
                            ? '1px solid var(--mantine-color-default-border)'
                            : undefined,
                }}
            >
                <Image
                    src={provider.logoUrl}
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

export function PaymentStep({
    paymentProviders,
    selectedProvider,
    paymentInfo,
    errors,
    loading,
    paymentProcessing,
    paymentStatus,
    payAmountDue,
    onProviderSelect,
    onPaymentInfoChange,
    onBack,
    onPaymentSubmit,
    onPaymentStatusChange,
}: PaymentStepProps) {
    const borderSubtle = 'var(--mantine-color-default-border)';
    const borderSelected = 'var(--mantine-color-blue-filled)';

    const payLabel = `Pay £${payAmountDue.toFixed(2)}`;

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
            ) : paymentProviders.length === 0 ? (
                <Text size="sm" c="dimmed">
                    No payment methods available
                </Text>
            ) : (
                <Stack
                    gap="sm"
                    mt="xs"
                    role="radiogroup"
                    aria-label="Select payment method"
                >
                    {paymentProviders.map((provider) => {
                        const checked = selectedProvider?.id === provider.id;
                        const select = (): void => {
                            onProviderSelect(provider);
                            onPaymentInfoChange('name', '');
                            onPaymentInfoChange('cardNumber', '');
                            onPaymentInfoChange('expiration', '');
                            onPaymentInfoChange('cvv', '');
                            onPaymentInfoChange('email', '');
                        };
                        return (
                            <UnstyledButton
                                key={provider.id}
                                type="button"
                                role="radio"
                                aria-checked={checked}
                                tabIndex={0}
                                onClick={select}
                                onKeyDown={(e) => {
                                    if (e.key !== 'Enter' && e.key !== ' ') return;
                                    e.preventDefault();
                                    select();
                                }}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    borderRadius: 'var(--mantine-radius-md)',
                                    border: `1px solid ${checked ? borderSelected : borderSubtle}`,
                                    backgroundColor: checked ? 'var(--mantine-color-blue-light)' : undefined,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition:
                                        'border-color 0.15s ease, background-color 0.15s ease',
                                    textAlign: 'left',
                                }}
                                styles={{
                                    root: {
                                        '&:focus-visible': {
                                            outline: '2px solid var(--mantine-color-blue-filled)',
                                            outlineOffset: '2px',
                                        },
                                    },
                                }}
                            >
                                <Flex align="center" gap="md" wrap="nowrap" p="md" style={{ flex: 1 }}>
                                    <PaymentMethodIcon provider={provider} />
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Text fw={600} size="sm" lineClamp={2}>
                                            {provider.name}
                                        </Text>
                                        {provider.type === 'CREDIT' &&
                                            provider.creditBalance != null && (
                                                <Text size="xs" c="dimmed" mt={2}>
                                                    Available balance
                                                </Text>
                                            )}
                                    </Box>
                                    <Badge size="sm" variant="light" color="blue" tt="uppercase">
                                        {provider.type}
                                    </Badge>
                                </Flex>
                            </UnstyledButton>
                        );
                    })}
                </Stack>
            )}

            {selectedProvider && (
                <Box mt="xl">
                    <Title order={4} size="h6" mb="md" fw={600}>
                        Payment information
                    </Title>

                    {selectedProvider.type === 'CARD' && (
                        <Stack gap="md">
                            <TextInput
                                label="Name on card"
                                placeholder="John Doe"
                                value={paymentInfo.name}
                                error={errors.name}
                                onChange={(e) => onPaymentInfoChange('name', e.currentTarget.value)}
                            />
                            <TextInput
                                label="Card number"
                                placeholder="1234 5678 9012 3456"
                                value={paymentInfo.cardNumber}
                                onChange={(e) => {
                                    const raw = e.currentTarget.value.replace(/\D/g, '');
                                    const formatted = raw.match(/.{1,4}/g)?.join(' ') ?? '';
                                    if (raw.length <= 16) {
                                        onPaymentInfoChange('cardNumber', formatted);
                                    }
                                }}
                                error={errors.cardNumber}
                            />

                            <Group grow>
                                <TextInput
                                    label="Expiry"
                                    placeholder="MM/YY"
                                    value={paymentInfo.expiration}
                                    onChange={(e) => {
                                        let val = e.currentTarget.value.replace(/\D/g, '');
                                        if (val.length > 4) val = val.slice(0, 4);

                                        if (val.length >= 3) {
                                            val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                        }
                                        onPaymentInfoChange('expiration', val);
                                    }}
                                    error={errors.expiration}
                                />

                                <TextInput
                                    label="CVV"
                                    placeholder="123"
                                    value={paymentInfo.cvv}
                                    onChange={(e) => {
                                        const raw = e.currentTarget.value.replace(/\D/g, '');
                                        if (raw.length <= 4) {
                                            onPaymentInfoChange('cvv', raw);
                                        }
                                    }}
                                    error={errors.cvv}
                                />
                            </Group>
                        </Stack>
                    )}

                    {selectedProvider.type === 'WALLET' && (
                        <Stack gap="md">
                            <TextInput
                                label="Email"
                                placeholder="your.email@example.com"
                                type="email"
                                value={paymentInfo.email}
                                error={errors.email}
                                onChange={(e) => onPaymentInfoChange('email', e.currentTarget.value)}
                            />
                            <Text size="sm" c="dimmed">
                                You will be redirected to {selectedProvider.name} to complete your payment.
                            </Text>
                        </Stack>
                    )}

                    {selectedProvider.type === 'CREDIT' && (
                        <Text size="sm" c="dimmed">
                            Your platform credit balance will be debited when you confirm — no separate card step.
                        </Text>
                    )}

                    <Group mt="xl" grow>
                        <Button variant="default" onClick={onBack}>
                            Back
                        </Button>
                        <ModernButton
                            variant="secondary"
                            size="md"
                            onClick={onPaymentSubmit}
                            loading={paymentProcessing}
                            disabled={loading || paymentProcessing || paymentStatus === 'success'}
                        >
                            {payLabel}
                        </ModernButton>
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
