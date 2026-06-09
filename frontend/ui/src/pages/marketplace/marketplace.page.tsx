import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Grid,
    Group,
    Badge,
    Paper,
    Stack,
    Text,
    TextInput,
    NumberInput,
    Loader,
    Center,
} from '@mantine/core';
import {
    IconMapPin,
    IconSearch,
    IconShoppingBag,
    IconTicket,
} from '@tabler/icons-react';
import { notify } from '../../shared/notify';
import { usePageTransition } from '../../hooks/usePageTransition';
import { formatLocaleDateTime, useTranslation } from '../../i18n';
import { ModernH1, ModernH3, ModernBody, ModernButton, ModernCard } from '../../components/modern';
import {
    getActiveListings,
    type MarketplaceListing,
    type ListingsResponse,
} from '../../shared/api/marketplace.api';

function listingStatusLabel(status: MarketplaceListing['status'], t: (key: string) => string): string {
    switch (status) {
        case 'ACTIVE':
            return t('marketplace.statusActive');
        case 'SOLD':
            return t('marketplace.statusSold');
        case 'EXPIRED':
            return t('marketplace.statusExpired');
        default:
            return status;
    }
}

export function MarketplacePage() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const [data, setData] = useState<ListingsResponse>({ listings: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [maxPrice, setMaxPrice] = useState<number | string>('');
    const [teamQuery, setTeamQuery] = useState('');
    const [page, setPage] = useState(1);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const team = teamQuery.trim();
            const result = await getActiveListings({
                maxPrice: typeof maxPrice === 'number' ? maxPrice : undefined,
                team: team.length > 0 ? team : undefined,
                page,
            });
            setData({
                listings: Array.isArray(result?.listings) ? result.listings : [],
                total: typeof result?.total === 'number' ? result.total : 0,
            });
        } catch {
            notify.error(t('marketplace.loadFailedTitle'), t('marketplace.loadFailedMessage'));
        } finally {
            setLoading(false);
        }
    }, [maxPrice, page, teamQuery, t]);

    useEffect(() => {
        void fetchListings();
    }, [fetchListings]);

    const handleFilter = () => {
        setPage(1);
        void fetchListings();
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);

    const getStatusColor = (status: MarketplaceListing['status']) => {
        switch (status) {
            case 'ACTIVE':
                return 'var(--modern-lime)';
            case 'SOLD':
                return '#888';
            case 'EXPIRED':
                return '#ff6b6b';
            default:
                return '#888';
        }
    };

    return (
        <Box
            style={{
                backgroundColor: 'var(--modern-bg-primary)',
                minHeight: '100vh',
                padding: '2rem 0',
            }}
        >
            <Container size="lg">
                <Group justify="space-between" mb="lg" align="flex-start" wrap="wrap" gap="md">
                    <Group gap="md" align="center">
                        <IconShoppingBag size={32} color="var(--modern-lime)" />
                        <ModernH1 style={{ margin: 0 }}>{t('marketplace.title')}</ModernH1>
                    </Group>
                    <Group gap="sm">
                        <ModernButton
                            variant="secondary"
                            onClick={() => navigateWithTransition('/marketplace/my-listings')}
                        >
                            {t('marketplace.myListings')}
                        </ModernButton>
                        <ModernButton
                            variant="primary"
                            onClick={() => navigateWithTransition('/marketplace/sell')}
                        >
                            {t('marketplace.sellTicket')}
                        </ModernButton>
                    </Group>
                </Group>

                <ModernBody
                    style={{
                        color: 'var(--modern-text-secondary)',
                        marginBottom: '2rem',
                        fontSize: '1.1rem',
                    }}
                >
                    {t('marketplace.description')}
                </ModernBody>

                {/* Filters */}
                <Paper
                    p="md"
                    radius="md"
                    mb="xl"
                    style={{
                        backgroundColor: 'var(--modern-card-bg)',
                        border: '1px solid var(--modern-border-color)',
                    }}
                >
                    <Group align="flex-end" gap="md" wrap="wrap">
                        <TextInput
                            label={t('marketplace.teamLabel')}
                            placeholder={t('marketplace.teamPlaceholder')}
                            value={teamQuery}
                            onChange={(e) => setTeamQuery(e.currentTarget.value)}
                            leftSection={<IconSearch size={16} />}
                            styles={{
                                label: { color: 'var(--modern-text-secondary)', fontSize: '0.85rem' },
                                input: {
                                    backgroundColor: 'var(--modern-bg-primary)',
                                    color: 'var(--modern-text-primary)',
                                    border: '1px solid var(--modern-border-color)',
                                    minWidth: 'min(280px, 100vw)',
                                },
                            }}
                        />
                        <NumberInput
                            label={t('marketplace.maxPrice')}
                            placeholder={t('marketplace.noLimit')}
                            value={maxPrice}
                            onChange={setMaxPrice}
                            min={0}
                            step={10}
                            styles={{
                                label: { color: 'var(--modern-text-secondary)', fontSize: '0.85rem' },
                                input: {
                                    backgroundColor: 'var(--modern-bg-primary)',
                                    color: 'var(--modern-text-primary)',
                                    border: '1px solid var(--modern-border-color)',
                                },
                            }}
                        />
                        <ModernButton variant="primary" onClick={handleFilter}>
                            {t('marketplace.filter')}
                        </ModernButton>
                        {(maxPrice !== '' || teamQuery.trim() !== '') && (
                            <ModernButton
                                variant="secondary"
                                onClick={() => {
                                    setMaxPrice('');
                                    setTeamQuery('');
                                    setPage(1);
                                }}
                            >
                                {t('marketplace.clear')}
                            </ModernButton>
                        )}
                    </Group>
                </Paper>

                {/* Results header */}
                {!loading && (
                    <Group justify="space-between" mb="md">
                        <Text style={{ color: 'var(--modern-text-secondary)', fontSize: '0.9rem' }}>
                            {data.total === 1
                                ? t('marketplace.listingsAvailableSingular', { count: data.total })
                                : t('marketplace.listingsAvailablePlural', { count: data.total })}
                        </Text>
                    </Group>
                )}

                {/* Listings grid */}
                {loading ? (
                    <Center py="xl">
                        <Loader color="var(--modern-lime)" />
                    </Center>
                ) : (data.listings ?? []).length === 0 ? (
                    <ModernCard
                        style={{
                            backgroundColor: 'var(--modern-card-bg)',
                            textAlign: 'center',
                            padding: '3rem',
                            border: '1px solid var(--modern-border-color)',
                            borderRadius: '8px',
                            marginTop: '2rem',
                        }}
                    >
                        <IconShoppingBag
                            size={48}
                            color="var(--modern-text-secondary)"
                            style={{ margin: '0 auto 1rem' }}
                        />
                        <ModernH3 style={{ color: 'var(--modern-text-primary)', marginBottom: '0.5rem' }}>
                            {t('marketplace.emptyTitle')}
                        </ModernH3>
                        <ModernBody style={{ color: 'var(--modern-light-gray)' }}>
                            {t('marketplace.emptyMessage')}
                        </ModernBody>
                    </ModernCard>
                ) : (
                    <Grid gutter="md">
                        {(data.listings ?? []).map((listing) => (
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={listing.id}>
                                <Paper
                                    radius="md"
                                    p="md"
                                    withBorder
                                    style={{
                                        backgroundColor: 'var(--modern-card-bg)',
                                        border: '1px solid var(--modern-border-color)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 12px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    onClick={() =>
                                        navigateWithTransition(
                                            `/marketplace/buy/${listing.id}`,
                                        )
                                    }
                                >
                                    <Group justify="space-between" mb="xs">
                                        <Badge
                                            size="sm"
                                            style={{
                                                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                                                color: getStatusColor(listing.status),
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {listingStatusLabel(listing.status, t)}
                                        </Badge>
                                        <Text size="xs" c="dimmed">
                                            #{listing.id}
                                        </Text>
                                    </Group>

                                    <Stack gap="xs" mb="md">
                                        <Group gap="xs" align="flex-start" wrap="nowrap">
                                            <IconTicket
                                                size={16}
                                                color="var(--modern-lime)"
                                                style={{ marginTop: 2 }}
                                            />
                                            <Stack gap={4}>
                                                <Text
                                                    size="sm"
                                                    fw={600}
                                                    lineClamp={2}
                                                    style={{ color: 'var(--modern-text-primary)' }}
                                                >
                                                    {listing.ticket?.fixtureLabel ??
                                                        t('marketplace.fixtureFallback', {
                                                            id: listing.ticket?.fixtureId ?? '—',
                                                        })}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {listing.ticket?.category ?? t('marketplace.generalAdmission')}
                                                </Text>
                                                {listing.ticket?.stadiumName ? (
                                                    <Group gap={4} wrap="nowrap" align="flex-start">
                                                        <IconMapPin
                                                            size={12}
                                                            color="var(--modern-text-secondary)"
                                                            style={{ marginTop: 2, flexShrink: 0 }}
                                                        />
                                                        <Text size="xs" c="dimmed" lineClamp={2}>
                                                            {listing.ticket.stadiumName}
                                                        </Text>
                                                    </Group>
                                                ) : null}
                                            </Stack>
                                        </Group>
                                        <Text size="xs" c="dimmed">
                                            {t('marketplace.expires')}{' '}
                                            {formatLocaleDateTime(listing.expiresAt)}
                                        </Text>
                                    </Stack>

                                    <Group
                                        justify="space-between"
                                        p="xs"
                                        style={{
                                            backgroundColor: 'rgba(0, 255, 136, 0.05)',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(0, 255, 136, 0.2)',
                                            marginBottom: '0.75rem',
                                        }}
                                    >
                                        <Stack gap={2}>
                                            <Text size="xs" c="dimmed">
                                                {t('marketplace.sellerAsking')}
                                            </Text>
                                            <Text
                                                size="sm"
                                                fw={700}
                                                style={{ color: 'var(--modern-lime)' }}
                                            >
                                                {formatPrice(listing.askPrice)}
                                            </Text>
                                        </Stack>
                                        <Text size="xs" c="dimmed">
                                            {t('marketplace.platformFee')}
                                        </Text>
                                    </Group>

                                    <ModernButton
                                        variant="primary"
                                        fullWidth
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateWithTransition(
                                                `/marketplace/buy/${listing.id}`,
                                            );
                                        }}
                                    >
                                        {t('marketplace.viewAndBuy')}
                                    </ModernButton>
                                </Paper>
                            </Grid.Col>
                        ))}
                    </Grid>
                )}

                {/* Pagination */}
                {data.total > 20 && (
                    <Group justify="center" mt="xl" gap="sm">
                        <ModernButton
                            variant="secondary"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            {t('marketplace.previous')}
                        </ModernButton>
                        <Text style={{ color: 'var(--modern-text-secondary)', alignSelf: 'center' }}>
                            {t('marketplace.page', { page })}
                        </Text>
                        <ModernButton
                            variant="secondary"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={(data.listings ?? []).length < 20}
                        >
                            {t('marketplace.next')}
                        </ModernButton>
                    </Group>
                )}
            </Container>
        </Box>
    );
}
