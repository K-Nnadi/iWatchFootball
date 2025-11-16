import { useState, useEffect, useCallback, useMemo } from 'react';
import {Container, Accordion, Grid, Box, Group, Badge, Image, Paper, Stack, Text, Divider, Chip} from '@mantine/core';
import { usePageTransition } from '../hooks/usePageTransition';
import {DateNavigation} from "../components/carousel/dateNavigation.carousel";
import { ModernCard, ModernH1, ModernH3, ModernBody } from '../components/modern';

interface TodayMatch {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    homeScore?: number;
    awayScore?: number;
    hasTickets?: boolean;
    isLive?: boolean;
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

// Team crests mapping for OneFootball-style design
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
    'Team L': 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png'
};


export function MatchesPage() {
    const { navigateWithTransition } = usePageTransition();
    const [matches, setMatches] = useState<TodayMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLive, setShowLive] = useState(false);
    const [showAvailableTickets, setShowAvailableTickets] = useState(false);

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
        // user wants to see the next older day, but keep the same selectedDateIndex
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() - 1);
        setCurrentStartDate(newStart);
    }

    // SHIFT THE WINDOW BY 1 DAY FORWARD
    function onNextClick() {
        // user wants to see the next newer day, but keep the same selectedDateIndex
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() + 1);
        setCurrentStartDate(newStart);
    }

    function onReturnToToday() {
        // Example: place "today" at index 3
        const t = new Date();
        t.setHours(0, 0, 0, 0);

        // Shift the window so that 'today' is at index 3
        const newStart = new Date(t);
        newStart.setDate(t.getDate() - 3);
        setCurrentStartDate(newStart);
        setSelectedDateIndex(3);
    }

    function onDateSelect(date: Date) {
        // Normalize the selected date
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);

        // Check if the date is in the current window
        const currentDates = generateDates();
        const indexInWindow = currentDates.findIndex(d => {
            const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return dayDate.getTime() === selected.getTime();
        });

        if (indexInWindow !== -1) {
            // Date is in current window, just select it
            setSelectedDateIndex(indexInWindow);
        } else {
            // Date is outside current window, shift window to center it at index 3
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

    // fetchMatchesForDate
    const fetchMatchesForDate = useCallback((date: Date) => {
        setLoading(true);
        setTimeout(() => {
            const isPast = date < today && date.toDateString() !== today.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            const now = new Date();
            const currentHour = now.getHours();
            
            const mockMatches: TodayMatch[] = [
                {
                    id: 'match1',
                    competitionName: 'Premier League',
                    homeTeam: 'Team A',
                    awayTeam: 'Team B',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0).toISOString(),
                    venue: 'Stadium A',
                    homeScore: isPast ? 2 : (isToday && currentHour >= 15 && currentHour < 17 ? 1 : undefined),
                    awayScore: isPast ? 1 : (isToday && currentHour >= 15 && currentHour < 17 ? 0 : undefined),
                    hasTickets: true,
                    isLive: isToday && currentHour >= 15 && currentHour < 17
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
                    hasTickets: true,
                    isLive: isToday && currentHour >= 17 && currentHour < 19
                },
                {
                    id: 'match3',
                    competitionName: 'Premier League',
                    homeTeam: 'Team E',
                    awayTeam: 'Team F',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium C',
                    homeScore: isPast ? 0 : undefined,
                    awayScore: isPast ? 0 : undefined,
                    hasTickets: false,
                    isLive: false
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
                    hasTickets: true,
                    isLive: false
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
                    hasTickets: true,
                    isLive: false
                },
                {
                    id: 'match6',
                    competitionName: 'FA Cup',
                    homeTeam: 'Team K',
                    awayTeam: 'Team L',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                    venue: 'Stadium F',
                    homeScore: isPast ? 3 : undefined,
                    awayScore: isPast ? 2 : undefined,
                    hasTickets: false,
                    isLive: false
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

    // Filter matches based on active filters
    const filteredMatches = useMemo(() => {
        return matches.filter((match) => {
            if (showLive && !match.isLive) return false;
            if (showAvailableTickets && !match.hasTickets) return false;
            return true;
        });
    }, [matches, showLive, showAvailableTickets]);

    // group matches by competition
    const matchesByCompetition = filteredMatches.reduce<Record<string, TodayMatch[]>>((acc, match) => {
        if (!acc[match.competitionName]) acc[match.competitionName] = [];
        acc[match.competitionName].push(match);
        return acc;
    }, {});

    return (
        <Box className="dark-theme" style={{ 
            backgroundColor: 'var(--modern-bg-primary)', 
            minHeight: '100vh',
            padding: '2rem 0'
        }}>
            <Container size="lg" style={{ position: 'relative', minHeight: '400px' }}>
                <ModernH1 style={{ 
                    color: 'var(--modern-text-primary)', 
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                Matches
                </ModernH1>

                {/* Filters */}
                <Paper 
                    p="md" 
                    mb="lg" 
                    style={{ 
                        backgroundColor: 'var(--modern-card-bg)', 
                        border: '1px solid var(--modern-border-color)' 
                    }}
                >
                    <Group gap="md">
                        <Text size="sm" fw={600} style={{ color: 'var(--modern-text-primary)' }}>
                            Filters:
                        </Text>
                        <Chip
                            checked={showLive}
                            onChange={(checked) => setShowLive(checked)}
                            variant={showLive ? 'filled' : 'outline'}
                            styles={{
                                label: {
                                    backgroundColor: showLive ? 'var(--modern-lime)' : 'transparent',
                                    color: showLive ? 'var(--modern-bg-primary)' : 'var(--modern-text-primary)',
                                    borderColor: 'var(--modern-lime)',
                                    fontWeight: 600,
                                }
                            }}
                        >
                            LIVE
                        </Chip>
                        <Chip
                            checked={showAvailableTickets}
                            onChange={(checked) => setShowAvailableTickets(checked)}
                            variant={showAvailableTickets ? 'filled' : 'outline'}
                            styles={{
                                label: {
                                    backgroundColor: showAvailableTickets ? 'var(--modern-lime)' : 'transparent',
                                    color: showAvailableTickets ? 'var(--modern-bg-primary)' : 'var(--modern-text-primary)',
                                    borderColor: 'var(--modern-lime)',
                                    fontWeight: 600,
                                }
                            }}
                        >
                            Available Tickets
                        </Chip>
                    </Group>
                </Paper>

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
                    borderRadius: '8px'
                }}>
                    <ModernH3 style={{ color: 'var(--modern-text-primary)', marginBottom: '0.5rem' }}>
                        {showLive || showAvailableTickets ? 'No matches match your filters' : 'No matches on this date'}
                    </ModernH3>
                    <ModernBody style={{ color: 'var(--modern-light-gray)' }}>
                        {showLive || showAvailableTickets ? 'Try adjusting your filters' : 'Check back later for upcoming fixtures'}
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
                                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={m.id}>
                                                <Paper
                                                    radius="md"
                                                    p="md"
                                                    withBorder
                                                    onClick={() =>
                                                        navigateWithTransition(`/match/${m.id}`)
                                                    }
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: '0.2s ease',
                                                        position: 'relative',
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
                                                        {m.hasTickets && (
                                                            <Badge
                                                                size="sm"
                                                                variant="light"
                                                                style={{
                                                                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                                                    color: 'var(--modern-lime)',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                Tickets Available
                                                            </Badge>
                                                        )}
                                                    </Group>
                                                    <Grid align="center">
                                                        {/* Crests */}
                                                        <Grid.Col span={2}>
                                                            <Stack gap="xs" align="center" justify="center">
                                                                <Image src={teamCrests[m.homeTeam]} width={32} height={32} fit="contain" />
                                                                <Image src={teamCrests[m.awayTeam]} width={32} height={32} fit="contain" />
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

