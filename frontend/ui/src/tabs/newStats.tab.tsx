import { Card, Image, Text, Title, Stack, Group, Divider, ScrollArea } from '@mantine/core';

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
    stats: StatCategory[];
}

const NewStatsTab = () => {
    const stats = [
        {
            title: 'Goals',
            topPlayers: [
                { rank: 1, name: 'Mohamed Salah', team: 'Liverpool', teamLogo: '/liverpool.png', playerImage: '/salah.png', value: 25 },
                { rank: 2, name: 'Erling Haaland', team: 'Manchester City', teamLogo: '/city.png', playerImage: '/haaland.png', value: 20 },
                { rank: 3, name: 'Alexander Isak', team: 'Newcastle United', teamLogo: '/newcastle.png', playerImage: '/isak.png', value: 19 },
            ],
        },
        {
            title: 'Most Assists',
            topPlayers: [
                { rank: 1, name: 'Mohamed Salah', team: 'Liverpool', teamLogo: '/liverpool.png', playerImage: '/salah.png', value: 17 },
                { rank: 2, name: 'Mikkel Damsgaard', team: 'Brentford', teamLogo: '/brentford.png', playerImage: '/damsgaard.png', value: 10 },
                { rank: 3, name: 'Antonee Robinson', team: 'Fulham', teamLogo: '/fulham.png', playerImage: '/robinson.png', value: 10 },
            ],
        },
    ];
    return (
        <ScrollArea h="100vh" p="md">
            <Stack spacing="xl">
                {stats.map((category) => (
                    <Stack key={category.title} spacing="md">
                        <Title order={3}>{category.title}</Title>
                        <Card shadow="sm" radius="md" withBorder>
                            <Stack spacing="sm">
                                {category.topPlayers.map((player, index) => (
                                    <Card key={player.rank} p="md" shadow={index === 0 ? 'md' : 'xs'} radius="md">
                                        <Group>
                                            <Image src={player.playerImage} width={50} height={50} radius="50%" />
                                            <Stack spacing={0}>
                                                <Text fw={700} size="lg">
                                                    {player.name}
                                                </Text>
                                                <Group spacing="xs">
                                                    <Image src={player.teamLogo} width={20} height={20} />
                                                    <Text size="sm" color="dimmed">
                                                        {player.team}
                                                    </Text>
                                                </Group>
                                            </Stack>
                                            <Text fw={700} size="xl" ml="auto">
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