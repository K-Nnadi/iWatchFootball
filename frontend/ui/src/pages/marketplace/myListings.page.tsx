import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Paper,
    Stack,
    Text,
    Group,
    Badge,
    Loader,
    Center,
    Tabs,
} from '@mantine/core';
import { IconTag, IconCheck, IconX, IconClock } from '@tabler/icons-react';
import { notify } from '../../shared/notify';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useTranslation } from '../../i18n';
import { ModernH1, ModernBody, ModernButton, ModernCard } from '../../components/modern';
import {
    getMyListings,
    cancelListing,
    type MarketplaceListing,
} from '../../shared/api/marketplace.api';

const STATUS_COLORS: Record<MarketplaceListing['status'], string> = {
    ACTIVE: 'var(--modern-lime)',
    SOLD: '#00aaff',
    CANCELLED: '#888',
    EXPIRED: '#ff6b6b',
};

const STATUS_ICONS: Record<MarketplaceListing['status'], React.ReactNode> = {
    ACTIVE: <IconClock size={14} />,
    SOLD: <IconCheck size={14} />,
    CANCELLED: <IconX size={14} />,
    EXPIRED: <IconX size={14} />,
};

function listingStatusLabel(status: MarketplaceListing['status'], t: (key: string) => string): string {
    switch (status) {
        case 'ACTIVE':
            return t('marketplace.statusActive');
        case 'SOLD':
            return t('marketplace.statusSold');
        case 'EXPIRED':
            return t('marketplace.statusExpired');
        case 'CANCELLED':
            return t('marketplace.statusCancelled');
        default:
            return status;
    }
}

export function MyListingsPage() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<string>('active');

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyListings();
            setListings(data);
        } catch {
            notify.error(t('marketplace.myListingsLoadFailedTitle'), t('marketplace.myListingsLoadFailedMessage'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void fetchListings();
    }, [fetchListings]);

    const handleCancel = async (listingId: number) => {
        setCancellingId(listingId);
        try {
            await cancelListing(listingId);
            notify.success(t('marketplace.listingCancelledTitle'), t('marketplace.listingCancelledMessage'));
            setListings((prev) =>
                prev.map((l) =>
                    l.id === listingId ? { ...l, status: 'CANCELLED' as const } : l,
                ),
            );
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                t('marketplace.cancellationFailedMessage');
            notify.error(t('marketplace.cancellationFailedTitle'), msg);
        } finally {
            setCancellingId(null);
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);

    const active = listings.filter((l) => l.status === 'ACTIVE');
    const sold = listings.filter((l) => l.status === 'SOLD');
    const past = listings.filter((l) => l.status === 'CANCELLED' || l.status === 'EXPIRED');

    const renderListingCard = (listing: MarketplaceListing) => (
        <Paper
            key={listing.id}
            p="md"
            radius="md"
            withBorder
            style={{
                backgroundColor: 'var(--modern-card-bg)',
                border: '1px solid var(--modern-border-color)',
            }}
        >
            <Group justify="space-between" mb="sm">
                <Group gap="xs">
                    <Badge
                        size="sm"
                        leftSection={STATUS_ICONS[listing.status]}
                        style={{
                            backgroundColor: `${STATUS_COLORS[listing.status]}20`,
                            color: STATUS_COLORS[listing.status],
                            fontWeight: 600,
                        }}
                    >
                        {listingStatusLabel(listing.status, t)}
                    </Badge>
                    <Text size="xs" c="dimmed">
                        #{listing.id}
                    </Text>
                </Group>
                <Text size="xs" c="dimmed">
                    {t('marketplace.listedOn', {
                        date: new Date(listing.createdAt).toLocaleDateString(),
                    })}
                </Text>
            </Group>

            <Group justify="space-between" mb="sm">
                <Stack gap={2}>
                    <Text size="sm" fw={500} style={{ color: 'var(--modern-text-primary)' }} lineClamp={2}>
                        {listing.ticket?.fixtureLabel ?? listing.ticket?.category ?? t('marketplace.ticketFallback')}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {listing.ticket?.category ?? t('marketplace.generalAdmission')}
                        {listing.ticket?.fixtureId != null &&
                            listing.ticket?.fixtureLabel == null &&
                            ` · ${t('marketplace.fixtureFallback', { id: listing.ticket.fixtureId })}`}
                        {listing.ticket?.stadiumName ? ` · ${listing.ticket.stadiumName}` : ''}
                        {' · '}
                        Ticket #{listing.ticketId}
                    </Text>
                </Stack>
                <Stack gap={2} align="flex-end">
                    <Text size="xs" c="dimmed">
                        {t('marketplace.asking')}
                    </Text>
                    <Text size="sm" fw={700} style={{ color: 'var(--modern-lime)' }}>
                        {formatPrice(listing.askPrice)}
                    </Text>
                </Stack>
            </Group>

            {listing.status === 'ACTIVE' && (
                <Group gap="sm">
                    <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                        {t('marketplace.expires')}{' '}
                        {new Date(listing.expiresAt).toLocaleString('en-GB', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                    <ModernButton
                        variant="secondary"
                        onClick={() => void handleCancel(listing.id)}
                        disabled={cancellingId === listing.id}
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.82rem' }}
                    >
                        {cancellingId === listing.id ? (
                            <Loader size="xs" />
                        ) : (
                            t('marketplace.cancelListing')
                        )}
                    </ModernButton>
                </Group>
            )}
        </Paper>
    );

    return (
        <Box
            style={{
                backgroundColor: 'var(--modern-bg-primary)',
                minHeight: '100vh',
                padding: '2rem 0',
            }}
        >
            <Container size="md">
                <Group justify="space-between" mb="lg" align="center">
                    <Group gap="sm" align="center">
                        <IconTag size={28} color="var(--modern-lime)" />
                        <ModernH1>{t('marketplace.myListings')}</ModernH1>
                    </Group>
                    <ModernButton
                        variant="primary"
                        onClick={() => navigateWithTransition('/marketplace/sell')}
                    >
                        {t('marketplace.newListing')}
                    </ModernButton>
                </Group>

                <ModernBody
                    style={{ color: 'var(--modern-text-secondary)', marginBottom: '1.5rem' }}
                >
                    {t('marketplace.myListingsDescription')}
                </ModernBody>

                {loading ? (
                    <Center py="xl">
                        <Loader color="var(--modern-lime)" />
                    </Center>
                ) : listings.length === 0 ? (
                    <ModernCard
                        style={{
                            backgroundColor: 'var(--modern-card-bg)',
                            textAlign: 'center',
                            padding: '3rem',
                            border: '1px solid var(--modern-border-color)',
                            borderRadius: '8px',
                        }}
                    >
                        <IconTag
                            size={48}
                            color="var(--modern-text-secondary)"
                            style={{ margin: '0 auto 1rem' }}
                        />
                        <Text fw={600} mb="xs" style={{ color: 'var(--modern-text-primary)' }}>
                            {t('marketplace.myListingsEmptyTitle')}
                        </Text>
                        <ModernBody style={{ color: 'var(--modern-light-gray)' }}>
                            {t('marketplace.myListingsEmptyMessage')}
                        </ModernBody>
                        <ModernButton
                            variant="primary"
                            mt="md"
                            onClick={() => navigateWithTransition('/marketplace/sell')}
                        >
                            {t('marketplace.listTicket')}
                        </ModernButton>
                    </ModernCard>
                ) : (
                    <Tabs
                        value={activeTab}
                        onChange={(v) => v && setActiveTab(v)}
                        styles={{
                            tab: { color: 'var(--modern-text-secondary)' },
                            panel: { paddingTop: '1rem' },
                        }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value="active">
                                {t('marketplace.tabActive')}{' '}
                                {active.length > 0 && (
                                    <Badge
                                        size="xs"
                                        ml="xs"
                                        style={{
                                            backgroundColor: 'var(--modern-lime)',
                                            color: 'var(--modern-bg-primary)',
                                        }}
                                    >
                                        {active.length}
                                    </Badge>
                                )}
                            </Tabs.Tab>
                            <Tabs.Tab value="sold">
                                {t('marketplace.tabSold')}{' '}
                                {sold.length > 0 && (
                                    <Badge size="xs" ml="xs" color="blue">
                                        {sold.length}
                                    </Badge>
                                )}
                            </Tabs.Tab>
                            <Tabs.Tab value="past">{t('marketplace.tabPast')}</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="active">
                            {active.length === 0 ? (
                                <Text c="dimmed" ta="center" py="xl">
                                    {t('marketplace.noActiveListings')}
                                </Text>
                            ) : (
                                <Stack gap="sm">{active.map(renderListingCard)}</Stack>
                            )}
                        </Tabs.Panel>

                        <Tabs.Panel value="sold">
                            {sold.length === 0 ? (
                                <Text c="dimmed" ta="center" py="xl">
                                    {t('marketplace.noSoldListings')}
                                </Text>
                            ) : (
                                <Stack gap="sm">{sold.map(renderListingCard)}</Stack>
                            )}
                        </Tabs.Panel>

                        <Tabs.Panel value="past">
                            {past.length === 0 ? (
                                <Text c="dimmed" ta="center" py="xl">
                                    {t('marketplace.noPastListings')}
                                </Text>
                            ) : (
                                <Stack gap="sm">{past.map(renderListingCard)}</Stack>
                            )}
                        </Tabs.Panel>
                    </Tabs>
                )}
            </Container>
        </Box>
    );
}
