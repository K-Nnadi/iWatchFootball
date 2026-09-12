import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Center,
    Container,
    Grid,
    Group,
    LoadingOverlay,
    Paper,
    ScrollArea,
    Stack,
    Text,
    useMantineColorScheme,
} from '@mantine/core';
import { IconMapOff } from '@tabler/icons-react';
import { notify } from '../shared/notify';
import { useParams, useLocation } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import { useCartStore } from '../shared/stores/cart.store';
import { acquireTicketHold } from '../shared/api/ticketHold.api';
import { buildTicketOfferKey } from '../shared/ticketOffer';
import { StadiumSeatmapPanel } from '../components/stadium/StadiumSeatmapPanel';
import { resolveStadiumSections, hasStadiumSeatmap } from '../components/stadium/resolveStadiumSeatmap';
import { ModernH3 } from '../components/modern';
import { FiltersPanel, TicketCard, type Ticket, type TicketFilters } from '../components/tickets';
import { MatchHeader, type MatchDetails } from '../components/match';
import { useGetOneFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetOneTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetOneStadium } from '@iWatchFootball/clients/controllers/stadium';
import { useGetOneCompetition } from '@iWatchFootball/clients/controllers/competition';
import { useTranslation } from '../i18n';
import './seatSelection.page.css';

function parseFixtureScore(fixture: { homeScore?: number | null; awayScore?: number | null; metadata?: Record<string, unknown> | null }) {
    const meta = fixture.metadata;
    const home =
        fixture.homeScore ?? (typeof meta?.homeScore === 'number' ? meta.homeScore : undefined);
    const away =
        fixture.awayScore ?? (typeof meta?.awayScore === 'number' ? meta.awayScore : undefined);
    return {
        home: typeof home === 'number' && Number.isFinite(home) ? home : undefined,
        away: typeof away === 'number' && Number.isFinite(away) ? away : undefined,
    };
}

function matchDetailsFromLocation(state: unknown): MatchDetails | null {
    if (!state || typeof state !== 'object') return null;
    const s = state as Record<string, unknown>;
    if (typeof s.homeTeam !== 'string' || typeof s.awayTeam !== 'string' || typeof s.date !== 'string') {
        return null;
    }
    return {
        matchId: typeof s.matchId === 'string' ? s.matchId : undefined,
        homeTeam: s.homeTeam,
        awayTeam: s.awayTeam,
        homeTeamId: typeof s.homeTeamId === 'number' ? s.homeTeamId : undefined,
        awayTeamId: typeof s.awayTeamId === 'number' ? s.awayTeamId : undefined,
        homeTeamLogo: typeof s.homeTeamLogo === 'string' ? s.homeTeamLogo : undefined,
        awayTeamLogo: typeof s.awayTeamLogo === 'string' ? s.awayTeamLogo : undefined,
        date: s.date,
        venue: typeof s.venue === 'string' ? s.venue : '',
        competition: typeof s.competition === 'string' ? s.competition : undefined,
        competitionId: typeof s.competitionId === 'number' ? s.competitionId : undefined,
        stadiumId: typeof s.stadiumId === 'number' ? s.stadiumId : undefined,
        stadiumMetadata: s.stadiumMetadata,
    };
}

export function SeatSelectionPage() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const { id: matchId } = useParams<{ id: string }>();
    const routerLocation = useLocation();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { addItem, startReservation } = useCartStore();

    const fixtureNumericId = matchId ? parseInt(matchId, 10) : NaN;
    const fetchFromApi = Number.isFinite(fixtureNumericId) && fixtureNumericId > 0;

    const { data: fixture, isLoading: loadingFixture } = useGetOneFixture(fixtureNumericId, {
        query: { enabled: fetchFromApi } as never,
    });
    const homeTeamId = fixture?.homeTeamId;
    const awayTeamId = fixture?.awayTeamId;
    const stadiumId = fixture?.stadiumId;
    const competitionId = fixture?.competitionId;

    const { data: homeTeam, isLoading: loadingHome } = useGetOneTeam(homeTeamId ?? 0, {
        query: { enabled: fetchFromApi && typeof homeTeamId === 'number' } as never,
    });
    const { data: awayTeam, isLoading: loadingAway } = useGetOneTeam(awayTeamId ?? 0, {
        query: { enabled: fetchFromApi && typeof awayTeamId === 'number' } as never,
    });
    const { data: stadium, isLoading: loadingStadium } = useGetOneStadium(stadiumId ?? 0, {
        query: { enabled: fetchFromApi && typeof stadiumId === 'number' } as never,
    });
    const { data: competition, isLoading: loadingCompetition } = useGetOneCompetition(competitionId ?? 0, {
        query: { enabled: fetchFromApi && typeof competitionId === 'number' } as never,
    });

    const matchDetails: MatchDetails | null = useMemo(() => {
        if (fetchFromApi) {
            if (!fixture || !homeTeam || !awayTeam) return null;
            const scores = parseFixtureScore(
                fixture as {
                    homeScore?: number | null;
                    awayScore?: number | null;
                    metadata?: Record<string, unknown> | null;
                },
            );
            return {
                matchId: String(fixture.id),
                homeTeam: homeTeam.name,
                awayTeam: awayTeam.name,
                homeTeamId: fixture.homeTeamId,
                awayTeamId: fixture.awayTeamId,
                date: fixture.date,
                venue: stadium?.name ?? '',
                competition: competition?.name,
                competitionId: fixture.competitionId ?? competition?.id,
                homeTeamLogo: homeTeam.logoUrl,
                awayTeamLogo: awayTeam.logoUrl,
                stadiumId: stadium?.id ?? fixture.stadiumId,
                stadiumMetadata: stadium?.metadata,
                ...(scores.home != null && scores.away != null
                    ? { homeScore: scores.home, awayScore: scores.away }
                    : {}),
            };
        }
        return matchDetailsFromLocation(routerLocation.state);
    }, [fetchFromApi, fixture, homeTeam, awayTeam, stadium, competition, routerLocation.state]);

    const stadiumSections = useMemo(() => {
        const fromApi = resolveStadiumSections({
            venue: matchDetails?.venue ?? '',
            metadata: matchDetails?.stadiumMetadata,
        });
        if (fromApi) return fromApi;
        return resolveStadiumSections({ venue: matchDetails?.venue ?? '' });
    }, [matchDetails?.venue, matchDetails?.stadiumMetadata]);

    const loadingMatch =
        fetchFromApi &&
        (loadingFixture ||
            loadingHome ||
            loadingAway ||
            (typeof stadiumId === 'number' && loadingStadium) ||
            (typeof competitionId === 'number' && loadingCompetition));

    const showSeatmap = hasStadiumSeatmap(stadiumSections);
    const [filters, setFilters] = useState<TicketFilters>({
        priceRange: [229, 498],
        ticketType: null,
        blockLocation: null,
        quantity: null,
        splitType: null,
        fanSide: null,
    });
    const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [buyingTicketId, setBuyingTicketId] = useState<string | null>(null);

    // Mock tickets data
    const [allTickets] = useState<Ticket[]>([
        {
            id: '1',
            category: 4,
            block: 'CE4',
            seatsTogether: 2,
            ticketType: 'Up To 2 Seats Together',
            ticketFormat: 'E-Ticket',
            price: 231.23,
            available: 15,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '2',
            category: 4,
            block: '102',
            seatsTogether: 1,
            ticketType: 'Single Seats',
            ticketFormat: 'E-Ticket',
            price: 245.50,
            available: 8,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '3',
            category: 3,
            block: 'L5',
            seatsTogether: 4,
            ticketType: 'Up To 4 Seats Together',
            fanSide: 'Home',
            ticketFormat: 'E-Ticket',
            price: 374.33,
            available: 20,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '4',
            category: 1,
            block: 'U1',
            seatsTogether: 2,
            ticketType: 'Up To 2 Seats Together',
            fanSide: 'Home',
            ticketFormat: 'E-Ticket',
            price: 485.00,
            available: 5,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '5',
            category: 2,
            block: 'AU1',
            seatsTogether: 2,
            ticketType: 'Up To 2 Seats Together',
            ticketFormat: 'Print at Home',
            price: 420.75,
            available: 12,
            clearView: true,
            adultTickets: true,
        },
    ]);

    // Filters state
    const filteredTickets = useMemo(() => {
        return allTickets.filter((ticket) => {
            if (ticket.price < filters.priceRange[0] || ticket.price > filters.priceRange[1]) return false;
            if (filters.ticketType && ticket.ticketType !== filters.ticketType) return false;
            if (filters.blockLocation && ticket.block !== filters.blockLocation) return false;
            if (filters.quantity && ticket.seatsTogether.toString() !== filters.quantity) return false;
            if (filters.fanSide && ticket.fanSide !== filters.fanSide) return false;
            return true;
        });
    }, [allTickets, filters]);

    const handleFiltersChange = (newFilters: Partial<TicketFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleResetFilters = () => {
        setFilters({
            priceRange: [229, 498],
            ticketType: null,
            blockLocation: null,
            quantity: null,
            splitType: null,
            fanSide: null,
        });
    };

    const handleSectionClick = (sectionId: string) => {
        setSelectedSectionId(sectionId);
        handleFiltersChange({ blockLocation: sectionId });
    };

    const handleBuyNow = async (ticketId: string) => {
        const ticket = allTickets.find((t) => t.id === ticketId);
        if (!ticket) return;

        if (!matchId) {
            notify.error('Invalid match', 'Cannot reserve tickets for this fixture.');
            return;
        }

        const fixtureId = Number.parseInt(matchId, 10);
        if (!Number.isFinite(fixtureId)) {
            notify.error('Invalid match', 'Cannot reserve tickets for this fixture.');
            return;
        }

        let holderId = sessionStorage.getItem('iwf_ticket_holder');
        if (!holderId) {
            holderId = crypto.randomUUID();
            sessionStorage.setItem('iwf_ticket_holder', holderId);
        }

        const offerKey = buildTicketOfferKey(matchId, ticket.id);
        const quantity = ticket.seatsTogether || 1;

        setBuyingTicketId(ticketId);
        try {
            const { expiresAt, holdMinutes } = await acquireTicketHold({
                fixtureId,
                offerKey,
                holderId,
                quantity,
            });

            const ticketDetails = {
                matchId,
                homeTeam: matchDetails.homeTeam,
                awayTeam: matchDetails.awayTeam,
                date: matchDetails.date,
                venue: matchDetails.venue,
                price: ticket.price,
                quantity,
                section: ticket.block,
                row: undefined,
                fanSide: ticket.fanSide,
                seatsTogether: ticket.seatsTogether,
                ticketType: ticket.ticketFormat as 'E-Ticket' | 'Print at Home',
                unrestrictedView: ticket.clearView,
                fixtureId,
                offerKey,
                holderId,
                holdExpiresAt: expiresAt,
                category: `category-${ticket.category}`,
            };

            addItem(ticketDetails);
            startReservation();

            notify.success('Tickets reserved', `Your tickets are held for ${holdMinutes} minute${holdMinutes !== 1 ? 's' : ''}. Complete checkout before your reservation expires.`);

            navigateWithTransition('/checkout', {
                state: ticketDetails,
            });
        } catch (e: unknown) {
            const status = (e as { response?: { status?: number } })?.response?.status;
            if (status === 401) {
                notify.warning('Sign in required', 'Please sign in to reserve tickets, then try again.');
                navigateWithTransition('/login', { state: { from: { pathname: routerLocation.pathname } } });
            } else if (status === 409) {
                notify.warning('Ticket currently reserved', 'Another customer is holding this ticket right now. Please try again in a few minutes or choose a different option.');
            } else {
                const msg =
                    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    (e as Error)?.message ||
                    'Could not reserve these tickets.';
                notify.error('Reservation failed', msg);
            }
        } finally {
            setBuyingTicketId(null);
        }
    };

    const minPrice = useMemo(() => Math.min(...allTickets.map((t) => t.price)), [allTickets]);
    const maxPrice = useMemo(() => Math.max(...allTickets.map((t) => t.price)), [allTickets]);
    const availableBlocks = useMemo(
        () => Array.from(new Set(allTickets.map((t) => t.block).filter((block): block is string => Boolean(block)))),
        [allTickets]
    );

    if (fetchFromApi && loadingMatch) {
        return (
            <Box pos="relative" mih={320}>
                <LoadingOverlay visible />
            </Box>
        );
    }

    if (!matchDetails) {
        return (
            <Container size="xl" py="xl">
                <Center>
                    <Text c="dimmed">{t('match.invalidMatchId')}</Text>
                </Center>
            </Container>
        );
    }

    return (
        <Box className="seat-selection-page" style={{ minHeight: '100vh', padding: '2rem 0', backgroundColor: 'var(--modern-bg-primary)' }}>
            <Container size="xl">
                <MatchHeader matchDetails={matchDetails} variant="compact" showViewTicketsButton={false} />

                {/* Filters */}
                <FiltersPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                    availableBlocks={availableBlocks}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    isOpen={filtersOpen}
                    onToggle={() => setFiltersOpen(!filtersOpen)}
                />

                {!showSeatmap && (
                    <Alert
                        icon={<IconMapOff size={18} />}
                        color="gray"
                        variant="light"
                        mb="lg"
                        title={t('seatSelection.noSeatmapTitle')}
                    >
                        {t('seatSelection.noSeatmapVenue', { venue: matchDetails.venue })}
                    </Alert>
                )}

                {/* Main Content: Stadium Map and Ticket List */}
                <Grid gutter="lg">
                    {showSeatmap && (
                        <Grid.Col span={{ base: 12, lg: 8 }}>
                            <StadiumSeatmapPanel
                                sections={stadiumSections}
                                venueName={matchDetails.venue}
                                onSectionClick={handleSectionClick}
                                selectedSectionId={selectedSectionId}
                                blocksWithListings={availableBlocks}
                                isDark={isDark}
                            />
                        </Grid.Col>
                    )}

                    <Grid.Col span={{ base: 12, lg: showSeatmap ? 4 : 12 }}>
                        <Paper
                            p="md"
                            style={{
                                backgroundColor: isDark ? 'var(--modern-dark-gray)' : 'var(--modern-card-bg)',
                                border: isDark 
                                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                                    : '1px solid var(--modern-border-color)',
                                maxHeight: '600px',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'background-color 0.3s ease, border-color 0.3s ease',
                            }}
                        >
                            <Group justify="space-between" mb="md">
                                <ModernH3 style={{ color: 'var(--modern-text-primary)', margin: 0 }}>
                                    Available Tickets
                                </ModernH3>
                                <Text size="xs" style={{ color: 'var(--modern-text-secondary)' }}>
                                    Price includes all fees
                                </Text>
                            </Group>

                            <ScrollArea style={{ flex: 1 }}>
                                <Stack gap="md">
                                    {filteredTickets.length > 0 ? (
                                        filteredTickets.map((ticket) => (
                                            <TicketCard
                                                key={ticket.id}
                                                ticket={ticket}
                                                onBuyNow={handleBuyNow}
                                                buying={buyingTicketId === ticket.id}
                                            />
                                        ))
                                    ) : (
                                        <Text size="sm" style={{ color: 'var(--modern-text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                            No tickets match your filters. Try adjusting your search criteria.
                                        </Text>
                                    )}
                                </Stack>
                            </ScrollArea>
                        </Paper>
                    </Grid.Col>
                </Grid>
        </Container>
        </Box>
    );
}
