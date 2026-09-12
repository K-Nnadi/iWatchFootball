import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Stack,
    Text,
    Group,
    NumberInput,
    Divider,
    Loader,
    Center,
    Alert,
} from '@mantine/core';
import { IconTag, IconTicket, IconInfoCircle, IconArrowLeft } from '@tabler/icons-react';
import { notify } from '../../shared/notify';
import { usePageTransition } from '../../hooks/usePageTransition';
import { ModernH1, ModernH3, ModernBody, ModernButton } from '../../components/modern';
import { createListing, getSellerConnectStatus, getSellerPayoutPreview } from '../../shared/api/marketplace.api';
import { getMyTicketLog } from '../../shared/api/userTicketLog.api';

interface OwnedTicket {
    id: number;
    category: string;
    price: number;
    fixtureId: number;
    fixtureLabel: string;
    fixtureDate?: string;
    metadata?: Record<string, unknown>;
}

export function CreateListingPage() {
    const { navigateWithTransition } = usePageTransition();
    const [myTickets, setMyTickets] = useState<OwnedTicket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<OwnedTicket | null>(null);
    const [askPrice, setAskPrice] = useState<number | string>('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [canList, setCanList] = useState(true);
    const [connectConfigured, setConnectConfigured] = useState(false);
    const [payoutNet, setPayoutNet] = useState<number | null>(null);
    const [sellerFee, setSellerFee] = useState<number | null>(null);

    useEffect(() => {
        const fetchMyTickets = async () => {
            try {
                const entries = await getMyTicketLog();
                const tickets: OwnedTicket[] = entries
                    .filter((e) => e.ticket != null)
                    .map((e) => ({
                        id: e.ticketId,
                        category: e.ticket!.category,
                        price: e.ticket!.price,
                        fixtureId: e.ticket!.fixtureId,
                        fixtureLabel:
                            e.ticket!.fixtureLabel?.trim() || `Fixture #${e.ticket!.fixtureId}`,
                        fixtureDate: e.ticket!.fixtureDate,
                        metadata: e.ticket!.metadata,
                    }));
                setMyTickets(tickets);
            } catch {
                notify.error('Could not load your tickets', 'Please try refreshing the page.');
            } finally {
                setLoadingTickets(false);
            }
        };
        void fetchMyTickets();
    }, []);

    useEffect(() => {
        void getSellerConnectStatus()
            .then((s) => {
                setCanList(s.canList);
                setConnectConfigured(s.configured);
            })
            .catch(() => setCanList(true));
    }, []);

    useEffect(() => {
        if (typeof askPrice !== 'number' || askPrice <= 0) {
            setPayoutNet(null);
            setSellerFee(null);
            return;
        }
        const handle = window.setTimeout(() => {
            void getSellerPayoutPreview(askPrice)
                .then((p) => {
                    setPayoutNet(p.netPayout);
                    setSellerFee(p.platformFee);
                })
                .catch(() => {
                    setPayoutNet(null);
                    setSellerFee(null);
                });
        }, 250);
        return () => window.clearTimeout(handle);
    }, [askPrice]);

    const estimatedFee =
        selectedTicket && typeof askPrice === 'number' && askPrice > 0
            ? Math.round(askPrice * 0.1 * 100) / 100
            : null;

    const handleSubmit = async () => {
        if (!selectedTicket) {
            notify.warning('No ticket selected', 'Please select a ticket to list.');
            return;
        }
        if (typeof askPrice !== 'number' || askPrice <= 0) {
            notify.warning('Invalid price', 'Please enter a valid asking price.');
            return;
        }

        setSubmitError(null);
        setSubmitting(true);
        try {
            await createListing({ ticketId: selectedTicket.id, askPrice });
            notify.success('Ticket listed!', 'Your ticket is now live on the marketplace.');
            navigateWithTransition('/marketplace/my-listings');
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (e as Error)?.message ||
                'Failed to create listing.';
            setSubmitError(msg);
            notify.error('Listing failed', msg, { autoClose: 8000 });
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);

    return (
        <Box
            style={{
                backgroundColor: 'var(--modern-bg-primary)',
                minHeight: '100vh',
                padding: '2rem 0',
            }}
        >
            <Container size="sm">
                <Group gap="sm" mb="lg">
                    <ModernButton
                        variant="secondary"
                        onClick={() => navigateWithTransition('/marketplace')}
                        style={{ padding: '0.4rem 0.8rem' }}
                    >
                        <IconArrowLeft size={16} />
                    </ModernButton>
                    <Group gap="sm" align="center">
                        <IconTag size={28} color="var(--modern-lime)" />
                        <ModernH1>List a Ticket</ModernH1>
                    </Group>
                </Group>

                <ModernBody
                    style={{
                        color: 'var(--modern-text-secondary)',
                        marginBottom: '2rem',
                    }}
                >
                    Select one of your tickets and set an asking price. The ticket will be held by
                    the platform until sold or you cancel the listing.
                </ModernBody>

                {connectConfigured && !canList && (
                    <Alert
                        icon={<IconInfoCircle size={18} />}
                        mb="xl"
                        color="yellow"
                        title="Stripe Connect required"
                    >
                        Finish seller onboarding before listing.{' '}
                        <Text
                            component="span"
                            style={{ color: 'var(--modern-lime)', cursor: 'pointer' }}
                            onClick={() => navigateWithTransition('/seller/onboarding')}
                        >
                            Open payout setup
                        </Text>
                    </Alert>
                )}

                <Alert
                    icon={<IconInfoCircle size={18} />}
                    mb="xl"
                    style={{
                        backgroundColor: 'rgba(0, 255, 136, 0.08)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        color: 'var(--modern-text-primary)',
                    }}
                >
                    Buyers pay a platform service fee on top of your asking price. After the sale,
                    funds stay in escrow until the buyer confirms they received the ticket. A seller
                    fee is then deducted from your payout.
                </Alert>

                {/* Step 1: Select ticket */}
                <Paper
                    p="lg"
                    radius="md"
                    mb="lg"
                    style={{
                        backgroundColor: 'var(--modern-card-bg)',
                        border: '1px solid var(--modern-border-color)',
                    }}
                >
                    <ModernH3 style={{ marginBottom: '1rem', color: 'var(--modern-text-primary)' }}>
                        1. Select a ticket
                    </ModernH3>

                    {loadingTickets ? (
                        <Center py="md">
                            <Loader color="var(--modern-lime)" size="sm" />
                        </Center>
                    ) : myTickets.length === 0 ? (
                        <Text c="dimmed" size="sm">
                            You don't have any tickets available to list. Purchase tickets from the{' '}
                            <Text
                                component="span"
                                style={{ color: 'var(--modern-lime)', cursor: 'pointer' }}
                                onClick={() => navigateWithTransition('/tickets')}
                            >
                                tickets page
                            </Text>
                            .
                        </Text>
                    ) : (
                        <Stack gap="sm">
                            {myTickets.map((ticket) => (
                                <Paper
                                    key={ticket.id}
                                    p="sm"
                                    radius="sm"
                                    withBorder
                                    onClick={() => setSelectedTicket(ticket)}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor:
                                            selectedTicket?.id === ticket.id
                                                ? 'rgba(0, 255, 136, 0.1)'
                                                : 'transparent',
                                        border:
                                            selectedTicket?.id === ticket.id
                                                ? '1px solid var(--modern-lime)'
                                                : '1px solid var(--modern-border-color)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <IconTicket
                                                size={18}
                                                color={
                                                    selectedTicket?.id === ticket.id
                                                        ? 'var(--modern-lime)'
                                                        : 'var(--modern-text-secondary)'
                                                }
                                            />
                                            <Stack gap={2}>
                                                <Text
                                                    size="sm"
                                                    fw={600}
                                                    lineClamp={2}
                                                    style={{ color: 'var(--modern-text-primary)' }}
                                                >
                                                    {ticket.fixtureLabel}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {ticket.category}
                                                    {ticket.fixtureDate && (
                                                        <>
                                                            {' '}
                                                            ·{' '}
                                                            {new Date(
                                                                ticket.fixtureDate,
                                                            ).toLocaleString('en-GB', {
                                                                weekday: 'short',
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </>
                                                    )}
                                                    {' · '}Ticket #{ticket.id}
                                                </Text>
                                            </Stack>
                                        </Group>
                                        <Text
                                            size="sm"
                                            fw={600}
                                            style={{ color: 'var(--modern-lime)' }}
                                        >
                                            Paid {formatPrice(ticket.price)}
                                        </Text>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Paper>

                {/* Step 2: Set asking price */}
                <Paper
                    p="lg"
                    radius="md"
                    mb="lg"
                    style={{
                        backgroundColor: 'var(--modern-card-bg)',
                        border: '1px solid var(--modern-border-color)',
                        opacity: selectedTicket ? 1 : 0.5,
                        pointerEvents: selectedTicket ? 'auto' : 'none',
                    }}
                >
                    <ModernH3 style={{ marginBottom: '1rem', color: 'var(--modern-text-primary)' }}>
                        2. Set your asking price
                    </ModernH3>

                    <NumberInput
                        label="Your asking price (£)"
                        placeholder="e.g. 150.00"
                        value={askPrice}
                        onChange={setAskPrice}
                        min={0.01}
                        step={5}
                        decimalScale={2}
                        fixedDecimalScale
                        styles={{
                            label: {
                                color: 'var(--modern-text-secondary)',
                                marginBottom: '0.4rem',
                            },
                            input: {
                                backgroundColor: 'var(--modern-bg-primary)',
                                color: 'var(--modern-text-primary)',
                                border: '1px solid var(--modern-border-color)',
                                fontSize: '1.1rem',
                            },
                        }}
                    />

                    {estimatedFee != null && (
                        <Paper
                            p="md"
                            radius="sm"
                            mt="md"
                            style={{
                                backgroundColor: 'rgba(0, 255, 136, 0.05)',
                                border: '1px solid rgba(0, 255, 136, 0.2)',
                            }}
                        >
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">
                                        Your asking price
                                    </Text>
                                    <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                        {formatPrice(askPrice as number)}
                                    </Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">
                                        Seller fee (deducted on payout)
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {sellerFee != null ? formatPrice(sellerFee) : `~${formatPrice(estimatedFee)}`}
                                    </Text>
                                </Group>
                                <Divider
                                    style={{ borderColor: 'rgba(0, 255, 136, 0.2)' }}
                                    my="xs"
                                />
                                <Group justify="space-between">
                                    <Text size="sm" fw={600} style={{ color: 'var(--modern-lime)' }}>
                                        You receive after confirmation
                                    </Text>
                                    <Text size="sm" fw={700} style={{ color: 'var(--modern-lime)' }}>
                                        {formatPrice(payoutNet ?? (askPrice as number) - estimatedFee)}
                                    </Text>
                                </Group>
                            </Stack>
                        </Paper>
                    )}
                </Paper>

                {submitError && (
                    <Alert
                        color="red"
                        title="Could not list ticket"
                        mb="sm"
                        withCloseButton
                        onClose={() => setSubmitError(null)}
                        styles={{
                            root: {
                                backgroundColor: 'rgba(255, 80, 80, 0.1)',
                                border: '1px solid rgba(255, 80, 80, 0.4)',
                            },
                            title: { color: '#ff6b6b', fontWeight: 700 },
                            message: { color: 'var(--modern-text-primary)' },
                        }}
                    >
                        {submitError}
                    </Alert>
                )}

                <Group gap="sm">
                    <ModernButton
                        variant="primary"
                        onClick={() => void handleSubmit()}
                        disabled={
                            !selectedTicket ||
                            typeof askPrice !== 'number' ||
                            askPrice <= 0 ||
                            submitting ||
                            (connectConfigured && !canList)
                        }
                        style={{ flex: 1 }}
                    >
                        {submitting ? <Loader size="xs" color="white" /> : 'List Ticket for Sale'}
                    </ModernButton>
                    <ModernButton
                        variant="secondary"
                        onClick={() => navigateWithTransition('/marketplace')}
                    >
                        Cancel
                    </ModernButton>
                </Group>
            </Container>
        </Box>
    );
}
