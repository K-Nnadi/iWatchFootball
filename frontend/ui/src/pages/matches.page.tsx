import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Accordion,
    Card,
    Text,
    SimpleGrid,
    Button
} from '@mantine/core';
import { DateNavigation } from '../components/carousel/dateNavigation.carousel';
import { useNavigate } from 'react-router-dom';

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
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    if (matchDate < todayStart) {
        return 'past';
    } else if (matchDate >= todayStart && matchDate < tomorrowStart) {
        return 'today';
    } else {
        return 'future';
    }
}

export function MatchesPage() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<TodayMatch[]>([]);

    const today = new Date();
    const daysRange = 14;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);

    const dates: Date[] = [];
    for (let i = 0; i <= daysRange; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dates.push(d);
    }

    const initialIndex = dates.findIndex(d => d.toDateString() === today.toDateString());
    const [selectedDateIndex, setSelectedDateIndex] = useState(initialIndex === -1 ? 7 : initialIndex);
    const selectedDate = dates[selectedDateIndex];

    const fetchMatchesForDate = (date: Date) => {
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
                competitionName: 'Champions League',
                homeTeam: 'Team E',
                awayTeam: 'Team F',
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                venue: 'Stadium C',
                homeScore: isPast ? 3 : undefined,
                awayScore: isPast ? 2 : undefined
            }
        ];
        setMatches(mockMatches);
    };

    useEffect(() => {
        if (selectedDate) {
            fetchMatchesForDate(selectedDate);
        }
    }, [selectedDate]);

    const matchesByCompetition = matches.reduce<Record<string, TodayMatch[]>>((acc, match) => {
        if (!acc[match.competitionName]) {
            acc[match.competitionName] = [];
        }
        acc[match.competitionName].push(match);
        return acc;
    }, {});


    return (
        <Container size="md" my="xl" pos="relative" style={{ position: 'relative', minHeight: '400px' }}>
            <Title order={2} mb="lg">
                Matches
            </Title>

            <DateNavigation
                dates={dates}
                selectedDateIndex={selectedDateIndex}
                setSelectedDateIndex={setSelectedDateIndex}
            />

            {Object.keys(matchesByCompetition).length === 0 ? (
                <Text>No matches on this date.</Text>
            ) : (
                <Accordion variant="separated" multiple>
                    {Object.entries(matchesByCompetition).map(([competitionName, compMatches]) => (
                        <Accordion.Item value={competitionName} key={competitionName}>
                            <Accordion.Control>{competitionName}</Accordion.Control>
                            <Accordion.Panel>
                                <SimpleGrid cols={1} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                                    {compMatches.map((m) => {
                                        const status = getMatchStatus(m.date);
                                        const resultText = status === 'past' && m.homeScore !== undefined && m.awayScore !== undefined
                                            ? `${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`
                                            : `${m.homeTeam} vs ${m.awayTeam}`;

                                        return (
                                            <Card
                                                key={m.id}
                                                shadow="sm"
                                                padding="lg"
                                                radius="md"
                                                withBorder
                                                style={{ cursor: 'pointer' }}
                                                onClick={() =>
                                                    navigate(`/match/${m.id}`, {
                                                        state: { matchId: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam, date: m.date, venue: m.venue }
                                                    })
                                                }
                                            >
                                                <Text weight={500} size="lg" mb="xs">
                                                    {resultText}
                                                </Text>
                                                <Text size="sm" color="dimmed" mb="xs">
                                                    {new Date(m.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
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
                                                                state: { matchId: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam, date: m.date, venue: m.venue },
                                                            });
                                                        }}
                                                    >
                                                        View Tickets
                                                    </Button>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </SimpleGrid>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}
        </Container>
    );
}
