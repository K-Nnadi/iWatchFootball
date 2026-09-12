import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { IconBuildingBank, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { notify } from '../../shared/notify';
import { usePageTransition } from '../../hooks/usePageTransition';
import {
    getSellerConnectStatus,
    startSellerConnectOnboarding,
    type SellerConnectStatus,
} from '../../shared/api/marketplace.api';

export function SellerOnboardingPage() {
    const { navigateWithTransition } = usePageTransition();
    const [status, setStatus] = useState<SellerConnectStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setStatus(await getSellerConnectStatus());
        } catch {
            notify.error('Could not load payout status', 'Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const handleOnboard = async () => {
        setStarting(true);
        try {
            const { url } = await startSellerConnectOnboarding();
            window.location.assign(url);
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Stripe Connect is not available right now.';
            notify.error('Could not start onboarding', msg);
            setStarting(false);
        }
    };

    return (
        <Box style={{ backgroundColor: 'var(--modern-bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
            <Container size="sm">
                <Group gap="sm" mb="lg">
                    <Button
                        variant="subtle"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={() => navigateWithTransition('/marketplace/my-listings')}
                    >
                        Back
                    </Button>
                    <IconBuildingBank size={28} color="var(--modern-lime)" />
                    <Title order={2} style={{ color: 'var(--modern-text-primary)' }}>
                        Seller payouts
                    </Title>
                </Group>

                {loading || !status ? (
                    <Loader />
                ) : (
                    <Stack gap="md">
                        {!status.configured && (
                            <Alert color="yellow" title="Stripe is not configured">
                                You can still list tickets. Payouts will land as platform credit until Connect is enabled.
                            </Alert>
                        )}
                        {status.configured && status.canList && (
                            <Alert color="green" icon={<IconCheck size={16} />} title="Ready to sell">
                                {status.payoutsEnabled
                                    ? 'Payouts are enabled on your Stripe account. Confirmed sales pay out after the buyer confirms receipt.'
                                    : 'Onboarding is submitted. Stripe may still be reviewing payouts.'}
                            </Alert>
                        )}
                        {status.configured && !status.canList && (
                            <Alert color="blue" title="Finish Stripe Connect">
                                Complete onboarding so buyers can pay you. Listing is blocked until this is done.
                            </Alert>
                        )}

                        <Paper p="lg" radius="md" withBorder>
                            <Stack gap="xs">
                                <Text size="sm">
                                    Onboarding complete: {status.onboardingComplete ? 'yes' : 'no'}
                                </Text>
                                <Text size="sm">Payouts enabled: {status.payoutsEnabled ? 'yes' : 'no'}</Text>
                                <Text size="xs" c="dimmed">
                                    After a sale, funds stay in escrow until the buyer confirms they received the ticket.
                                </Text>
                            </Stack>
                        </Paper>

                        {status.configured && !status.payoutsEnabled && (
                            <Button loading={starting} onClick={() => void handleOnboard()}>
                                {status.stripeConnectAccountId ? 'Continue Stripe onboarding' : 'Set up Stripe Connect'}
                            </Button>
                        )}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
