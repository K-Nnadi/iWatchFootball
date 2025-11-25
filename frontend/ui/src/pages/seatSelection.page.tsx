import React, { useState, useMemo } from 'react';
import { Box, Container, Grid, Paper, Stack, Text, Group, ScrollArea, useMantineColorScheme } from '@mantine/core';
import { useParams, useLocation } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import { StadiumMap } from '../components/stadium/StadiumMap';
import { ModernH3 } from '../components/modern';
import { MatchHeader, FiltersPanel, TicketCard, type Ticket, type TicketFilters, type MatchDetails } from '../components/tickets';
import { getAllSections, type StadiumSection } from '../components/stadium/anfieldStadium';
import './seatSelection.page.css';

// Default match details for fallback
const DEFAULT_MATCH_DETAILS: MatchDetails = {
        homeTeam: 'Inter Milan',
        awayTeam: 'AC Milan',
        homeTeamId: 3,
        awayTeamId: 4,
        homeTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png',
        awayTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png',
        date: '2025-01-25T18:00:00',
        venue: 'San Siro',
    };

export function SeatSelectionPage() {
    const { navigateWithTransition } = usePageTransition();
    const { matchId } = useParams<{ matchId: string }>();
    const routerLocation = useLocation();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const matchDetails: MatchDetails = (routerLocation.state as MatchDetails) || DEFAULT_MATCH_DETAILS;

    // Filters state
    const [filters, setFilters] = useState<TicketFilters>({
        priceRange: [229, 498],
        ticketType: null,
        blockLocation: null,
        quantity: null,
        splitType: null,
        fanSide: null,
    });
    const [viewMode, setViewMode] = useState<'zone' | 'block'>('zone');
    const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();
    const [filtersOpen, setFiltersOpen] = useState(true);

    // Mock tickets data
    const [allTickets, setAllTickets] = useState<Ticket[]>([
        {
            id: '1',
            category: 4,
            block: '334',
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
            block: '327',
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
            block: '218',
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
            block: '101',
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
            block: '201',
            seatsTogether: 2,
            ticketType: 'Up To 2 Seats Together',
            ticketFormat: 'Print at Home',
            price: 420.75,
            available: 12,
            clearView: true,
            adultTickets: true,
        },
    ]);

    // Use Anfield stadium sections
    const stadiumSections = useMemo(() => getAllSections(), []);

    // Filter tickets based on filters
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
        // Filter tickets by block if in block view
        if (viewMode === 'block') {
            handleFiltersChange({ blockLocation: sectionId });
        }
    };

    const handleBuyNow = (ticketId: string) => {
        const ticket = allTickets.find((t) => t.id === ticketId);
        if (ticket) {
            navigateWithTransition('/checkout', {
                state: {
                    matchId: matchId || 'unknown',
                    homeTeam: matchDetails.homeTeam,
                    awayTeam: matchDetails.awayTeam,
                    date: matchDetails.date,
                    venue: matchDetails.venue,
                    price: ticket.price,
                    ticket: ticket,
                },
            });
        }
    };

    const minPrice = useMemo(() => Math.min(...allTickets.map((t) => t.price)), [allTickets]);
    const maxPrice = useMemo(() => Math.max(...allTickets.map((t) => t.price)), [allTickets]);
    const availableBlocks = useMemo(
        () => Array.from(new Set(allTickets.map((t) => t.block).filter((block): block is string => Boolean(block)))),
        [allTickets]
    );

    return (
        <Box className="seat-selection-page" style={{ minHeight: '100vh', padding: '2rem 0', backgroundColor: 'var(--modern-bg-primary)' }}>
            <Container size="xl">
                {/* Match Header */}
                <MatchHeader 
                    matchDetails={matchDetails}
                />

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

                {/* Main Content: Stadium Map and Ticket List */}
                <Grid gutter="lg">
                    {/* Stadium Map */}
                    <Grid.Col span={{base: 12, lg: 8}}>
                        <StadiumMap
                            sections={stadiumSections}
                            onSectionClick={handleSectionClick}
                            selectedSectionId={selectedSectionId}
                        />
                    </Grid.Col>

                    {/* Ticket Listing */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Paper
                            p="md"
                            style={{
                                backgroundColor: isDark ? 'var(--modern-dark-gray)' : 'var(--modern-card-bg)',
                                border: isDark 
                                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                                    : '1px solid var(--modern-border-color)',
                                height: '600px',
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
