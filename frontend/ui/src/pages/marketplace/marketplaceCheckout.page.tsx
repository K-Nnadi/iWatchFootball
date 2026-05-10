import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Stack,
    Text,
    Group,
    Divider,
    Loader,
    Center,
} from '@mantine/core';
import {
    IconShoppingBag,
    IconCurrencyPound,
    IconTicket,
    IconArrowLeft,
    IconTag,
    IconAlertCircle,
    IconShoppingCart,
    IconMapPin,
} from '@tabler/icons-react';
import { notify } from '../../shared/notify';
import { useParams } from 'react-router-dom';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useAuthStore } from '../../shared/stores/auth.store';
import { useCartStore } from '../../shared/stores/cart.store';
import { ModernH1, ModernH3, ModernBody, ModernButton } from '../../components/modern';
import {
    getListing,
    getFeePreview,
    holdListing,
    cancelListing,
    type MarketplaceListing,
    type FeePreview,
} from '../../shared/api/marketplace.api';

export function MarketplaceCheckoutPage() {
    const { id } = useParams<{ id: string }>();
    const listingId = parseInt(id ?? '0', 10);
    const { navigateWithTransition } = usePageTransition();
    const { user } = useAuthStore();
    const { addItem } = useCartStore();

    const [listing, setListing] = useState<MarketplaceListing | null>(null);
    const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [holding, setHolding] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [holdMinutes, setHoldMinutes] = useState(10);

    const isOwner = listing != null && user != null && listing.sellerId === user.id;

    useEffect(() => {
        const init = async () => {
            try {
                const [listingData, feeData] = await Promise.all([
                    getListing(listingId),
                    getFeePreview(listingId),
                ]);

                const isSeller = user != null && listingData.sellerId === user.id;

                if (listingData.status !== 'ACTIVE' && !isSeller) {
                    const reason =
                        listingData.status === 'SOLD'
                            ? 'This ticket has already been sold.'
                            : 'This listing is no longer available.';
                    notify.error('Listing unavailable', reason);
                    navigateWithTransition('/marketplace');
                    return;
                }

                setListing(listingData);
                setFeePreview(feeData);
            } catch {
                notify.error('Listing not found', 'This listing is no longer available.');
                navigateWithTransition('/marketplace');
            } finally {
                setLoading(false);
            }
        };
        void init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listingId]);

    const handleReserveAndCheckout = async () => {
        if (!listing || !feePreview) return;
        setHolding(true);
        try {
            const { expiresAt, holderId, holdMinutes: mins } = await holdListing(listingId);
            setHoldMinutes(mins);

            addItem({
                matchId: `marketplace-${listing.id}`,
                homeTeam: 'Resale listing',
                awayTeam: '',
                fixtureLabel:
                    listing.ticket?.fixtureLabel ?? `Listing #${listing.id}`,
                date:
                    listing.ticket?.fixtureDate ??
                    new Date(listing.expiresAt).toISOString(),
                venue: '',
                price: feePreview.totalBuyerPays,
                category: listing.ticket?.category ?? 'General Admission',
                quantity: 1,
                holdExpiresAt: expiresAt,
                listingId: listing.id,
                marketplaceHolderId: holderId,
            });

            notify.success('Listing reserved', `Your hold is active for ${mins} minute${mins !== 1 ? 's' : ''}. Complete checkout before it expires.`);

            navigateWithTransition('/checkout');
        } catch (e: unknown) {
            const status = (e as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
                notify.warning('Listing currently reserved', 'Another customer is holding this listing right now. Please try again in a few minutes.');
            } else {
                const msg =
                    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    'Could not reserve this listing. Please try again.';
                notify.error('Reservation failed', msg);
            }
        } finally {
            setHolding(false);
        }
    };

    const handleCancelListing = async () => {
        if (!listing) return;
        setCancelling(true);
        try {
            await cancelListing(listing.id);
            notify.success('Listing cancelled', 'Your ticket has been returned to your account.');
            navigateWithTransition('/marketplace/my-listings');
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to cancel listing.';
            notify.error('Cancellation failed', msg);
        } finally {
            setCancelling(false);
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);

    if (loading) {
        return (
            <Center style={{ minHeight: '100vh', backgroundColor: 'var(--modern-bg-primary)' }}>
                <Loader color="var(--modern-lime)" />
            </Center>
        );
    }

    if (!listing || !feePreview) return null;

    return (
        <Box style={{ backgroundColor: 'var(--modern-bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
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
                        <IconShoppingBag size={28} color="var(--modern-lime)" />
                        <ModernH1>Buy Ticket</ModernH1>
                    </Group>
                </Group>

                {/* Ticket details */}
                <Paper
                    p="lg"
                    radius="md"
                    mb="lg"
                    style={{
                        backgroundColor: 'var(--modern-card-bg)',
                        border: '1px solid var(--modern-border-color)',
                    }}
                >
                    <Group gap="sm" mb="md">
                        <IconTicket size={20} color="var(--modern-lime)" />
                        <ModernH3 style={{ color: 'var(--modern-text-primary)', margin: 0 }}>
                            Ticket Details
                        </ModernH3>
                    </Group>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">Category</Text>
                            <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                {listing.ticket?.category ?? 'General Admission'}
                            </Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">Fixture</Text>
                            <Text size="sm" ta="right" maw="70%" style={{ color: 'var(--modern-text-primary)' }}>
                                {listing.ticket?.fixtureLabel ??
                                    (listing.ticket?.fixtureId != null
                                        ? `#${listing.ticket.fixtureId}`
                                        : '—')}
                            </Text>
                        </Group>
                        <Group justify="space-between" wrap="nowrap" align="flex-start">
                            <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
                                <IconMapPin size={16} style={{ opacity: 0.75, marginTop: 2 }} />
                                <Text size="sm" c="dimmed">Stadium</Text>
                            </Group>
                            <Text size="sm" ta="right" maw="70%" style={{ color: 'var(--modern-text-primary)' }}>
                                {listing.ticket?.stadiumName?.trim() ?? '—'}
                            </Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">Listing ID</Text>
                            <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                #{listing.id}
                            </Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">Listing expires</Text>
                            <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                {new Date(listing.expiresAt).toLocaleString('en-GB', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </Group>
                    </Stack>
                </Paper>

                {/* Price breakdown */}
                <Paper
                    p="lg"
                    radius="md"
                    mb="lg"
                    style={{
                        backgroundColor: 'rgba(0, 255, 136, 0.05)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}
                >
                    <Group gap="xs" mb="md">
                        <IconCurrencyPound size={20} color="var(--modern-lime)" />
                        <ModernH3 style={{ color: 'var(--modern-text-primary)', margin: 0 }}>
                            Price Breakdown
                        </ModernH3>
                    </Group>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">Seller asking price</Text>
                            <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                {formatPrice(feePreview.askPrice)}
                            </Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                                Platform service fee ({Math.round(feePreview.adminFeeRate * 100)}%)
                            </Text>
                            <Text size="sm" c="dimmed">{formatPrice(feePreview.adminFee)}</Text>
                        </Group>
                        <Divider style={{ borderColor: 'rgba(0, 255, 136, 0.2)' }} my="xs" />
                        <Group justify="space-between">
                            <Text size="sm" fw={700} style={{ color: 'var(--modern-lime)' }}>
                                Total you pay
                            </Text>
                            <Text size="lg" fw={700} style={{ color: 'var(--modern-lime)' }}>
                                {formatPrice(feePreview.totalBuyerPays)}
                            </Text>
                        </Group>
                    </Stack>
                </Paper>

                {isOwner ? (
                    /* ── Seller view ── */
                    <Stack gap="sm">
                        <Paper
                            p="md"
                            radius="md"
                            style={{
                                backgroundColor: 'rgba(0, 170, 255, 0.08)',
                                border: '1px solid rgba(0, 170, 255, 0.3)',
                            }}
                        >
                            <Group gap="sm">
                                <IconTag size={20} color="#00aaff" />
                                <Stack gap={2}>
                                    <Text size="sm" fw={600} style={{ color: '#00aaff' }}>
                                        This is your listing
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        You listed this ticket for {formatPrice(feePreview.askPrice)}.
                                        Buyers pay an additional{' '}
                                        {Math.round(feePreview.adminFeeRate * 100)}% platform fee.
                                    </Text>
                                </Stack>
                            </Group>
                        </Paper>

                        {listing.status === 'ACTIVE' && (
                            <Paper
                                p="md"
                                radius="md"
                                mb="xs"
                                style={{
                                    backgroundColor: 'rgba(255, 107, 107, 0.08)',
                                    border: '1px solid rgba(255, 107, 107, 0.3)',
                                }}
                            >
                                <Group gap="sm">
                                    <IconAlertCircle size={18} color="#ff6b6b" />
                                    <Text size="xs" c="dimmed">
                                        Cancelling will return the ticket to your account and remove it
                                        from the marketplace.
                                    </Text>
                                </Group>
                            </Paper>
                        )}

                        <Group gap="sm">
                            <ModernButton
                                variant="primary"
                                style={{ flex: 1 }}
                                onClick={() => navigateWithTransition('/marketplace/my-listings')}
                            >
                                View My Listings
                            </ModernButton>
                            {listing.status === 'ACTIVE' && (
                                <ModernButton
                                    variant="secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => void handleCancelListing()}
                                    disabled={cancelling}
                                >
                                    {cancelling ? <Loader size="xs" /> : 'Cancel Listing'}
                                </ModernButton>
                            )}
                        </Group>
                    </Stack>
                ) : (
                    /* ── Buyer view ── */
                    <Stack gap="sm">
                        <ModernButton
                            variant="primary"
                            fullWidth
                            onClick={() => void handleReserveAndCheckout()}
                            disabled={holding}
                        >
                            {holding ? (
                                <Loader size="xs" color="white" />
                            ) : (
                                <Group gap="xs">
                                    <IconShoppingCart size={18} />
                                    Reserve & Go to Checkout
                                </Group>
                            )}
                        </ModernButton>

                        <ModernBody
                            style={{
                                color: 'var(--modern-text-secondary)',
                                fontSize: '0.78rem',
                                textAlign: 'center',
                            }}
                        >
                            Reserving holds the listing for {holdMinutes} minute{holdMinutes !== 1 ? 's' : ''} while you complete checkout.
                            The platform service fee is non-refundable once the transaction is confirmed.
                        </ModernBody>
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
