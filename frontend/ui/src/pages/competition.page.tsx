import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Image, LoadingOverlay, Tabs, Text, Title, Box, Group, Badge, Stack, Center, Divider, Grid, Paper } from '@mantine/core';
import { IconNews, IconTable, IconCalendar, IconWorld, IconFlag, IconClock } from '@tabler/icons-react';
import { LeagueTable } from "../components/tables/leagueTable";
import { ModernCard, ModernH3, ModernBody } from '../components/modern';
import { usePageTransition } from '../hooks/usePageTransition';
import '../styles/modern.css';

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
    excerpt?: string;
    description: string;
    category?: string;
    source?: string;
    time?: string;
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
    venue?: string;
    homeScore?: number;
    awayScore?: number;
    hasTickets?: boolean;
    isLive?: boolean;
}

// Team crests mapping for match cards
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

// This component demonstrates a tabbed layout for a single competition page
export function CompetitionPage() {
    const { id: competitionId } = useParams<{ id: string }>();
    const { navigateWithTransition } = usePageTransition();
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
                { 
                    id: 'news1', 
                    title: 'Star Player Injured', 
                    description: 'A key player got injured before the big match.',
                    excerpt: 'A key player got injured before the big match, raising concerns about the team\'s upcoming fixtures.',
                    category: competition.name,
                    source: 'BBC Sport',
                    time: '2 hours ago',
                    imageUrl: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80'
                },
                { 
                    id: 'news2', 
                    title: 'Transfer Rumors', 
                    description: 'Big teams looking to sign top talents.',
                    excerpt: 'Several top clubs are reportedly interested in signing key players from this competition.',
                    category: 'Transfer News',
                    source: 'ESPN',
                    time: '5 hours ago',
                    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=600&q=80'
                },
                { 
                    id: 'news3', 
                    title: 'Manager Announces Squad Changes', 
                    description: 'The manager has made several changes to the squad ahead of the next match.',
                    excerpt: 'Significant squad rotation expected as the manager looks to keep players fresh for upcoming fixtures.',
                    category: competition.name,
                    source: 'Sky Sports',
                    time: '1 hour ago',
                    imageUrl: 'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=600&q=80'
                },
                { 
                    id: 'news4', 
                    title: 'Record Attendance Expected', 
                    description: 'The upcoming match is expected to break attendance records.',
                    excerpt: 'Fans are flocking to witness what promises to be one of the most exciting matches of the season.',
                    category: competition.name,
                    source: 'The Athletic',
                    time: '3 hours ago',
                    imageUrl: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=600&q=80'
                }
            ];

            const mockStandings: StandingsEntry[] = [
                { position: 1, team: 'Team A', points: 45 },
                { position: 2, team: 'Team B', points: 42 },
                { position: 3, team: 'Team C', points: 40 },
            ];

            const mockFixtures: Fixture[] = [
                { id: 'fix1', homeTeam: 'Team A', awayTeam: 'Team D', date: '2023-09-15', venue: 'Stadium A', hasTickets: true },
                { id: 'fix2', homeTeam: 'Team B', awayTeam: 'Team C', date: '2023-09-16', venue: 'Stadium B', hasTickets: false },
                { id: 'fix3', homeTeam: 'Team A', awayTeam: 'Team C', date: '2023-09-15', venue: 'Stadium A', hasTickets: true },
                { id: 'fix4', homeTeam: 'Team D', awayTeam: 'Team B', date: '2023-09-16', venue: 'Stadium D', hasTickets: true }
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
            <Container size="xl" my="xl" pos="relative">
                <LoadingOverlay visible />
            </Container>
        );
    }

    return (
        <Container size="xl" my="xl" pos="relative">
            {/* Header Section */}
            <Box
                mb="xl"
                style={{
                    padding: '2rem',
                    backgroundColor: 'var(--modern-card-bg)',
                    border: '1px solid var(--modern-card-border)',
                    borderRadius: 0,
                }}
                className="modern-card"
            >
                <Group align="center" gap="xl" wrap="wrap">
                    {competition.logoUrl && (
                        <Box
                            style={{
                                padding: '1rem',
                                backgroundColor: 'var(--modern-bg-tertiary)',
                                borderRadius: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '120px',
                                minHeight: '120px',
                            }}
                        >
                            <Image
                                src={competition.logoUrl}
                                alt={`${competition.name} logo`}
                                fit="contain"
                                height={100}
                                style={{
                                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                                }}
                            />
                        </Box>
                    )}
                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Title 
                            order={1}
                            style={{
                                fontSize: 'clamp(2rem, 5vw, 3rem)',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {competition.name}
                        </Title>
                        {competition.isInternational ? (
                            <Group gap="xs">
                                <IconWorld size={18} style={{ color: 'var(--modern-lime)' }} />
                                <Text size="sm" c="dimmed" fw={500}>
                                    International Competition
                                </Text>
                            </Group>
                        ) : (
                            <Group gap="xs">
                                <IconFlag size={18} style={{ color: 'var(--modern-text-secondary)' }} />
                                <Text size="sm" c="dimmed">
                                    Domestic League
                                </Text>
                            </Group>
                        )}
                    </Stack>
                </Group>
            </Box>

            <Tabs defaultValue="news" styles={{
                list: {
                    borderBottom: '2px solid var(--modern-card-border)',
                    marginBottom: '2rem',
                },
                tab: {
                    color: 'var(--modern-text-secondary)',
                    borderBottom: '2px solid transparent',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    '&[data-active]': {
                        color: 'var(--modern-lime)',
                        borderBottomColor: 'var(--modern-lime)',
                    },
                    '&:hover': {
                        color: 'var(--modern-lime)',
                        backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    },
                },
            }}>
                <Tabs.List>
                    <Tabs.Tab value="news" leftSection={<IconNews size={18} />}>
                        News
                    </Tabs.Tab>
                    <Tabs.Tab value="table" leftSection={<IconTable size={18} />}>
                        Table
                    </Tabs.Tab>
                    <Tabs.Tab value="fixtures" leftSection={<IconCalendar size={18} />}>
                        Fixtures
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="news" pt="xl">
                    {news.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconNews size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                                <Text size="lg" c="dimmed" fw={500}>
                                    No news available
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Check back later for the latest updates
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Grid gutter="lg">
                            {news.map((item) => (
                                <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                                    <Box
                                        onClick={() => navigateWithTransition(`/news/${item.id}`)}
                                        style={{
                                            cursor: 'pointer',
                                            height: '100%',
                                        }}
                                    >
                                        <ModernCard hover style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <Stack gap="md" style={{ flex: 1 }}>
                                                {item.imageUrl && (
                                                    <Box
                                                        component="img"
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        style={{
                                                            width: '100%',
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                        }}
                                                    />
                                                )}
                                                <Stack gap="xs" style={{ flex: 1 }}>
                                                    {item.category && (
                                                        <Text size="xs" c="var(--modern-lime)" fw={600} style={{ textTransform: 'uppercase' }}>
                                                            {item.category}
                                                        </Text>
                                                    )}
                                                    <ModernH3 style={{ fontSize: '1.1rem', lineHeight: 1.4, flex: 1 }}>
                                                        {item.title}
                                                    </ModernH3>
                                                    {(item.excerpt || item.description) && (
                                                        <ModernBody style={{ fontSize: '0.9rem', flex: 1 }}>
                                                            {item.excerpt || item.description}
                                                        </ModernBody>
                                                    )}
                                                    <Group gap="xs" mt="auto">
                                                        {item.source && (
                                                            <>
                                                                <Text size="xs" c="dimmed">{item.source}</Text>
                                                                {item.time && <Text size="xs" c="dimmed">•</Text>}
                                                            </>
                                                        )}
                                                        {item.time && (
                                                            <Group gap={4}>
                                                                <IconClock size={12} color="var(--modern-gray)" />
                                                                <Text size="xs" c="dimmed">{item.time}</Text>
                                                            </Group>
                                                        )}
                                                    </Group>
                                                </Stack>
                                            </Stack>
                                        </ModernCard>
                                    </Box>
                                </Grid.Col>
                            ))}
                        </Grid>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="table" pt="xl">
                    {standings.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconTable size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                                <Text size="lg" c="dimmed" fw={500}>
                                    No table data available
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Standings will appear here once the season begins
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Box
                            style={{
                                backgroundColor: 'var(--modern-card-bg)',
                                border: '1px solid var(--modern-card-border)',
                                padding: '1.5rem',
                            }}
                        >
                            <LeagueTable />
                        </Box>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="fixtures" pt="xl">
                    {Object.keys(groupedFixtures).length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconCalendar size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                                <Text size="lg" c="dimmed" fw={500}>
                                    No fixtures scheduled
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Upcoming matches will appear here
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Stack gap="xl">
                            {Object.keys(groupedFixtures).map((date, dateIndex) => (
                                <Box key={date}>
                                    <Group gap="md" mb="lg" align="center">
                                        <IconCalendar size={20} style={{ color: 'var(--modern-lime)' }} />
                                        <Title
                                            order={3}
                                            style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {new Date(date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Title>
                                        <Badge
                                            variant="light"
                                            color="lime"
                                            style={{
                                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                color: 'var(--modern-lime)',
                                                border: '1px solid rgba(0, 255, 136, 0.2)',
                                            }}
                                        >
                                            {groupedFixtures[date].length} {groupedFixtures[date].length === 1 ? 'match' : 'matches'}
                                        </Badge>
                                    </Group>
                                    <Grid gutter="md">
                                        {groupedFixtures[date].map((fix, fixIndex) => (
                                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={fix.id}>
                                                <Paper
                                                    radius="md"
                                                    p="md"
                                                    withBorder
                                                    onClick={() =>
                                                        navigateWithTransition(`/match/${fix.id}`)
                                                    }
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: '0.2s ease',
                                                        position: 'relative',
                                                        animation: `fadeInUp 0.6s ease-out ${(dateIndex * 0.1) + (fixIndex * 0.05)}s both`,
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
                                                        {fix.isLive && (
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
                                                        {fix.hasTickets && (
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
                                                            <Stack gap="xs" align="center" justify="center" style={{ minHeight: '60px' }}>
                                                                <Image 
                                                                    src={teamCrests[fix.homeTeam] || ''} 
                                                                    width={40} 
                                                                    height={40} 
                                                                    fit="contain"
                                                                    style={{ minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px' }}
                                                                />
                                                                <Image 
                                                                    src={teamCrests[fix.awayTeam] || ''} 
                                                                    width={40} 
                                                                    height={40} 
                                                                    fit="contain"
                                                                    style={{ minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px' }}
                                                                />
                                                            </Stack>
                                                        </Grid.Col>

                                                        {/* Team Names */}
                                                        <Grid.Col span={6}>
                                                            <Stack gap="xs" justify="center">
                                                                <Text size="sm" fw={500} style={{ wordBreak: 'break-word' }}>{fix.homeTeam}</Text>
                                                                <Text size="sm" fw={500} style={{ wordBreak: 'break-word' }}>{fix.awayTeam}</Text>
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
                                                        <Grid.Col span={3}>
                                                            <Stack gap="xs" align="flex-end" justify="center">
                                                                {fix.homeScore !== undefined && fix.awayScore !== undefined ? (
                                                                    <>
                                                                        <Text size="sm" fw={600}>{fix.homeScore}</Text>
                                                                        <Text size="sm" fw={600}>{fix.awayScore}</Text>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Text size="sm" c="dimmed">Kickoff</Text>
                                                                        <Text size="sm">
                                                                            {new Date(fix.date).toLocaleTimeString(undefined, {
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
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
