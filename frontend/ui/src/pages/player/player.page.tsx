import {
    Container,
    Title,
    Group,
    Image,
    Box,
    Tabs,
    Text,
    Badge,
    Stack,
    Center,
    Divider,
    Card,
    SimpleGrid,
    Avatar,
    Grid,
} from '@mantine/core';
import { IconShirt, IconCalendar, IconTrophy, IconFlag, IconUser, IconChartBar, IconSoccerField } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockTeams } from '../team/mockTeams';
import { useState, useMemo } from 'react';
import { usePageTransition } from '../../hooks/usePageTransition';
import '../../styles/modern.css';

interface PlayerStats {
    goals: number;
    assists: number;
    appearances: number;
    yellowCards: number;
    redCards: number;
}

interface Player {
    id: string;
    name: string;
    position: string;
    age: number;
    nationality: string;
    teamId: number;
    teamName: string;
    teamCrest: string;
    number?: number;
    stats?: PlayerStats;
    joinedDate?: string;
    contractUntil?: string;
    marketValue?: string;
}

// Mock player data - in real app, this would come from an API
const mockPlayers: Player[] = [
    {
        id: '1',
        name: 'Erling Haaland',
        position: 'Striker',
        age: 24,
        nationality: 'Norway',
        teamId: 1,
        teamName: 'Manchester City',
        teamCrest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        number: 9,
        stats: {
            goals: 52,
            assists: 9,
            appearances: 53,
            yellowCards: 3,
            redCards: 0,
        },
        joinedDate: '2022-07-01',
        contractUntil: '2027-06-30',
        marketValue: '€180M',
    },
    {
        id: '2',
        name: 'Kevin De Bruyne',
        position: 'Midfielder',
        age: 33,
        nationality: 'Belgium',
        teamId: 1,
        teamName: 'Manchester City',
        teamCrest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        number: 17,
        stats: {
            goals: 10,
            assists: 31,
            appearances: 49,
            yellowCards: 5,
            redCards: 0,
        },
        joinedDate: '2015-08-30',
        contractUntil: '2025-06-30',
        marketValue: '€60M',
    },
    {
        id: '3',
        name: 'Rúben Dias',
        position: 'Defender',
        age: 28,
        nationality: 'Portugal',
        teamId: 1,
        teamName: 'Manchester City',
        teamCrest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        number: 3,
        stats: {
            goals: 1,
            assists: 2,
            appearances: 43,
            yellowCards: 4,
            redCards: 0,
        },
        joinedDate: '2020-09-29',
        contractUntil: '2027-06-30',
        marketValue: '€80M',
    },
];

export function PlayerPage() {
    const { id } = useParams<{ id: string }>();
    const { navigateWithTransition } = usePageTransition();
    const navigate = useNavigate();

    const player = useMemo(() => {
        if (!id) return null;
        return mockPlayers.find(p => p.id === id);
    }, [id]);

    if (!player) {
        return (
            <Container size="xl" py="xl">
                <Center py="xl">
                    <Stack align="center" gap="md">
                        <IconUser size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                        <Title order={2}>Player Not Found</Title>
                        <Text c="dimmed">No player found with ID {id}</Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Container size="xl" py="xl">
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
                    <Avatar
                        size={140}
                        radius={0}
                        style={{
                            backgroundColor: 'var(--modern-bg-tertiary)',
                            border: '3px solid var(--modern-lime)',
                            color: 'var(--modern-lime)',
                            fontWeight: 700,
                            fontSize: '2.5rem',
                        }}
                    >
                        {getInitials(player.name)}
                    </Avatar>

                    <Stack gap="sm" style={{ flex: 1 }}>
                        <Group gap="md" align="center" wrap="wrap">
                            <Title
                                order={1}
                                style={{
                                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {player.name}
                            </Title>
                            {player.number && (
                                <Badge
                                    size="xl"
                                    variant="light"
                                    style={{
                                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                        color: 'var(--modern-lime)',
                                        border: '2px solid var(--modern-lime)',
                                        fontSize: '1.5rem',
                                        padding: '0.5rem 1rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    #{player.number}
                                </Badge>
                            )}
                        </Group>
                        <Group gap="lg" wrap="wrap">
                            <Group gap="xs">
                                <IconShirt size={18} style={{ color: 'var(--modern-text-secondary)' }} />
                                <Text size="sm" c="dimmed">
                                    {player.position}
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <IconFlag size={18} style={{ color: 'var(--modern-text-secondary)' }} />
                                <Text size="sm" c="dimmed">
                                    {player.nationality}
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <IconUser size={18} style={{ color: 'var(--modern-text-secondary)' }} />
                                <Text size="sm" c="dimmed">
                                    Age {player.age}
                                </Text>
                            </Group>
                        </Group>
                        <Group gap="md" mt="md">
                            <Box
                                onClick={() => navigateWithTransition(`/team/${player.teamId}`)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                    border: '1px solid var(--modern-card-border)',
                                    borderRadius: 0,
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Group gap="sm">
                                    <Image
                                        src={player.teamCrest}
                                        width={24}
                                        height={24}
                                        fit="contain"
                                    />
                                    <Text fw={500} size="sm">
                                        {player.teamName}
                                    </Text>
                                </Group>
                            </Box>
                        </Group>
                    </Stack>
                </Group>
            </Box>

            <Tabs defaultValue="overview" styles={{
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
                    <Tabs.Tab value="overview" leftSection={<IconChartBar size={18} />}>
                        Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="stats" leftSection={<IconChartBar size={18} />}>
                        Statistics
                    </Tabs.Tab>
                    <Tabs.Tab value="career" leftSection={<IconTrophy size={18} />}>
                        Career
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="xl">
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <Stack gap="xl">
                                {player.stats && (
                                    <Box
                                        style={{
                                            backgroundColor: 'var(--modern-card-bg)',
                                            border: '1px solid var(--modern-card-border)',
                                            padding: '2rem',
                                        }}
                                    >
                                        <Title order={3} mb="lg">
                                            Season Statistics
                                        </Title>
                                        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '1px solid var(--modern-card-border)',
                                                    padding: '1.5rem',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Text size="xl" fw={700} c="var(--modern-lime)">
                                                    {player.stats.goals}
                                                </Text>
                                                <Text size="sm" c="dimmed" mt="xs">
                                                    Goals
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '1px solid var(--modern-card-border)',
                                                    padding: '1.5rem',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Text size="xl" fw={700} c="var(--modern-lime)">
                                                    {player.stats.assists}
                                                </Text>
                                                <Text size="sm" c="dimmed" mt="xs">
                                                    Assists
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '1px solid var(--modern-card-border)',
                                                    padding: '1.5rem',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Text size="xl" fw={700} c="var(--modern-lime)">
                                                    {player.stats.appearances}
                                                </Text>
                                                <Text size="sm" c="dimmed" mt="xs">
                                                    Appearances
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '1px solid var(--modern-card-border)',
                                                    padding: '1.5rem',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Text size="xl" fw={700} c="var(--modern-lime)">
                                                    {player.stats.yellowCards}
                                                </Text>
                                                <Text size="sm" c="dimmed" mt="xs">
                                                    Yellow Cards
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '1px solid var(--modern-card-border)',
                                                    padding: '1.5rem',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Text size="xl" fw={700} c="var(--modern-lime)">
                                                    {player.stats.redCards}
                                                </Text>
                                                <Text size="sm" c="dimmed" mt="xs">
                                                    Red Cards
                                                </Text>
                                            </Card>
                                        </SimpleGrid>
                                    </Box>
                                )}

                                <Box
                                    style={{
                                        backgroundColor: 'var(--modern-card-bg)',
                                        border: '1px solid var(--modern-card-border)',
                                        padding: '2rem',
                                    }}
                                >
                                    <Title order={3} mb="lg">
                                        Player Information
                                    </Title>
                                    <Stack gap="md">
                                        {player.joinedDate && (
                                            <Group justify="space-between">
                                                <Text c="dimmed">Joined</Text>
                                                <Text fw={500}>
                                                    {new Date(player.joinedDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </Text>
                                            </Group>
                                        )}
                                        {player.contractUntil && (
                                            <Group justify="space-between">
                                                <Text c="dimmed">Contract Until</Text>
                                                <Text fw={500}>
                                                    {new Date(player.contractUntil).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </Text>
                                            </Group>
                                        )}
                                        {player.marketValue && (
                                            <Group justify="space-between">
                                                <Text c="dimmed">Market Value</Text>
                                                <Text fw={500} c="var(--modern-lime)">
                                                    {player.marketValue}
                                                </Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Box
                                style={{
                                    backgroundColor: 'var(--modern-card-bg)',
                                    border: '1px solid var(--modern-card-border)',
                                    padding: '2rem',
                                    position: 'sticky',
                                    top: '2rem',
                                }}
                            >
                                <Title order={3} mb="lg">
                                    Quick Info
                                </Title>
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Text c="dimmed">Position</Text>
                                        <Badge
                                            variant="light"
                                            style={{
                                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                color: 'var(--modern-lime)',
                                                border: '1px solid rgba(0, 255, 136, 0.2)',
                                            }}
                                        >
                                            {player.position}
                                        </Badge>
                                    </Group>
                                    <Divider />
                                    <Group justify="space-between">
                                        <Text c="dimmed">Nationality</Text>
                                        <Group gap="xs">
                                            <IconFlag size={16} style={{ color: 'var(--modern-text-secondary)' }} />
                                            <Text fw={500}>{player.nationality}</Text>
                                        </Group>
                                    </Group>
                                    <Divider />
                                    <Group justify="space-between">
                                        <Text c="dimmed">Age</Text>
                                        <Text fw={500}>{player.age} years</Text>
                                    </Group>
                                    {player.number && (
                                        <>
                                            <Divider />
                                            <Group justify="space-between">
                                                <Text c="dimmed">Jersey Number</Text>
                                                <Text fw={700} size="lg" c="var(--modern-lime)">
                                                    #{player.number}
                                                </Text>
                                            </Group>
                                        </>
                                    )}
                                </Stack>
                            </Box>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>

                <Tabs.Panel value="stats" pt="xl">
                    <Center py="xl">
                        <Stack align="center" gap="md">
                            <IconChartBar size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                            <Text size="lg" c="dimmed" fw={500}>
                                Detailed statistics coming soon
                            </Text>
                        </Stack>
                    </Center>
                </Tabs.Panel>

                <Tabs.Panel value="career" pt="xl">
                    <Center py="xl">
                        <Stack align="center" gap="md">
                            <IconTrophy size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                            <Text size="lg" c="dimmed" fw={500}>
                                Career history coming soon
                            </Text>
                        </Stack>
                    </Center>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}

