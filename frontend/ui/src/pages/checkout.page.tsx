import {
    Box,
    Button,
    Container,
    Divider,
    Group,
    Paper,
    Text,
    TextInput,
    Title,
    Notification,
    Stack,
    Image,
    Radio,
    SimpleGrid,
    Badge,
} from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import { ModernButton } from '../components/modern';

interface CheckoutTicketDetails {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    price: number;
}

interface PaymentProvider {
    id: number;
    name: string;
    slug: string;
    type: 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'CRYPTO';
    logoUrl?: string;
}

export function CheckoutPage() {
    const location = useLocation();
    const { navigateWithTransition } = usePageTransition();
    const ticketDetails: CheckoutTicketDetails = location.state || {
        matchId: 'unknown',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        date: '2023-12-25T18:00:00',
        venue: 'Stadium X',
        price: 50,
    };

    const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace with actual API call
        // const fetchProviders = async () => {
        //     const response = await fetch('/api/payment-provider?enabled=true');
        //     const data = await response.json();
        //     setPaymentProviders(data);
        //     setLoading(false);
        // };
        // fetchProviders();

        // Mock data for now
        setTimeout(() => {
            setPaymentProviders([
                {
                    id: 1,
                    name: 'Stripe',
                    slug: 'stripe',
                    type: 'CARD',
                    logoUrl: '/logos/stripe.svg',
                },
                {
                    id: 2,
                    name: 'PayPal',
                    slug: 'paypal',
                    type: 'WALLET',
                    logoUrl: '/logos/paypal.svg',
                },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    if (!location.state) {
        console.error('No ticket details provided. Redirecting to matches page.');
        navigateWithTransition('/matches');
        return null;
    }

    const [paymentInfo, setPaymentInfo] = useState({
        name: '',
        cardNumber: '',
        expiration: '',
        cvv: '',
        email: '', // For PayPal
    });

    const [errors, setErrors] = useState({
        name: '',
        cardNumber: '',
        expiration: '',
        cvv: '',
        email: '',
    });

    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const validate = () => {
        let valid = true;
        const newErrors = {
            name: '',
            cardNumber: '',
            expiration: '',
            cvv: '',
            email: '',
        };

        if (!selectedProvider) {
            return false;
        }

        if (selectedProvider.type === 'CARD') {
            if (!paymentInfo.name.trim()) {
                newErrors.name = 'Name is required';
                valid = false;
            }

            const cardRegex = /^\d{16}$/;
            if (!cardRegex.test(paymentInfo.cardNumber.replace(/\s+/g, ''))) {
                newErrors.cardNumber = 'Card number must be 16 digits';
                valid = false;
            }

            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(paymentInfo.expiration)) {
                newErrors.expiration = 'Invalid format (MM/YY)';
                valid = false;
            }

            const cvvRegex = /^\d{3,4}$/;
            if (!cvvRegex.test(paymentInfo.cvv)) {
                newErrors.cvv = 'CVV must be 3 or 4 digits';
                valid = false;
            }
        } else if (selectedProvider.type === 'WALLET') {
            const emailRegex = /^\S+@\S+$/;
            if (!emailRegex.test(paymentInfo.email)) {
                newErrors.email = 'Valid email is required';
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const handlePaymentSubmit = () => {
        if (!validate() || !selectedProvider) return;

        setPaymentStatus('idle');
        setTimeout(() => {
            const isSuccessful = Math.random() > 0.1;
            if (isSuccessful) {
                setPaymentStatus('success');
                setTimeout(
                    () =>
                        navigateWithTransition('/thank-you', {
                            transitionType: 'loading',
                            duration: 1200,
                        }),
                    2000,
                );
            } else {
                setPaymentStatus('error');
            }
        }, 1500);
    };

    const handleInputChange = (field: string, value: string) => {
        setPaymentInfo((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    return (
        <Container size="sm" my="xl">
            <Title order={2} mb="lg">
                Checkout
            </Title>
            <Paper shadow="xs" radius="md" p="md" withBorder>
                <Title order={3} size="h5">
                    Match Details
                </Title>
                <Text weight={500} size="sm">
                    {ticketDetails.homeTeam} vs {ticketDetails.awayTeam}
                </Text>
                <Text size="sm">{new Date(ticketDetails.date).toLocaleString()}</Text>
                <Text size="sm">Venue: {ticketDetails.venue}</Text>
                <Divider my="sm" />
                <Group position="apart">
                    <Text>Total Price</Text>
                    <Text weight={700}>£{ticketDetails.price?.toFixed(2) || '0.00'}</Text>
                </Group>
            </Paper>

            <Paper shadow="xs" radius="md" p="md" mt="lg" withBorder>
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
                    <Radio.Group value={selectedProvider?.id?.toString()} onChange={(value) => {
                        const provider = paymentProviders.find((p) => p.id.toString() === value);
                        setSelectedProvider(provider || null);
                        // Reset form when changing provider
                        setPaymentInfo({
                            name: '',
                            cardNumber: '',
                            expiration: '',
                            cvv: '',
                            email: '',
                        });
                    }}>
                        <Stack mt="xs">
                            {paymentProviders.map((provider) => (
                                <Radio
                                    key={provider.id}
                                    value={provider.id.toString()}
                                    label={
                                        <Group spacing="sm">
                                            {provider.logoUrl && (
                                                <Image
                                                    src={provider.logoUrl}
                                                    alt={provider.name}
                                                    width={40}
                                                    height={40}
                                                    fit="contain"
                                                />
                                            )}
                                            <Text weight={500}>{provider.name}</Text>
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
                            <Stack spacing="md">
                                <TextInput
                                    label="Name on Card"
                                    placeholder="John Doe"
                                    value={paymentInfo.name}
                                    error={errors.name}
                                    onChange={(e) => handleInputChange('name', e.currentTarget.value)}
                                />
                                <TextInput
                                    label="Card Number"
                                    placeholder="1234 5678 9012 3456"
                                    value={paymentInfo.cardNumber}
                                    onChange={(e) => {
                                        const raw = e.currentTarget.value.replace(/\D/g, '');
                                        const formatted = raw.match(/.{1,4}/g)?.join(' ') ?? '';
                                        if (raw.length <= 16) {
                                            handleInputChange('cardNumber', formatted);
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
                                            handleInputChange('expiration', val);
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
                                                handleInputChange('cvv', raw);
                                            }
                                        }}
                                        error={errors.cvv}
                                    />
                                </Group>
                            </Stack>
                        )}

                        {selectedProvider.type === 'WALLET' && (
                            <Stack spacing="md">
                                <TextInput
                                    label="Email"
                                    placeholder="your.email@example.com"
                                    type="email"
                                    value={paymentInfo.email}
                                    error={errors.email}
                                    onChange={(e) => handleInputChange('email', e.currentTarget.value)}
                                />
                                <Text size="sm" color="dimmed">
                                    You will be redirected to {selectedProvider.name} to complete your payment.
                                </Text>
                            </Stack>
                        )}

                        <ModernButton
                            fullWidth
                            variant="primary"
                            size="md"
                            mt="lg"
                            onClick={handlePaymentSubmit}
                            disabled={paymentStatus === 'idle'}
                        >
                            {paymentStatus === 'idle' ? 'Processing...' : `Pay £${ticketDetails.price?.toFixed(2) || '0.00'}`}
                        </ModernButton>
                    </Box>
                )}

                {paymentStatus === 'success' && (
                    <Notification
                        mt="lg"
                        icon={<IconCheck />}
                        color="green"
                        title="Payment Successful"
                        onClose={() => setPaymentStatus('idle')}
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
                        onClose={() => setPaymentStatus('idle')}
                    >
                        There was an issue with your payment. Please try again.
                    </Notification>
                )}
            </Paper>
        </Container>
    );
}
