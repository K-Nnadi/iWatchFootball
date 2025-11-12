import {
    Paper,
    Title,
    Text,
    Stack,
    Radio,
    Group,
    Image,
    Badge,
    Box,
    TextInput,
    Button,
    Notification,
} from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { ModernButton } from '../../components/modern';
import { PaymentProvider, PaymentInfo, CheckoutErrors, CheckoutTicketDetails } from './types';

interface PaymentStepProps {
    paymentProviders: PaymentProvider[];
    selectedProvider: PaymentProvider | null;
    paymentInfo: PaymentInfo;
    errors: CheckoutErrors;
    loading: boolean;
    paymentStatus: 'idle' | 'success' | 'error';
    ticketDetails: CheckoutTicketDetails;
    onProviderSelect: (provider: PaymentProvider | null) => void;
    onPaymentInfoChange: (field: string, value: string) => void;
    onBack: () => void;
    onPaymentSubmit: () => void;
    onPaymentStatusChange: (status: 'idle' | 'success' | 'error') => void;
}

export function PaymentStep({
    paymentProviders,
    selectedProvider,
    paymentInfo,
    errors,
    loading,
    paymentStatus,
    ticketDetails,
    onProviderSelect,
    onPaymentInfoChange,
    onBack,
    onPaymentSubmit,
    onPaymentStatusChange,
}: PaymentStepProps) {
    return (
        <Paper shadow="xs" radius="md" p="md" withBorder>
            <Title order={3} size="h5" mb="md">
                Select Payment Method
            </Title>

            {loading ? (
                <Text size="sm" color="dimmed">
                    Loading payment options...
                </Text>
            ) : paymentProviders.length === 0 ? (
                <Text size="sm" color="dimmed">
                    No payment methods available
                </Text>
            ) : (
                <Radio.Group
                    value={selectedProvider?.id?.toString()}
                    onChange={(value) => {
                        const provider = paymentProviders.find((p) => p.id.toString() === value);
                        onProviderSelect(provider || null);
                        onPaymentInfoChange('name', '');
                        onPaymentInfoChange('cardNumber', '');
                        onPaymentInfoChange('expiration', '');
                        onPaymentInfoChange('cvv', '');
                        onPaymentInfoChange('email', '');
                    }}
                >
                    <Stack mt="xs">
                        {paymentProviders.map((provider) => (
                            <Radio
                                key={provider.id}
                                value={provider.id.toString()}
                                label={
                                    <Group gap="sm">
                                        {provider.logoUrl && (
                                            <Image
                                                src={provider.logoUrl}
                                                alt={provider.name}
                                                width={40}
                                                height={40}
                                                fit="contain"
                                            />
                                        )}
                                        <Text fw={500}>{provider.name}</Text>
                                        <Badge size="sm" variant="light">
                                            {provider.type}
                                        </Badge>
                                    </Group>
                                }
                                styles={{
                                    label: {
                                        padding: '0.75rem',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        transition: 'all 0.2s',
                                    },
                                }}
                            />
                        ))}
                    </Stack>
                </Radio.Group>
            )}

            {selectedProvider && (
                <Box mt="xl">
                    <Title order={4} size="h6" mb="md">
                        Payment Information
                    </Title>

                    {selectedProvider.type === 'CARD' && (
                        <Stack gap="md">
                            <TextInput
                                label="Name on Card"
                                placeholder="John Doe"
                                value={paymentInfo.name}
                                error={errors.name}
                                onChange={(e) => onPaymentInfoChange('name', e.currentTarget.value)}
                            />
                            <TextInput
                                label="Card Number"
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
                                    label="Expiration Date"
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
                            <Text size="sm" color="dimmed">
                                You will be redirected to {selectedProvider.name} to complete your payment.
                            </Text>
                        </Stack>
                    )}

                    <Group mt="xl">
                        <Button variant="default" onClick={onBack} style={{ flex: 1 }}>
                            Back
                        </Button>
                        <ModernButton
                            variant="primary"
                            size="md"
                            style={{ flex: 1 }}
                            onClick={onPaymentSubmit}
                            disabled={paymentStatus === 'idle'}
                        >
                            {paymentStatus === 'idle' ? 'Processing...' : `Pay £${ticketDetails.price?.toFixed(2) || '0.00'}`}
                        </ModernButton>
                    </Group>
                </Box>
            )}

            {paymentStatus === 'success' && (
                <Notification
                    mt="lg"
                    icon={<IconCheck />}
                    color="green"
                    title="Payment Successful"
                    onClose={() => onPaymentStatusChange('idle')}
                >
                    Thank you for your purchase! Redirecting...
                </Notification>
            )}

            {paymentStatus === 'error' && (
                <Notification
                    mt="lg"
                    icon={<IconAlertCircle />}
                    color="red"
                    title="Payment Failed"
                    onClose={() => onPaymentStatusChange('idle')}
                >
                    There was an issue with your payment. Please try again.
                </Notification>
            )}
        </Paper>
    );
}

