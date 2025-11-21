import { useState, useEffect, useCallback, useMemo } from 'react';
import {Container, Accordion, Grid, Box, Group, Badge, Image, Paper, Stack, Text, Divider} from '@mantine/core';
import {IconTicket} from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import {DateNavigation} from "../components/carousel/dateNavigation.carousel";
import { ModernCard, ModernH1, ModernH3, ModernBody, ModernButton } from '../components/modern';

interface TicketMatch {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    homeScore?: number;
    awayScore?: number;
    isLive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    availableTickets?: number;
}

// Competition crests mapping
const competitionCrests: Record<string, string> = {
    'Premier League': 'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
    'Champions League': 'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png',
    'FA Cup': 'https://logos-world.net/wp-content/uploads/2020/06/FA-Cup-Logo.png',
    'LaLiga': 'https://logos-world.net/wp-content/uploads/2020/06/LaLiga-Logo.png',
    'Bundesliga': 'https://logos-world.net/wp-content/uploads/2020/06/Bundesliga-Logo.png',
    'Serie A': 'https://logos-world.net/wp-content/uploads/2020/06/Serie-A-Logo.png',
    'Ligue 1': 'https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png'
};

// Team crests mapping
const teamCrests: Record<string, string> = {
    'Team A': 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
    'Team B': 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
    'Team C': 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
    'Team D': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
    'Team E': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
    'Team F': 'https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png',
    'Team G': 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
    'Team H': 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
    'Team I': 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png',
    'Team J': 'https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png',
    'Team K': 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png',
    'Team L': 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png',
    'Inter Milan': 'https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png',
    'AC Milan': 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png'
};

export function TicketsPage() {
    const { navigateWithTransition } = usePageTransition();
    const [matches, setMatches] = useState<TicketMatch[]>([]);
    const [loading, setLoading] = useState(true);

    const windowSize = 7; // always 7 days displayed

    // Let's place 'today' at index 3 initially
    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const [currentStartDate, setCurrentStartDate] = useState(() => {
        // shift start date so that today is index 3
        const d = new Date(today);
        d.setDate(d.getDate() - 3);
        return d;
    });

    // The index in our 7-day window that is "selected"
    const [selectedDateIndex, setSelectedDateIndex] = useState(3);

    // Generate the 7 days in the current window
    function generateDates(): Date[] {
        const arr: Date[] = [];
        for (let i = 0; i < windowSize; i++) {
            const d = new Date(currentStartDate);
            d.setDate(currentStartDate.getDate() + i);
            arr.push(d);
        }
        return arr;
    }

    const dates = generateDates();
    const selectedDate = dates[selectedDateIndex];

    // SHIFT THE WINDOW BY 1 DAY BACK
    function onPrevClick() {
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() - 1);
        setCurrentStartDate(newStart);
    }

    // SHIFT THE WINDOW BY 1 DAY FORWARD
    function onNextClick() {
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() + 1);
        setCurrentStartDate(newStart);
    }

    function onReturnToToday() {
        const t = new Date();
        t.setHours(0, 0, 0, 0);

        const newStart = new Date(t);
        newStart.setDate(t.getDate() - 3);
        setCurrentStartDate(newStart);
        setSelectedDateIndex(3);
    }

    function onDateSelect(date: Date) {
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);

        const currentDates = generateDates();
        const indexInWindow = currentDates.findIndex(d => {
            const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return dayDate.getTime() === selected.getTime();
        });

        if (indexInWindow !== -1) {
            setSelectedDateIndex(indexInWindow);
        } else {
            const newStart = new Date(selected);
            newStart.setDate(selected.getDate() - 3);
            setCurrentStartDate(newStart);
            setSelectedDateIndex(3);
        }
    }

    function getDateLabelForNav(d: Date): string {
        const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diff = (dayDate.getTime() - dayToday.getTime()) / (24 * 3600 * 1000);

        if (diff === 0) return 'Today';
        if (diff === -1) return 'Yesterday';
        if (diff === 1) return 'Tomorrow';
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    // fetchMatchesForDate - only matches with tickets
    const fetchMatchesForDate = useCallback((date: Date) => {
        setLoading(true);
        setTimeout(() => {
            const isPast = date < today && date.toDateString() !== today.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            const now = new Date();
            const currentHour = now.getHours();
            
            // Only return matches with available tickets
            const mockMatches: TicketMatch[] = [
                {
                    id: 'match1',
                    competitionName: 'Premier League',
                    homeTeam: 'Team A',
                    awayTeam: 'Team B',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0).toISOString(),
                    venue: 'Stadium A',
                    homeScore: isPast ? 2 : (isToday && currentHour >= 15 && currentHour < 17 ? 1 : undefined),
                    awayScore: isPast ? 1 : (isToday && currentHour >= 15 && currentHour < 17 ? 0 : undefined),
                    isLive: isToday && currentHour >= 15 && currentHour < 17,
                    minPrice: 45.00,
                    maxPrice: 250.00,
                    availableTickets: 150
                },
                {
                    id: 'match2',
                    competitionName: 'Premier League',
                    homeTeam: 'Team C',
                    awayTeam: 'Team D',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium B',
                    homeScore: isPast ? 0 : (isToday && currentHour >= 17 && currentHour < 19 ? 2 : undefined),
                    awayScore: isPast ? 0 : (isToday && currentHour >= 17 && currentHour < 19 ? 1 : undefined),
                    isLive: isToday && currentHour >= 17 && currentHour < 19,
                    minPrice: 55.00,
                    maxPrice: 300.00,
                    availableTickets: 89
                },
                {
                    id: 'match4',
                    competitionName: 'Premier League',
                    homeTeam: 'Team G',
                    awayTeam: 'Team H',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium D',
                    homeScore: isPast ? 0 : undefined,
                    awayScore: isPast ? 0 : undefined,
                    isLive: false,
                    minPrice: 40.00,
                    maxPrice: 200.00,
                    availableTickets: 234
                },
                {
                    id: 'match5',
                    competitionName: 'Champions League',
                    homeTeam: 'Team I',
                    awayTeam: 'Team J',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                    venue: 'Stadium E',
                    homeScore: isPast ? 3 : undefined,
                    awayScore: isPast ? 2 : undefined,
                    isLive: false,
                    minPrice: 75.00,
                    maxPrice: 450.00,
                    availableTickets: 67
                }
            ];
            setMatches(mockMatches);
            setLoading(false);
        }, 1000);
    }, [today]);

    // refetch whenever selectedDate changes
    useEffect(() => {
        if (selectedDate) {
            fetchMatchesForDate(selectedDate);
        }
    }, [selectedDate, fetchMatchesForDate]);

    // group matches by competition
    const matchesByCompetition = matches.reduce<Record<string, TicketMatch[]>>((acc, match) => {
        if (!acc[match.competitionName]) acc[match.competitionName] = [];
        acc[match.competitionName].push(match);
        return acc;
    }, {});

    function handleViewTickets(match: TicketMatch) {
        navigateWithTransition(`/seat-selection/${match.id}`, {
            transitionType: 'loading',
            duration: 1200,
            state: {
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                date: match.date,
                venue: match.venue,
                competition: match.competitionName,
            }
        });
    }

    return (
        <Box className="dark-theme" style={{ 
            backgroundColor: 'var(--modern-bg-primary)', 
            minHeight: '100vh',
            padding: '2rem 0'
        }}>
            <Container size="lg" style={{ position: 'relative', minHeight: '400px' }}>
                <Group gap="md" mb="xl" align="center">
                    <IconTicket size={32} color="var(--modern-lime)" />
                    <ModernH1 style={{ 
                        color: 'var(--modern-text-primary)', 
                        margin: 0
                    }}>
                        Available Tickets
                    </ModernH1>
                </Group>

                <ModernBody style={{ 
                    color: 'var(--modern-text-secondary)', 
                    marginBottom: '2rem',
                    fontSize: '1.1rem'
                }}>
                    Browse and book tickets for upcoming matches. Select a date to see available tickets.
                </ModernBody>

                <DateNavigation
                    dates={dates}
                    selectedDateIndex={selectedDateIndex}
                    setSelectedDateIndex={setSelectedDateIndex}
                    onPrevClick={onPrevClick}
                    onNextClick={onNextClick}
                    onReturnToToday={onReturnToToday}
                    onDateSelect={onDateSelect}
                    getDateLabel={getDateLabelForNav}
                />

                {Object.keys(matchesByCompetition).length === 0 && !loading ? (
                    <ModernCard style={{ 
                        backgroundColor: 'var(--modern-card-bg)',
                        textAlign: 'center',
                        padding: '3rem',
                        border: '1px solid var(--modern-border-color)',
                        borderRadius: '8px',
                        marginTop: '2rem'
                    }}>
                        <IconTicket size={48} color="var(--modern-text-secondary)" style={{ margin: '0 auto 1rem' }} />
                        <ModernH3 style={{ color: 'var(--modern-text-primary)', marginBottom: '0.5rem' }}>
                            No tickets available
                        </ModernH3>
                        <ModernBody style={{ color: 'var(--modern-light-gray)' }}>
                            There are no tickets available for matches on this date. Try selecting a different date.
                        </ModernBody>
                    </ModernCard>
                ) : (
                    <Accordion variant="separated" multiple>
                        {Object.entries(matchesByCompetition).map(([competitionName, compMatches]) => (
                            <Accordion.Item 
                                value={competitionName} 
                                key={competitionName}
                                style={{ 
                                    backgroundColor: 'var(--modern-card-bg)',
                                    border: '1px solid var(--modern-border-color)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    boxShadow: '0 2px 4px var(--modern-shadow-color)'
                                }}
                            >
                                <Accordion.Control style={{ 
                                    backgroundColor: 'transparent',
                                    color: 'var(--modern-text-primary)',
                                    padding: '1rem 1.5rem'
                                }}>
                                    <Group gap="md" align="center">
                                        <Image
                                            src={competitionCrests[competitionName]}
                                            alt={competitionName}
                                            width={24}
                                            height={24}
                                            style={{ borderRadius: '4px' }}
                                        />
                                        <ModernH3 style={{ 
                                            color: 'var(--modern-text-primary)', 
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            fontWeight: 600
                                        }}>
                                            {competitionName}
                                        </ModernH3>
                                        <Badge 
                                            size="sm" 
                                            style={{ 
                                                backgroundColor: 'var(--modern-lime)', 
                                                color: 'var(--modern-bg-primary)',
                                                fontWeight: 600
                                            }}
                                        >
                                            {compMatches.length} match{compMatches.length !== 1 ? 'es' : ''}
                                        </Badge>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel style={{ 
                                    backgroundColor: 'transparent',
                                    padding: '0 1.5rem 1.5rem'
                                }}>
                                    <Grid gutter="md">
                                        {compMatches.map((m) => {
                                            return (
                                                <Grid.Col span={{ base: 12, sm: 6, md: 6 }} key={m.id}>
                                                    <Paper
                                                        radius="md"
                                                        p="md"
                                                        withBorder
                                                        style={{
                                                            transition: '0.2s ease',
                                                            position: 'relative',
                                                            backgroundColor: 'var(--modern-card-bg)',
                                                            border: '1px solid var(--modern-border-color)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        {/* Status Badges */}
                                                        <Group justify="space-between" mb="xs">
                                                            {m.isLive && (
                                                                <Badge
                                                                    size="sm"
                                                                    style={{
                                                                        backgroundColor: '#ff4444',
                                                                        color: 'white',
                                                                        fontWeight: 700,
                                                                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            width: '8px',
                                                                            height: '8px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#ff0000',
                                                                            display: 'inline-block',
                                                                            animation: 'blink-dot 1s ease-in-out infinite',
                                                                            boxShadow: '0 0 4px rgba(255, 0, 0, 0.8)',
                                                                        }}
                                                                    />
                                                                    LIVE
                                                                </Badge>
                                                            )}
                                                            <Badge
                                                                size="sm"
                                                                variant="light"
                                                                style={{
                                                                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                                                    color: 'var(--modern-lime)',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                <IconTicket size={12} style={{ marginRight: '4px' }} />
                                                                {m.availableTickets} Available
                                                            </Badge>
                                                        </Group>

                                                        <Grid align="center" mb="md">
                                                            {/* Crests */}
                                                            <Grid.Col span={2}>
                                                                <Stack gap="xs" align="center" justify="center">
                                                                    <Image src={teamCrests[m.homeTeam] || teamCrests['Team A']} width={32} height={32} fit="contain" />
                                                                    <Image src={teamCrests[m.awayTeam] || teamCrests['Team B']} width={32} height={32} fit="contain" />
                                                                </Stack>
                                                            </Grid.Col>

                                                            {/* Team Names */}
                                                            <Grid.Col span={5}>
                                                                <Stack gap="xs" justify="center">
                                                                    <Text size="sm" fw={500}>{m.homeTeam}</Text>
                                                                    <Text size="sm" fw={500}>{m.awayTeam}</Text>
                                                                </Stack>
                                                            </Grid.Col>

                                                            {/* Divider */}
                                                            <Grid.Col span={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <Divider
                                                                    orientation="vertical"
                                                                    color="rgba(255, 255, 255, 0.3)"
                                                                    size="sm"
                                                                    style={{ 
                                                                        height: '60px',
                                                                        borderColor: 'rgba(255, 255, 255, 0.3)'
                                                                    }}
                                                                />
                                                            </Grid.Col>

                                                            {/* Score or Time */}
                                                            <Grid.Col span={4}>
                                                                <Stack gap="xs" align="flex-end" justify="center">
                                                                    {m.homeScore !== undefined && m.awayScore !== undefined ? (
                                                                        <>
                                                                            <Text size="sm" fw={600}>{m.homeScore}</Text>
                                                                            <Text size="sm" fw={600}>{m.awayScore}</Text>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Text size="sm" c="dimmed">Kickoff</Text>
                                                                            <Text size="sm">
                                                                                {new Date(m.date).toLocaleTimeString(undefined, {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </Text>
                                                                        </>
                                                                    )}
                                                                </Stack>
                                                            </Grid.Col>
                                                        </Grid>

                                                        {/* Ticket Info */}
                                                        <Group justify="space-between" mb="md" p="xs" style={{
                                                            backgroundColor: 'rgba(0, 255, 136, 0.05)',
                                                            borderRadius: '4px',
                                                            border: '1px solid rgba(0, 255, 136, 0.2)'
                                                        }}>
                                                            <Stack gap={2}>
                                                                <Text size="xs" c="dimmed">Price Range</Text>
                                                                <Text size="sm" fw={600} c="var(--modern-lime)">
                                                                    £{m.minPrice?.toFixed(2)} - £{m.maxPrice?.toFixed(2)}
                                                                </Text>
                                                            </Stack>
                                                            <Stack gap={2} align="flex-end">
                                                                <Text size="xs" c="dimmed">Venue</Text>
                                                                <Text size="sm" fw={500}>{m.venue}</Text>
                                                            </Stack>
                                                        </Group>

                                                        {/* Book Tickets Button */}
                                                        <ModernButton
                                                            variant="primary"
                                                            fullWidth
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewTickets(m);
                                                            }}
                                                        >
                                                            <IconTicket size={16} style={{ marginRight: '8px' }} />
                                                            Book Tickets
                                                        </ModernButton>
                                                    </Paper>
                                                </Grid.Col>
                                            );
                                        })}
                                    </Grid>
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                )}
            </Container>
        </Box>
    );
}

