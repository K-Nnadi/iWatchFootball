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

interface Team {
    id: number;
    name: string;
    crest: string;
    type: 'club' | 'national';
    number?: number;
}

interface Player {
    id: string;
    name: string;
    position: string;
    age: number;
    nationality: string;
    teams: Team[];
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
        teams: [
            {
                id: 1,
                name: 'Manchester City',
                crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
                type: 'club',
                number: 9,
            },
            {
                id: 2,
                name: 'Norway',
                crest: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg',
                type: 'national',
            },
        ],
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
        teams: [
            {
                id: 1,
                name: 'Manchester City',
                crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
                type: 'club',
                number: 17,
            },
            {
                id: 3,
                name: 'Belgium',
                crest: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg',
                type: 'national',
            },
        ],
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
        teams: [
            {
                id: 1,
                name: 'Manchester City',
                crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
                type: 'club',
                number: 3,
            },
            {
                id: 4,
                name: 'Portugal',
                crest: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg',
                type: 'national',
            },
        ],
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
                    padding: '3rem 2.5rem',
                    backgroundColor: 'var(--modern-card-bg)',
                    border: '1px solid var(--modern-card-border)',
                    borderRadius: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}
                className="modern-card"
            >
                {/* Subtle background accent */}
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '40%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.03) 0%, transparent 100%)',
                        pointerEvents: 'none',
                    }}
                />
                
                <Group align="flex-start" gap="xl" wrap="wrap">
                    <Box style={{ position: 'relative' }}>
                        <Avatar
                            size={180}
                            radius={0}
                            style={{
                                backgroundColor: 'var(--modern-bg-tertiary)',
                                border: '4px solid var(--modern-lime)',
                                color: 'var(--modern-lime)',
                                fontWeight: 700,
                                fontSize: '3.5rem',
                                boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)',
                            }}
                        >
                        {getInitials(player.name)}
                    </Avatar>
                    {(() => {
                        const clubTeam = player.teams?.find(t => t.type === 'club');
                        return clubTeam?.number && (
                            <Badge
                                size="xl"
                                variant="light"
                                style={{
                                    position: 'absolute',
                                    bottom: '-10px',
                                    right: '-10px',
                                    backgroundColor: 'var(--modern-lime)',
                                    color: 'var(--modern-bg-primary)',
                                    border: '3px solid var(--modern-bg-primary)',
                                    fontSize: '1.25rem',
                                    padding: '0.5rem 0.75rem',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)',
                                }}
                            >
                                #{clubTeam.number}
                            </Badge>
                        );
                    })()}
                    </Box>

                    <Stack gap="md" style={{ flex: 1, minWidth: '300px' }}>
                        <Box>
                            <Title
                                order={1}
                                style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.03em',
                                    marginBottom: '0.5rem',
                                    lineHeight: 1.1,
                                }}
                            >
                                {player.name}
                            </Title>
                            <Group gap="lg" wrap="wrap" mt="md">
                                <Group gap="xs">
                                    <IconFlag size={20} style={{ color: 'var(--modern-lime)' }} />
                                    <Text size="md" fw={500} style={{ color: 'var(--modern-text-primary)' }}>
                                        {player.nationality}
                                    </Text>
                                </Group>
                                <Group gap="xs">
                                    <IconUser size={20} style={{ color: 'var(--modern-lime)' }} />
                                    <Text size="md" fw={500} style={{ color: 'var(--modern-text-primary)' }}>
                                        Age {player.age}
                                    </Text>
                                </Group>
                            </Group>
                        </Box>
                    </Stack>
                </Group>
            </Box>

            <Tabs defaultValue="overview" styles={{
                list: {
                    borderBottom: '2px solid var(--modern-card-border)',
                    marginBottom: '2.5rem',
                },
                tab: {
                    color: 'var(--modern-text-secondary)',
                    borderBottom: '3px solid transparent',
                    padding: '1.25rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&[data-active]': {
                        color: 'var(--modern-lime)',
                        borderBottomColor: 'var(--modern-lime)',
                        backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    },
                    '&:hover': {
                        color: 'var(--modern-lime)',
                        backgroundColor: 'rgba(0, 255, 136, 0.08)',
                        borderBottomColor: 'rgba(0, 255, 136, 0.3)',
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
                                {/* Current Teams Section */}
                                {player.teams && player.teams.length > 0 && (
                                    <Box
                                        style={{
                                            backgroundColor: 'var(--modern-card-bg)',
                                            border: '1px solid var(--modern-card-border)',
                                            padding: '2.5rem',
                                        }}
                                    >
                                        <Title 
                                            order={3} 
                                            mb="xl"
                                            style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 600,
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            Current Teams
                                        </Title>
                                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                            {player.teams.map((team) => (
                                                <Box
                                                    key={team.id}
                                                    onClick={() => team.type === 'club' && navigateWithTransition(`/team/${team.id}`)}
                                                    style={{
                                                        cursor: team.type === 'club' ? 'pointer' : 'default',
                                                        padding: '1.5rem',
                                                        backgroundColor: 'var(--modern-bg-tertiary)',
                                                        border: '2px solid var(--modern-card-border)',
                                                        borderRadius: 0,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (team.type === 'club') {
                                                            e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.2)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (team.type === 'club') {
                                                            e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }
                                                    }}
                                                >
                                                    <Group gap="md" align="center">
                                                        <Image
                                                            src={team.crest}
                                                            width={48}
                                                            height={48}
                                                            fit="contain"
                                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                                                        />
                                                        <Stack gap="xs" style={{ flex: 1 }}>
                                                            <Group justify="space-between" align="center" wrap="wrap">
                                                                <Text fw={600} size="lg" style={{ color: 'var(--modern-text-primary)' }}>
                                                                    {team.name}
                                                                </Text>
                                                                {team.number && (
                                                                    <Badge
                                                                        size="lg"
                                                                        variant="light"
                                                                        style={{
                                                                            backgroundColor: 'rgba(0, 255, 136, 0.15)',
                                                                            color: 'var(--modern-lime)',
                                                                            border: '1px solid var(--modern-lime)',
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        #{team.number}
                                                                    </Badge>
                                                                )}
                                                            </Group>
                                                            <Badge
                                                                variant="light"
                                                                style={{
                                                                    backgroundColor: team.type === 'club' 
                                                                        ? 'rgba(0, 255, 136, 0.1)' 
                                                                        : 'rgba(255, 255, 255, 0.1)',
                                                                    color: team.type === 'club' 
                                                                        ? 'var(--modern-lime)' 
                                                                        : 'var(--modern-text-secondary)',
                                                                    border: `1px solid ${team.type === 'club' ? 'var(--modern-lime)' : 'var(--modern-card-border)'}`,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.05em',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600,
                                                                    width: 'fit-content',
                                                                }}
                                                            >
                                                                {team.type === 'club' ? 'Club' : 'National Team'}
                                                            </Badge>
                                                        </Stack>
                                                    </Group>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                )}

                                {player.stats && (
                                    <Box
                                        style={{
                                            backgroundColor: 'var(--modern-card-bg)',
                                            border: '1px solid var(--modern-card-border)',
                                            padding: '2.5rem',
                                        }}
                                    >
                                        <Title 
                                            order={3} 
                                            mb="xl"
                                            style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 600,
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            Season Statistics
                                        </Title>
                                        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="lg">
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '2px solid var(--modern-card-border)',
                                                    padding: '2rem 1.5rem',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Text 
                                                    size="2.5rem" 
                                                    fw={700} 
                                                    c="var(--modern-lime)"
                                                    style={{
                                                        lineHeight: 1,
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    {player.stats.goals}
                                                </Text>
                                                <Text size="sm" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Goals
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '2px solid var(--modern-card-border)',
                                                    padding: '2rem 1.5rem',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Text 
                                                    size="2.5rem" 
                                                    fw={700} 
                                                    c="var(--modern-lime)"
                                                    style={{
                                                        lineHeight: 1,
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    {player.stats.assists}
                                                </Text>
                                                <Text size="sm" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Assists
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '2px solid var(--modern-card-border)',
                                                    padding: '2rem 1.5rem',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Text 
                                                    size="2.5rem" 
                                                    fw={700} 
                                                    c="var(--modern-lime)"
                                                    style={{
                                                        lineHeight: 1,
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    {player.stats.appearances}
                                                </Text>
                                                <Text size="sm" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Appearances
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '2px solid var(--modern-card-border)',
                                                    padding: '2rem 1.5rem',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Text 
                                                    size="2.5rem" 
                                                    fw={700} 
                                                    c="var(--modern-lime)"
                                                    style={{
                                                        lineHeight: 1,
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    {player.stats.yellowCards}
                                                </Text>
                                                <Text size="sm" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Yellow Cards
                                                </Text>
                                            </Card>
                                            <Card
                                                style={{
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '2px solid var(--modern-card-border)',
                                                    padding: '2rem 1.5rem',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Text 
                                                    size="2.5rem" 
                                                    fw={700} 
                                                    c="var(--modern-lime)"
                                                    style={{
                                                        lineHeight: 1,
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    {player.stats.redCards}
                                                </Text>
                                                <Text size="sm" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                        padding: '2.5rem',
                                    }}
                                >
                                    <Title 
                                        order={3} 
                                        mb="xl"
                                        style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 600,
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        Player Information
                                    </Title>
                                    <Stack gap="lg">
                                        {player.joinedDate && (
                                            <Box
                                                style={{
                                                    padding: '1.25rem',
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '1px solid var(--modern-card-border)',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                }}
                                            >
                                                <Group justify="space-between" wrap="wrap">
                                                    <Text c="dimmed" size="sm" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Joined
                                                    </Text>
                                                    <Text fw={600} size="md">
                                                        {new Date(player.joinedDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </Text>
                                                </Group>
                                            </Box>
                                        )}
                                        {player.contractUntil && (
                                            <Box
                                                style={{
                                                    padding: '1.25rem',
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '1px solid var(--modern-card-border)',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                                }}
                                            >
                                                <Group justify="space-between" wrap="wrap">
                                                    <Text c="dimmed" size="sm" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Contract Until
                                                    </Text>
                                                    <Text fw={600} size="md">
                                                        {new Date(player.contractUntil).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </Text>
                                                </Group>
                                            </Box>
                                        )}
                                        {player.marketValue && (
                                            <Box
                                                style={{
                                                    padding: '1.25rem',
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '2px solid var(--modern-lime)',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Group justify="space-between" wrap="wrap">
                                                    <Text c="dimmed" size="sm" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Market Value
                                                    </Text>
                                                    <Text fw={700} size="lg" c="var(--modern-lime)">
                                                        {player.marketValue}
                                                    </Text>
                                                </Group>
                                            </Box>
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
                                    padding: '2.5rem',
                                    position: 'sticky',
                                    top: '2rem',
                                }}
                            >
                                <Title 
                                    order={3} 
                                    mb="xl"
                                    style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    Quick Info
                                </Title>
                                <Stack gap="lg">
                                    <Box
                                        style={{
                                            padding: '1.25rem',
                                            backgroundColor: 'var(--modern-bg-tertiary)',
                                            border: '1px solid var(--modern-card-border)',
                                            transition: 'all 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                        }}
                                    >
                                        <Group justify="space-between" wrap="wrap">
                                            <Text c="dimmed" size="sm" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Position
                                            </Text>
                                            <Badge
                                                variant="light"
                                                style={{
                                                    backgroundColor: 'rgba(0, 255, 136, 0.15)',
                                                    color: 'var(--modern-lime)',
                                                    border: '1px solid var(--modern-lime)',
                                                    padding: '0.5rem 0.75rem',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {player.position}
                                            </Badge>
                                        </Group>
                                    </Box>
                                    <Box
                                        style={{
                                            padding: '1.25rem',
                                            backgroundColor: 'var(--modern-bg-tertiary)',
                                            border: '1px solid var(--modern-card-border)',
                                            transition: 'all 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                        }}
                                    >
                                        <Group justify="space-between" wrap="wrap">
                                            <Text c="dimmed" size="sm" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Nationality
                                            </Text>
                                            <Group gap="xs">
                                                <IconFlag size={18} style={{ color: 'var(--modern-lime)' }} />
                                                <Text fw={600} size="md">{player.nationality}</Text>
                                            </Group>
                                        </Group>
                                    </Box>
                                    <Box
                                        style={{
                                            padding: '1.25rem',
                                            backgroundColor: 'var(--modern-bg-tertiary)',
                                            border: '1px solid var(--modern-card-border)',
                                            transition: 'all 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--modern-card-border)';
                                        }}
                                    >
                                        <Group justify="space-between" wrap="wrap">
                                            <Text c="dimmed" size="sm" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Age
                                            </Text>
                                            <Text fw={600} size="md">{player.age} years</Text>
                                        </Group>
                                    </Box>
                                    {(() => {
                                        const clubTeam = player.teams?.find(t => t.type === 'club');
                                        return clubTeam?.number && (
                                            <Box
                                                style={{
                                                    padding: '1.25rem',
                                                    backgroundColor: 'var(--modern-bg-tertiary)',
                                                    border: '2px solid var(--modern-lime)',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Group justify="space-between" wrap="wrap">
                                                    <Text c="dimmed" size="sm" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Jersey Number
                                                    </Text>
                                                    <Text fw={700} size="xl" c="var(--modern-lime)">
                                                        #{clubTeam.number}
                                                    </Text>
                                                </Group>
                                            </Box>
                                        );
                                    })()}
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

