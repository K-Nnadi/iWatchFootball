import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Container, Image, LoadingOverlay, SimpleGrid, Tabs, Text, Title } from '@mantine/core';
import { LeagueTable } from "../components/tables/leagueTable";

// Example interfaces
interface Competition {
    id: string;
    name: string;
    logoUrl?: string;
    isInternational?: boolean;
}

interface NewsItem {
    id: string;
    title: string;
    imageUrl?: string;
    description: string;
}

interface StandingsEntry {
    position: number;
    team: string;
    points: number;
}

interface Fixture {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
}

// This component demonstrates a tabbed layout for a single competition page
export function CompetitionPage() {
    const { id: competitionId } = useParams<{ id: string }>();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [loading, setLoading] = useState(false);

    // Example states for data fetched for each tab
    const [news, setNews] = useState<NewsItem[]>([]);
    const [standings, setStandings] = useState<StandingsEntry[]>([]);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);

    useEffect(() => {
        if (competitionId) {
            setLoading(true);
            // TODO: Replace with real API call
            const mockCompetition: Competition = {
                id: competitionId,
                name: competitionId === 'comp1' ? 'Premier League' : 'Champions League',
                logoUrl: competitionId === 'comp1' ? '/logos/premier-league.png' : '/logos/champions-league.png',
                isInternational: competitionId === 'comp2'
            };

            // Simulate async load
            setTimeout(() => {
                setCompetition(mockCompetition);
                setLoading(false);
            }, 1000);
        }
    }, [competitionId]);

    // Fetch data for News, Standings, Fixtures once competition is known
    useEffect(() => {
        if (competition) {
            setLoading(true);

            // TODO: Replace with real API calls
            const mockNews: NewsItem[] = [
                { id: 'news1', title: 'Star Player Injured', description: 'A key player got injured before the big match.' },
                { id: 'news2', title: 'Transfer Rumors', description: 'Big teams looking to sign top talents.' }
            ];

            const mockStandings: StandingsEntry[] = [
                { position: 1, team: 'Team A', points: 45 },
                { position: 2, team: 'Team B', points: 42 },
                { position: 3, team: 'Team C', points: 40 },
            ];

            const mockFixtures: Fixture[] = [
                { id: 'fix1', homeTeam: 'Team A', awayTeam: 'Team D', date: '2023-09-15' },
                { id: 'fix2', homeTeam: 'Team B', awayTeam: 'Team C', date: '2023-09-16' },
                { id: 'fix3', homeTeam: 'Team A', awayTeam: 'Team C', date: '2023-09-15' },
                { id: 'fix4', homeTeam: 'Team D', awayTeam: 'Team B', date: '2023-09-16' }
            ];

            setTimeout(() => {
                setNews(mockNews);
                setStandings(mockStandings);
                setFixtures(mockFixtures);
                setLoading(false);
            }, 1000);
        }
    }, [competition]);

    // Group fixtures by match day
    const groupFixturesByDate = (fixtures: Fixture[]) => {
        return fixtures.reduce((groups, fixture) => {
            const date = fixture.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(fixture);
            return groups;
        }, {} as Record<string, Fixture[]>);
    };

    const groupedFixtures = groupFixturesByDate(fixtures);

    if (loading || !competition) {
        return (
            <Container size="md" my="xl" pos="relative">
                <LoadingOverlay visible />
            </Container>
        );
    }

    return (
        <Container size="md" my="xl" pos="relative">
            <Title order={2} mb="lg">
                {competition.name}
            </Title>
            {competition.logoUrl && (
                <Image
                    src={competition.logoUrl}
                    alt={`${competition.name} logo`}
                    fit="contain"
                    height={100}
                    mb="xl"
                />
            )}

            <Tabs defaultValue="news">
                <Tabs.List>
                    <Tabs.Tab value="news">News</Tabs.Tab>
                    <Tabs.Tab value="table">Table</Tabs.Tab>
                    <Tabs.Tab value="fixtures">Fixtures</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="news" pt="xl">
                    {news.length === 0 ? (
                        <Text>No news available.</Text>
                    ) : (
                        <SimpleGrid cols={1} style={{ gap: 'var(--mantine-spacing-md)' }}>
                            {news.map((item) => (
                                <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
                                    {item.imageUrl && (
                                        <Card.Section>
                                            <Image src={item.imageUrl} alt={item.title} height={160} />
                                        </Card.Section>
                                    )}
                                    <Text fw={500} size="lg" mt="md">
                                        {item.title}
                                    </Text>
                                    <Text size="sm" color="dimmed" mt="xs">
                                        {item.description}
                                    </Text>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="table" pt="xl">
                    {standings.length === 0 ? (
                        <Text>No table data available.</Text>
                    ) : (
                        <LeagueTable />
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="fixtures" pt="xl">
                    {Object.keys(groupedFixtures).length === 0 ? (
                        <Text>No fixtures scheduled.</Text>
                    ) : (
                        Object.keys(groupedFixtures).map((date) => (
                            <div key={date}>
                                <Title order={3} mb="md">
                                    {new Date(date).toLocaleDateString()}
                                </Title>
                                <SimpleGrid cols={1} style={{ gap: 'var(--mantine-spacing-md)' }}>
                                    {groupedFixtures[date].map((fix) => (
                                        <Card key={fix.id} shadow="sm" padding="md" radius="md" withBorder>
                                            <Text fw={500}>
                                                {fix.homeTeam} vs {fix.awayTeam}
                                            </Text>
                                            <Text size="sm" color="dimmed">{fix.date}</Text>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            </div>
                        ))
                    )}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
