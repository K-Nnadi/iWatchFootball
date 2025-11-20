import { Card, Image, Text, Title, Stack, Group, Divider, ScrollArea } from '@mantine/core';
import { UserGame } from '../pages/logs.page';

interface PlayerStats {
    rank: number;
    name: string;
    team: string;
    crest: string; // Team crest URL
    image?: string; // Player image URL (only for 1st place)
    value: number;
}
interface StatCategory {
    title: string;
    topPlayers: PlayerStats[];
}

interface StatsTabProps {
    loggedFixtures: UserGame[];
}

const NewStatsTab = ({ loggedFixtures }: StatsTabProps) => {
    // Calculate stats from logged fixtures
    const calculateStats = (): StatCategory[] => {
        const stats: {
            goals: Record<string, number>;
            assists: Record<string, number>;
            venues: Record<string, number>;
            teams: Record<string, number>;
        } = {
            goals: {},
            assists: {},
            venues: {},
            teams: {},
        };

        loggedFixtures.forEach((fixture) => {
            // Count venues
            if (fixture.venue) {
                stats.venues[fixture.venue] = (stats.venues[fixture.venue] || 0) + 1;
            }
            
            // Count teams
            stats.teams[fixture.homeTeam] = (stats.teams[fixture.homeTeam] || 0) + 1;
            stats.teams[fixture.awayTeam] = (stats.teams[fixture.awayTeam] || 0) + 1;

            // Count goals and assists from events
            fixture.events?.forEach((event) => {
                if (event.type === 'goal') {
                    // Extract player name from description if available
                    const playerMatch = event.description.match(/(?:by|from)\s+([^,]+)/i);
                    if (playerMatch) {
                        const player = playerMatch[1].trim();
                        stats.goals[player] = (stats.goals[player] || 0) + 1;
                    }
                }
                if (event.description.toLowerCase().includes('assist')) {
                    const playerMatch = event.description.match(/(?:by|from)\s+([^,]+)/i);
                    if (playerMatch) {
                        const player = playerMatch[1].trim();
                        stats.assists[player] = (stats.assists[player] || 0) + 1;
                    }
                }
            });
        });

        // Convert to sorted arrays and format for display
        const formatStats = (data: Record<string, number>, title: string): StatCategory => {
            const sorted = Object.entries(data)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, value], index) => ({
                    rank: index + 1,
                    name,
                    team: '', // Could be enhanced to extract team info
                    crest: '',
                    value,
                }));

            return {
                title,
                topPlayers: sorted,
            };
        };

        const result: StatCategory[] = [];
        
        if (Object.keys(stats.goals).length > 0) {
            result.push(formatStats(stats.goals, 'Top Goals'));
        }
        if (Object.keys(stats.assists).length > 0) {
            result.push(formatStats(stats.assists, 'Top Assists'));
        }
        if (Object.keys(stats.venues).length > 0) {
            result.push(formatStats(stats.venues, 'Most Visited Venues'));
        }
        if (Object.keys(stats.teams).length > 0) {
            result.push(formatStats(stats.teams, 'Most Viewed Teams'));
        }

        // If no stats available, return empty array
        return result.length > 0 ? result : [];
    };

    const stats = calculateStats();
    if (stats.length === 0) {
        return (
            <Stack gap="md" p="md" style={{ textAlign: 'center' }}>
                <Text size="lg" c="dimmed">No statistics available for the selected filter</Text>
                <Text size="sm" c="dimmed">Add more matches or change the filter to see statistics</Text>
            </Stack>
        );
    }

    return (
        <ScrollArea h="100vh" p="md">
            <Stack gap="xl">
                {stats.map((category) => (
                    <Stack key={category.title} gap="md">
                        <Title order={3} c="white">{category.title}</Title>
                        <Card shadow="sm" radius="md" withBorder style={{ backgroundColor: 'var(--modern-dark-gray)' }}>
                            <Stack gap="sm">
                                {category.topPlayers.map((player, index) => (
                                    <Card 
                                        key={`${category.title}-${player.rank}`} 
                                        p="md" 
                                        shadow={index === 0 ? 'md' : 'xs'} 
                                        radius="md"
                                        style={{ backgroundColor: 'var(--modern-black)' }}
                                    >
                                        <Group>
                                            {player.image && (
                                                <Image src={player.image} width={50} height={50} radius="50%" />
                                            )}
                                            <Stack gap={0}>
                                                <Text fw={700} size="lg" c="white">
                                                    {player.name}
                                                </Text>
                                                {player.team && (
                                                    <Group gap="xs">
                                                        {player.crest && (
                                                            <Image src={player.crest} width={20} height={20} />
                                                        )}
                                                        <Text size="sm" c="dimmed">
                                                            {player.team}
                                                        </Text>
                                                    </Group>
                                                )}
                                            </Stack>
                                            <Text fw={700} size="xl" ml="auto" c="var(--modern-lime)">
                                                {player.value}
                                            </Text>
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        </Card>
                        <Divider />
                    </Stack>
                ))}
            </Stack>
        </ScrollArea>
    );
}
export default NewStatsTab