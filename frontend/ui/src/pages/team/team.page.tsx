// TeamPage.tsx
import {
    Container,
    Title,
    Group,
    Image,
    Box,
    Tabs,
    Text,
    Badge,
    SegmentedControl,
    Select,
    Stack,
    Center,
    Divider,
    Card,
    SimpleGrid,
    Avatar,
} from '@mantine/core';
import { IconUsers, IconCalendar, IconExchange, IconTrophy, IconFlag, IconBuilding, IconUser, IconMapPin } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { mockTeams } from "./mockTeams";
import { useState } from "react";
import { usePageTransition } from '../../hooks/usePageTransition';
import '../../styles/modern.css';

export function TeamPage() {
    const { id } = useParams();
    const { navigateWithTransition } = usePageTransition();
    const numericId = Number(id);
    const [selectedComp, setSelectedComp] = useState<string>('All Competitions');
    const [homeAwayFilter, setHomeAwayFilter] = useState<'all' | 'home' | 'away'>('all');

    // Map player names to IDs (in real app, this would come from API)
    const getPlayerId = (playerName: string, teamId: number): string => {
        const playerIdMap: Record<string, Record<number, string>> = {
            'Erling Haaland': { 1: '1' },
            'Kevin De Bruyne': { 1: '2' },
            'Rúben Dias': { 1: '3' },
        };
        return playerIdMap[playerName]?.[teamId] || '1';
    };

// Get unique competitions team is in


// Format for Select component
    // Mock data for now
    const teams = mockTeams
    const team = teams.find(t => t.id === numericId);
    if (!team) {
        return (
            <Container>
                <Title order={2}>Team Not Found</Title>
                <Text color="dimmed">No team found with ID {id}</Text>
            </Container>
        );
    }
    const competitions = Array.from(new Set(team.fixtures.map(f => f.competition)));
    const compOptions = ['All Competitions', ...competitions];

    const filteredFixtures = team.fixtures.filter((f) => {
        const matchesComp = selectedComp === 'All Competitions' || f.competition === selectedComp;
        const matchesVenue =
            homeAwayFilter === 'all'
                ? true
                : homeAwayFilter === 'home'
                    ? f.home === true
                    : f.home === false;
        return matchesComp && matchesVenue;
    });

    // Group squad by position
    const groupSquadByPosition = (squad: typeof team.squad) => {
        type Player = typeof team.squad[0];
        const grouped = squad.reduce((acc, player) => {
            const position = player.position;
            if (!acc[position]) {
                acc[position] = [];
            }
            acc[position].push(player);
            return acc;
        }, {} as Record<string, Player[]>);
        
        // Sort positions in a logical order
        const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Winger'];
        const sorted: Record<string, Player[]> = {};
        
        positionOrder.forEach(pos => {
            if (grouped[pos]) {
                sorted[pos] = grouped[pos];
            }
        });
        
        // Add any remaining positions
        Object.keys(grouped).forEach(pos => {
            if (!sorted[pos]) {
                sorted[pos] = grouped[pos];
            }
        });
        
        return sorted;
    };

    const groupedSquad = groupSquadByPosition(team.squad);

    // Get player initials for avatar
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
                    <Box
                        style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--modern-bg-tertiary)',
                            borderRadius: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '140px',
                            minHeight: '140px',
                        }}
                    >
                        <Image
                            src={team.crest}
                            alt={team.name}
                            width={120}
                            height={120}
                            fit="contain"
                            style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                            }}
                        />
                    </Box>

                    <Stack gap="sm" style={{ flex: 1 }}>
                        <Title
                            order={1}
                            style={{
                                fontSize: 'clamp(2rem, 5vw, 3rem)',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {team.name}
                        </Title>
                        <Group gap="lg" wrap="wrap">
                            <Group gap="xs">
                                <IconBuilding size={18} style={{ color: 'var(--modern-text-secondary)' }} />
                                <Text size="sm" c="dimmed">
                                    Founded {team.founded}
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <IconMapPin size={18} style={{ color: 'var(--modern-text-secondary)' }} />
                                <Text size="sm" c="dimmed">
                                    {team.stadium}
                                </Text>
                            </Group>
                        </Group>
                    </Stack>

                    <Box
                        style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--modern-bg-tertiary)',
                            border: '1px solid var(--modern-card-border)',
                            borderRadius: 0,
                            minWidth: '200px',
                        }}
                    >
                        <Group gap="md">
                            <Image
                                src={team.manager.image}
                                width={60}
                                height={60}
                                radius={0}
                                style={{
                                    border: '2px solid var(--modern-card-border)',
                                }}
                            />
                            <Stack gap="xs">
                                <Group gap="xs">
                                    <IconUser size={16} style={{ color: 'var(--modern-text-secondary)' }} />
                                    <Text size="xs" c="dimmed" fw={500}>
                                        Manager
                                    </Text>
                                </Group>
                                <Text fw={600} size="md">
                                    {team.manager.name}
                                </Text>
                                <Group gap="xs">
                                    <IconFlag size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                                    <Text size="xs" c="dimmed">
                                        {team.manager.nationality}
                                    </Text>
                                </Group>
                            </Stack>
                        </Group>
                    </Box>
                </Group>
            </Box>

            <Tabs defaultValue="squad" styles={{
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
                    <Tabs.Tab value="squad" leftSection={<IconUsers size={18} />}>
                        Squad
                    </Tabs.Tab>
                    <Tabs.Tab value="fixtures" leftSection={<IconCalendar size={18} />}>
                        Fixtures
                    </Tabs.Tab>
                    <Tabs.Tab value="transfers" leftSection={<IconExchange size={18} />}>
                        Transfers
                    </Tabs.Tab>
                    <Tabs.Tab value="achievements" leftSection={<IconTrophy size={18} />}>
                        Achievements
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="squad" pt="xl">
                    <Stack gap="xl">
                        {Object.entries(groupedSquad).map(([position, players], positionIndex) => (
                            <Box key={position}>
                                <Group gap="md" mb="lg" align="center">
                                    <Box
                                        style={{
                                            width: '4px',
                                            height: '24px',
                                            backgroundColor: 'var(--modern-lime)',
                                        }}
                                    />
                                    <Title
                                        order={3}
                                        style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {position}
                                    </Title>
                                    <Badge
                                        variant="light"
                                        style={{
                                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                            color: 'var(--modern-lime)',
                                            border: '1px solid rgba(0, 255, 136, 0.2)',
                                        }}
                                    >
                                        {players.length} {players.length === 1 ? 'player' : 'players'}
                                    </Badge>
                                </Group>
                                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                                    {players.map((player, playerIndex) => (
                                        <Card
                                            key={player.name}
                                            className="modern-card"
                                            padding="lg"
                                            radius={0}
                                            withBorder={false}
                                            onClick={() => {
                                                const playerId = getPlayerId(player.name, numericId);
                                                navigateWithTransition(`/player/${playerId}`, { transitionType: 'loading', duration: 1200 });
                                            }}
                                            style={{
                                                animation: `fadeInUp 0.6s ease-out ${(positionIndex * 0.1) + (playerIndex * 0.05)}s both`,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Group gap="md" align="flex-start">
                                                <Avatar
                                                    size={64}
                                                    radius={0}
                                                    style={{
                                                        backgroundColor: 'var(--modern-bg-tertiary)',
                                                        border: '2px solid var(--modern-lime)',
                                                        color: 'var(--modern-lime)',
                                                        fontWeight: 700,
                                                        fontSize: '1.25rem',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {getInitials(player.name)}
                                                </Avatar>
                                                <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                                    <Text
                                                        fw={600}
                                                        size="md"
                                                        style={{
                                                            lineHeight: 1.2,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {player.name}
                                                    </Text>
                                                    <Badge
                                                        variant="light"
                                                        size="sm"
                                                        style={{
                                                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                            color: 'var(--modern-lime)',
                                                            border: '1px solid rgba(0, 255, 136, 0.2)',
                                                            width: 'fit-content',
                                                        }}
                                                    >
                                                        {player.position}
                                                    </Badge>
                                                    <Group gap="xs" wrap="nowrap">
                                                        <IconFlag size={14} style={{ color: 'var(--modern-text-secondary)', flexShrink: 0 }} />
                                                        <Text size="sm" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {player.nationality}
                                                        </Text>
                                                    </Group>
                                                    <Group gap="xs">
                                                        <Text size="sm" c="dimmed">
                                                            Age:
                                                        </Text>
                                                        <Text size="sm" fw={500}>
                                                            {player.age}
                                                        </Text>
                                                    </Group>
                                                </Stack>
                                            </Group>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                                {positionIndex < Object.keys(groupedSquad).length - 1 && (
                                    <Divider color="var(--modern-card-border)" mt="xl" mb="xl" />
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="fixtures" pt="xl">
                    {/* Filters */}
                    <Group mb="xl" gap="md" wrap="wrap">
                        <Select
                            label="Competition"
                            data={compOptions}
                            value={selectedComp}
                            onChange={(val) => setSelectedComp(val || 'All Competitions')}
                            clearable={false}
                            style={{ flex: 1, minWidth: '200px' }}
                            styles={{
                                input: {
                                    backgroundColor: 'var(--modern-card-bg)',
                                    borderColor: 'var(--modern-card-border)',
                                    color: 'var(--modern-text-primary)',
                                },
                                label: {
                                    color: 'var(--modern-text-primary)',
                                },
                            }}
                        />

                        <Box style={{ flex: 1, minWidth: '200px' }}>
                            <Text size="sm" fw={500} mb="xs" style={{ color: 'var(--modern-text-primary)' }}>
                                Venue
                            </Text>
                            <SegmentedControl
                                value={homeAwayFilter}
                                onChange={(val) => setHomeAwayFilter(val as 'all' | 'home' | 'away')}
                                data={[
                                    { label: 'All', value: 'all' },
                                    { label: 'Home', value: 'home' },
                                    { label: 'Away', value: 'away' },
                                ]}
                                styles={{
                                    root: {
                                        backgroundColor: 'var(--modern-card-bg)',
                                    },
                                    label: {
                                        color: 'var(--modern-text-primary)',
                                    },
                                    indicator: {
                                        backgroundColor: 'var(--modern-lime)',
                                    },
                                }}
                            />
                        </Box>
                    </Group>

                    {/* Filtered Fixtures */}
                    {filteredFixtures.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconCalendar size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                                <Text size="lg" c="dimmed" fw={500}>
                                    No matches found
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Try adjusting your filters
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            {filteredFixtures.map((f, i) => (
                                <Card
                                    key={i}
                                    className="modern-card"
                                    padding="xl"
                                    radius={0}
                                    withBorder={false}
                                    style={{
                                        animation: `fadeInUp 0.6s ease-out ${i * 0.05}s both`,
                                    }}
                                >
                                    <Stack gap="sm">
                                        <Group justify="space-between" align="flex-start">
                                            <Badge
                                                variant="light"
                                                style={{
                                                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                    color: 'var(--modern-lime)',
                                                    border: '1px solid rgba(0, 255, 136, 0.2)',
                                                }}
                                            >
                                                {f.competition}
                                            </Badge>
                                            <Badge
                                                variant={f.home ? 'filled' : 'outline'}
                                                style={{
                                                    backgroundColor: f.home ? 'var(--modern-lime)' : 'transparent',
                                                    color: f.home ? 'var(--modern-bg-primary)' : 'var(--modern-lime)',
                                                    borderColor: 'var(--modern-lime)',
                                                }}
                                            >
                                                {f.home ? 'Home' : 'Away'}
                                            </Badge>
                                        </Group>
                                        <Divider color="var(--modern-card-border)" />
                                        <Text fw={600} size="lg" style={{ textAlign: 'center' }}>
                                            vs {f.opponent}
                                        </Text>
                                        <Group justify="center" gap="xs">
                                            <IconCalendar size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                                            <Text size="sm" c="dimmed">
                                                {new Date(f.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </Text>
                                        </Group>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>


                <Tabs.Panel value="transfers" pt="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                        {/* Transfers In */}
                        <Box
                            style={{
                                backgroundColor: 'var(--modern-card-bg)',
                                border: '1px solid var(--modern-card-border)',
                                padding: '2rem',
                            }}
                        >
                            <Group gap="xs" mb="lg">
                                <IconExchange size={20} style={{ color: 'var(--modern-lime)' }} />
                                <Title order={3} style={{ color: 'var(--modern-lime)' }}>
                                    Transfers In
                                </Title>
                            </Group>
                            {team.transfers.ins.length === 0 ? (
                                <Text c="dimmed">No incoming transfers</Text>
                            ) : (
                                <Stack gap="md">
                                    {team.transfers.ins.map((t) => (
                                        <Card
                                            key={t.name}
                                            style={{
                                                backgroundColor: 'var(--modern-bg-tertiary)',
                                                border: '1px solid var(--modern-card-border)',
                                                padding: '1rem',
                                            }}
                                        >
                                            <Group justify="space-between" align="center">
                                                <Text fw={500}>{t.name}</Text>
                                                <Badge
                                                    variant="light"
                                                    style={{
                                                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                        color: 'var(--modern-lime)',
                                                        border: '1px solid rgba(0, 255, 136, 0.2)',
                                                    }}
                                                >
                                                    {t.fee}
                                                </Badge>
                                            </Group>
                                        </Card>
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        {/* Transfers Out */}
                        <Box
                            style={{
                                backgroundColor: 'var(--modern-card-bg)',
                                border: '1px solid var(--modern-card-border)',
                                padding: '2rem',
                            }}
                        >
                            <Group gap="xs" mb="lg">
                                <IconExchange size={20} style={{ color: 'var(--modern-text-secondary)' }} />
                                <Title order={3}>
                                    Transfers Out
                                </Title>
                            </Group>
                            {team.transfers.outs.length === 0 ? (
                                <Text c="dimmed">No outgoing transfers</Text>
                            ) : (
                                <Stack gap="md">
                                    {team.transfers.outs.map((t) => (
                                        <Card
                                            key={t.name}
                                            style={{
                                                backgroundColor: 'var(--modern-bg-tertiary)',
                                                border: '1px solid var(--modern-card-border)',
                                                padding: '1rem',
                                            }}
                                        >
                                            <Group justify="space-between" align="center">
                                                <Text fw={500}>{t.name}</Text>
                                                <Badge
                                                    variant="outline"
                                                    style={{
                                                        color: 'var(--modern-text-secondary)',
                                                        borderColor: 'var(--modern-card-border)',
                                                    }}
                                                >
                                                    {t.fee}
                                                </Badge>
                                            </Group>
                                        </Card>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </SimpleGrid>
                </Tabs.Panel>

                <Tabs.Panel value="achievements" pt="xl">
                    {team.achievements.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconTrophy size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                                <Text size="lg" c="dimmed" fw={500}>
                                    No achievements recorded
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                            {team.achievements.map((a, index) => (
                                <Card
                                    key={a.title}
                                    className="modern-card"
                                    padding="xl"
                                    radius={0}
                                    withBorder={false}
                                    style={{
                                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                                    }}
                                >
                                    <Stack gap="md">
                                        <Group gap="xs">
                                            <IconTrophy size={24} style={{ color: 'var(--modern-lime)' }} />
                                            <Title order={4} style={{ flex: 1 }}>
                                                {a.title}
                                            </Title>
                                        </Group>
                                        <Divider color="var(--modern-card-border)" />
                                        <Group gap="xs" wrap="wrap">
                                            {a.years.map((year) => (
                                                <Badge
                                                    key={year}
                                                    variant="light"
                                                    style={{
                                                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                        color: 'var(--modern-lime)',
                                                        border: '1px solid rgba(0, 255, 136, 0.2)',
                                                    }}
                                                >
                                                    {year}
                                                </Badge>
                                            ))}
                                        </Group>
                                        <Text size="sm" c="dimmed" mt="xs">
                                            {a.years.length} {a.years.length === 1 ? 'title' : 'titles'}
                                        </Text>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
