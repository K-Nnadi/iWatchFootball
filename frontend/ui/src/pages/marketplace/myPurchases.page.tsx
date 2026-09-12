import { useCallback, useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Center,
    Container,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {
    IconShoppingBag,
    IconCheck,
    IconClock,
    IconAlertTriangle,
    IconX,
} from '@tabler/icons-react';
import { notify } from '../../shared/notify';
import { usePageTransition } from '../../hooks/usePageTransition';
import axios from 'axios';
import type { MarketplaceListing } from '../../shared/api/marketplace.api';
import { getListingEscrow, refundMarketplaceEscrow, type EscrowHoldView } from '../../shared/api/marketplace.api';
import { RatingsPanel } from './RatingsPanel';

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'gray',
    PENDING_REVIEW: 'yellow',
    ACTIVE: 'green',
    SOLD: 'blue',
    CANCELLED: 'gray',
    EXPIRED: 'red',
    REJECTED: 'red',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    SOLD: <IconClock size={14} />,
    ACTIVE: <IconCheck size={14} />,
    CANCELLED: <IconX size={14} />,
    EXPIRED: <IconX size={14} />,
    REJECTED: <IconAlertTriangle size={14} />,
};

async function getMyPurchases(): Promise<MarketplaceListing[]> {
    const { data } = await axios.get<MarketplaceListing[]>('/marketplace/listings/my-purchases');
    return data;
}

async function confirmReceipt(listingId: number): Promise<void> {
    await axios.post(`/marketplace/listings/${listingId}/confirm-receipt`);
}

async function raiseDispute(listingId: number, reason: string, details: string): Promise<void> {
    await axios.post(`/marketplace/listings/${listingId}/dispute`, { reason, details });
}

export function MyPurchasesPage() {
    const { navigateWithTransition } = usePageTransition();
    const [purchases, setPurchases] = useState<MarketplaceListing[]>([]);
    const [escrowByListing, setEscrowByListing] = useState<Record<number, EscrowHoldView | null>>({});
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    const fetchPurchases = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyPurchases();
            setPurchases(data);
            const escrowEntries: Record<number, EscrowHoldView | null> = {};
            await Promise.all(
                data.map(async (listing) => {
                    try {
                        escrowEntries[listing.id] = await getListingEscrow(listing.id);
                    } catch {
                        escrowEntries[listing.id] = null;
                    }
                }),
            );
            setEscrowByListing(escrowEntries);
        } catch {
            notify.error('Could not load purchases', 'Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchPurchases();
    }, [fetchPurchases]);

    const handleConfirmReceipt = async (id: number) => {
        setConfirmingId(id);
        try {
            await confirmReceipt(id);
            notify.success('Receipt confirmed', 'Thank you for confirming. The seller will receive their payout.');
            void fetchPurchases();
        } catch {
            notify.error('Could not confirm', 'Please try again.');
        } finally {
            setConfirmingId(null);
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);

    const renderCard = (listing: MarketplaceListing) => {
        const status = listing.status as string;
        const transferInitiated = !!listing.transferInitiatedAt;
        const receiptConfirmed = !!listing.receiptConfirmedAt;
        const escrow = escrowByListing[listing.id];

        return (
            <Paper key={listing.id} p="md" radius="md" withBorder>
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={4} style={{ flex: 1 }}>
                        <Group gap="xs">
                            <Text size="sm" fw={600}>
                                {listing.ticket?.fixtureLabel ?? listing.ticket?.category ?? `Ticket #${listing.ticketId}`}
                            </Text>
                            <Badge size="xs" color={STATUS_COLORS[status] ?? 'gray'} leftSection={STATUS_ICONS[status]}>
                                {status}
                            </Badge>
                        </Group>

                        <Group gap="xs" wrap="wrap">
                            <Text size="xs" c="dimmed">Purchase #{listing.id}</Text>
                            {listing.ticket?.category && (
                                <Text size="xs" c="dimmed">· {listing.ticket.category}</Text>
                            )}
                        </Group>

                        <Text size="sm" fw={700} c="green">
                            {formatPrice(listing.askPrice)}
                        </Text>

                        {status === 'SOLD' && transferInitiated && !receiptConfirmed && (
                            <Text size="xs" c="yellow.5">
                                Seller has initiated the transfer — please check your club account and confirm receipt below.
                            </Text>
                        )}
                        {status === 'SOLD' && !transferInitiated && (
                            <Text size="xs" c="dimmed">
                                Awaiting seller to initiate the transfer.
                            </Text>
                        )}
                        {status === 'SOLD' && escrow?.status === 'HELD' && (
                            <Text size="xs" c="dimmed">
                                {formatPrice(Number(escrow.amount))} held in escrow until you confirm receipt.
                            </Text>
                        )}
                        {status === 'SOLD' && escrow?.status === 'RELEASED' && (
                            <Text size="xs" c="dimmed">Seller payout released.</Text>
                        )}
                        {status === 'SOLD' && escrow?.status === 'REFUNDED' && (
                            <Text size="xs" c="red">This sale was refunded.</Text>
                        )}
                        {receiptConfirmed && listing.sellerId != null && (
                            <RatingsPanel
                                listingId={listing.id}
                                targetUserId={listing.sellerId}
                                raterRole="BUYER"
                                enabled
                            />
                        )}
                    </Stack>

                    <Stack gap="xs" align="flex-end" style={{ flexShrink: 0 }}>
                        {status === 'SOLD' && transferInitiated && !receiptConfirmed && (
                            <Button
                                size="xs"
                                color="green"
                                loading={confirmingId === listing.id}
                                leftSection={<IconCheck size={13} />}
                                onClick={() => void handleConfirmReceipt(listing.id)}
                            >
                                Confirm receipt
                            </Button>
                        )}
                        {status === 'SOLD' && escrow?.status === 'HELD' && (
                            <Button
                                size="xs"
                                variant="light"
                                color="orange"
                                onClick={() => {
                                    if (!window.confirm('Request a refund of the held funds?')) return;
                                    void refundMarketplaceEscrow(escrow.marketplaceTransactionId)
                                        .then(() => {
                                            notify.success('Refund requested', 'Held funds are being returned.');
                                            void fetchPurchases();
                                        })
                                        .catch(() => notify.error('Refund failed', 'Please try again or raise a dispute.'));
                                }}
                            >
                                Request refund
                            </Button>
                        )}
                        {status === 'SOLD' && (
                            <Button
                                size="xs"
                                variant="subtle"
                                color="red"
                                leftSection={<IconAlertTriangle size={13} />}
                                onClick={() => {
                                    const reason = window.prompt('Brief reason for dispute:');
                                    if (!reason) return;
                                    void raiseDispute(listing.id, reason, reason).then(() => {
                                        notify.success('Dispute raised', 'An admin will review and get in touch.');
                                    });
                                }}
                            >
                                Dispute
                            </Button>
                        )}
                    </Stack>
                </Group>
            </Paper>
        );
    };

    const active = purchases.filter((p) => p.status === 'SOLD');
    const past = purchases.filter((p) => p.status !== 'SOLD');

    return (
        <Box style={{ backgroundColor: 'var(--modern-bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
            <Container size="md">
                <Group justify="space-between" mb="lg" align="center">
                    <Group gap="sm">
                        <IconShoppingBag size={28} color="var(--modern-lime)" />
                        <Title order={2} style={{ color: 'var(--modern-text-primary)' }}>My Purchases</Title>
                    </Group>
                    <Button variant="subtle" size="sm" onClick={() => navigateWithTransition('/marketplace')}>
                        Browse marketplace
                    </Button>
                </Group>

                {loading ? (
                    <Center py="xl"><Loader /></Center>
                ) : purchases.length === 0 ? (
                    <Paper p="xl" radius="md" withBorder ta="center">
                        <IconShoppingBag size={48} color="var(--mantine-color-dimmed)" style={{ margin: '0 auto 1rem' }} />
                        <Text fw={600} mb="xs">No purchases yet</Text>
                        <Text size="sm" c="dimmed" mb="md">Browse the marketplace to find tickets.</Text>
                        <Button variant="light" onClick={() => navigateWithTransition('/marketplace')}>
                            Browse tickets
                        </Button>
                    </Paper>
                ) : (
                    <Stack gap="lg">
                        {active.length > 0 && (
                            <Stack gap="xs">
                                <Text size="sm" fw={600} c="dimmed">IN PROGRESS ({active.length})</Text>
                                {active.map(renderCard)}
                            </Stack>
                        )}
                        {past.length > 0 && (
                            <Stack gap="xs">
                                <Text size="sm" fw={600} c="dimmed">PAST</Text>
                                {past.map(renderCard)}
                            </Stack>
                        )}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
