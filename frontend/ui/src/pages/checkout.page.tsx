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
    Notification
} from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CheckoutTicketDetails {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    price: number;
}

export function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const ticketDetails: CheckoutTicketDetails = location.state || {
        matchId: 'unknown',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        date: '2023-12-25T18:00:00',
        venue: 'Stadium X',
        price: 50
    };

    // Guard against missing location.state
    if (!location.state) {
        console.error('No ticket details provided. Redirecting to matches page.');
        navigate('/matches');
        return null;
    }

    const [paymentInfo, setPaymentInfo] = useState({
        name: '',
        cardNumber: '',
        expiration: '',
        cvv: ''
    });
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handlePaymentSubmit = () => {
        setPaymentStatus('idle');
        setTimeout(() => {
            const isSuccessful = Math.random() > 0.1; // Simulate 90% success rate
            if (isSuccessful) {
                setPaymentStatus('success');
                setTimeout(() => navigate('/thank-you', { state: ticketDetails }), 2000);
            } else {
                setPaymentStatus('error');
            }
        }, 1500);
    };

    const handleInputChange = (field: string, value: string) => {
        setPaymentInfo({ ...paymentInfo, [field]: value });
    };

    return (
        <Container size="sm" my="xl">
            <Title order={2} mb="lg">Checkout</Title>
            <Paper shadow="xs" radius="md" p="md" withBorder>
                <Title order={3} size="h5">Match Details</Title>
                <Text weight={500} size="sm">{ticketDetails.homeTeam} vs {ticketDetails.awayTeam}</Text>
                <Text size="sm">{new Date(ticketDetails.date).toLocaleString()}</Text>
                <Text size="sm">Venue: {ticketDetails.venue}</Text>
                <Divider my="sm" />
                <Group position="apart">
                    <Text>Total Price</Text>
                    <Text weight={700}>${ticketDetails.price?.toFixed(2) || '0.00'}</Text>
                </Group>
            </Paper>

            <Paper shadow="xs" radius="md" p="md" mt="lg" withBorder>
                <Title order={3} size="h5">Payment Information</Title>
                <Box mt="md">
                    <TextInput
                        label="Name on Card"
                        placeholder="John Doe"
                        value={paymentInfo.name}
                        onChange={(e) => handleInputChange('name', e.currentTarget.value)}
                    />
                    <TextInput
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        mt="md"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.currentTarget.value)}
                    />
                    <Group grow mt="md">
                        <TextInput
                            label="Expiration Date"
                            placeholder="MM/YY"
                            value={paymentInfo.expiration}
                            onChange={(e) => handleInputChange('expiration', e.currentTarget.value)}
                        />
                        <TextInput
                            label="CVV"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={(e) => handleInputChange('cvv', e.currentTarget.value)}
                        />
                    </Group>
                </Box>
                <Button
                    fullWidth
                    mt="lg"
                    onClick={handlePaymentSubmit}
                    loading={paymentStatus === 'idle'}
                >
                    Pay ${ticketDetails.price?.toFixed(2) || '0.00'}
                </Button>
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
