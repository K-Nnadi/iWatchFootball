import { useState, useEffect } from 'react';
import {Container, Title, Accordion, Card, Text, SimpleGrid, Button, Grid} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {DateNavigation} from "../components/carousel/dateNavigation.carousel";

interface TodayMatch {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    homeScore?: number;
    awayScore?: number;
}

function getMatchStatus(matchDateStr: string): 'past' | 'today' | 'future' {
    const matchDate = new Date(matchDateStr);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    if (matchDate < todayStart) return 'past';
    if (matchDate >= todayStart && matchDate < tomorrowStart) return 'today';
    return 'future';
}

export function MatchesPage() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<TodayMatch[]>([]);
    const [loading, setLoading] = useState(true);

    const windowSize = 7; // always 7 days displayed

    // Let's place 'today' at index 3 initially
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // labeling function for our date navigation
    function getDateLabel(d: Date): string {
        const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diff = (dayOnly.getTime() - dayToday.getTime()) / (24 * 3600 * 1000);
        if (diff === 0) return 'Today';
        if (diff === -1) return 'Yesterday';
        if (diff === 1) return 'Tomorrow';
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
    function fetchMatchesForDate(date: Date) {
        setLoading(true);
        setTimeout(() => {
            const isPast = date < today && date.toDateString() !== today.toDateString();
            const mockMatches: TodayMatch[] = [
                {
                    id: 'match1',
                    competitionName: 'Premier League',
                    homeTeam: 'Team A',
                    awayTeam: 'Team B',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0).toISOString(),
                    venue: 'Stadium A',
                    homeScore: isPast ? 2 : undefined,
                    awayScore: isPast ? 1 : undefined
                },
                {
                    id: 'match2',
                    competitionName: 'Premier League',
                    homeTeam: 'Team C',
                    awayTeam: 'Team D',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium B',
                    homeScore: isPast ? 0 : undefined,
                    awayScore: isPast ? 0 : undefined
                },
                {
                    id: 'match3',
                    competitionName: 'Premier League',
                    homeTeam: 'Team E',
                    awayTeam: 'Team F',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium C',
                    homeScore: isPast ? 0 : undefined,
                    awayScore: isPast ? 0 : undefined
                },
                {
                    id: 'match4',
                    competitionName: 'Premier League',
                    homeTeam: 'Team G',
                    awayTeam: 'Team H',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium D',
                    homeScore: isPast ? 0 : undefined,
                    awayScore: isPast ? 0 : undefined
                },
                {
                    id: 'match5',
                    competitionName: 'Champions League',
                    homeTeam: 'Team I',
                    awayTeam: 'Team J',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                    venue: 'Stadium E',
                    homeScore: isPast ? 3 : undefined,
                    awayScore: isPast ? 2 : undefined
                },
                {
                    id: 'match6',
                    competitionName: 'FA Cup',
                    homeTeam: 'Team K',
                    awayTeam: 'Team L',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                    venue: 'Stadium F',
                    homeScore: isPast ? 3 : undefined,
                    awayScore: isPast ? 2 : undefined
                }
            ];
            setMatches(mockMatches);
            setLoading(false);
        }, 1000);
    }

    // refetch whenever selectedDate changes
    useEffect(() => {
        if (selectedDate) {
            fetchMatchesForDate(selectedDate);
        }
    }, [selectedDate]);

    // group matches by competition
    const matchesByCompetition = matches.reduce<Record<string, TodayMatch[]>>((acc, match) => {
        if (!acc[match.competitionName]) acc[match.competitionName] = [];
        acc[match.competitionName].push(match);
        return acc;
    }, {});

    return (
        <Container size="md" my="xl" style={{ position: 'relative', minHeight: '400px' }}>
            <Title order={2} mb="lg">
                Matches
            </Title>



            <DateNavigation
                dates={dates}
                selectedDateIndex={selectedDateIndex}
                setSelectedDateIndex={setSelectedDateIndex}
                onPrevClick={onPrevClick}
                onNextClick={onNextClick}
                onReturnToToday={onReturnToToday}
                getDateLabel={getDateLabelForNav}
            />

            {Object.keys(matchesByCompetition).length === 0 && !loading ? (
                <Text>No matches on this date.</Text>
            ) : (
                <Accordion variant="separated" multiple>
                    {Object.entries(matchesByCompetition).map(([competitionName, compMatches]) => (
                        <Accordion.Item value={competitionName} key={competitionName}>
                            <Accordion.Control>{competitionName}</Accordion.Control>
                            <Accordion.Panel>
                                <Grid gutter="md">
                                    {compMatches.map((m) => {
                                        const status = getMatchStatus(m.date);
                                        const resultText =
                                            status === 'past' && m.homeScore !== undefined && m.awayScore !== undefined
                                                ? `${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`
                                                : `${m.homeTeam} vs ${m.awayTeam}`;

                                        return (
                                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>                                                <Card
                                                    shadow="sm"
                                                    padding="lg"
                                                    radius="md"
                                                    withBorder
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() =>
                                                        navigate(`/match/${m.id}`, {
                                                            state: {
                                                                matchId: m.id,
                                                                homeTeam: m.homeTeam,
                                                                awayTeam: m.awayTeam,
                                                                date: m.date,
                                                                venue: m.venue
                                                            }
                                                        })
                                                    }
                                                >
                                                    <Text weight={500} size="lg" mb="xs">
                                                        {resultText}
                                                    </Text>
                                                    <Text size="sm" color="dimmed" mb="xs">
                                                        {new Date(m.date).toLocaleTimeString(undefined, {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Text>
                                                    <Text size="sm" color="dimmed">
                                                        Venue: {m.venue}
                                                    </Text>

                                                    {status === 'future' && (
                                                        <Button
                                                            variant="outline"
                                                            size="xs"
                                                            mt="md"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/seat-selection/${m.id}`, {
                                                                    state: {
                                                                        matchId: m.id,
                                                                        homeTeam: m.homeTeam,
                                                                        awayTeam: m.awayTeam,
                                                                        date: m.date,
                                                                        venue: m.venue
                                                                    }
                                                                });
                                                            }}
                                                        >
                                                            View Tickets
                                                        </Button>
                                                    )}
                                                </Card>
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
    );
}
