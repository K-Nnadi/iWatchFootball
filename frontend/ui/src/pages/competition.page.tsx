import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container, LoadingOverlay, Tabs, Text, Box, Group, Badge,
    Stack, Center, Table, Select, ThemeIcon,
} from '@mantine/core';
import { IconTable, IconCalendar, IconWorld, IconFlag, IconTrophy, IconArrowUp, IconArrowDown, IconMinus } from '@tabler/icons-react';
import { ModernCard, ModernH2, ModernBody } from '../components/modern';
import { useGetOneCompetition } from '@iWatchFootball/clients/controllers/competition';
import { useGetQueryTeamCompetitionSeason } from '@iWatchFootball/clients/controllers/team-competition-season';
import { useGetAllSeason } from '@iWatchFootball/clients/controllers/season';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { clientInstance } from '@iWatchFootball/clients/client-instance';
import { useQuery } from '@tanstack/react-query';
import '../styles/modern.css';

interface CompetitionStanding {
    id: number;
    teamCompetitionSeasonId: number;
    position: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form?: string;
    positionChange?: number;
}

function useGetStandings(tcsIds: number[]) {
    return useQuery({
        queryKey: ['/competitionStanding/query', tcsIds],
        queryFn: () => clientInstance<CompetitionStanding[]>({
            url: '/competitionStanding/query',
            method: 'GET',
            params: { where: { teamCompetitionSeasonId: { $in: tcsIds } }, take: 200 },
        }),
        enabled: tcsIds.length > 0,
    });
}

export function CompetitionPage() {
    const { id: competitionIdStr } = useParams<{ id: string }>();
    const competitionId = Number(competitionIdStr);

    const { data: competition, isLoading: isLoadingComp } = useGetOneCompetition(competitionId);
    const { data: allSeasons = [] } = useGetAllSeason();

    // All TCS rows for this competition (to derive season list)
    const { data: tcsAll = [], isLoading: isLoadingTcs } = useGetQueryTeamCompetitionSeason(
        { where: { competitionId }, take: 500 } as any,
        { query: { enabled: !!competitionId } as any }
    );

    // Unique seasons present in this competition, sorted latest first
    const seasonOptions = useMemo(() => {
        const seen = new Set<number>();
        const ids: number[] = [];
        tcsAll.forEach(t => { if (!seen.has(t.seasonId)) { seen.add(t.seasonId); ids.push(t.seasonId); } });
        return ids
            .map(id => allSeasons.find(s => s.id === id))
            .filter(Boolean)
            .sort((a, b) => (b!.yearStart ?? 0) - (a!.yearStart ?? 0)) as typeof allSeasons;
    }, [tcsAll, allSeasons]);

    const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
    const activeSeasonId = selectedSeasonId
        ? Number(selectedSeasonId)
        : seasonOptions[0]?.id ?? null;

    // TCS rows for competition + selected season
    const tcsForSeason = useMemo(
        () => tcsAll.filter(t => t.seasonId === activeSeasonId),
        [tcsAll, activeSeasonId]
    );
    const tcsIds = useMemo(() => tcsForSeason.map(t => t.id), [tcsForSeason]);

    const { data: standings = [], isLoading: isLoadingStandings } = useGetStandings(tcsIds);

    // Teams lookup
    const { data: teamsData = [] } = useGetQueryTeam({ take: 500 } as any);
    const teamName = (tcsId: number) => {
        const tcs = tcsForSeason.find(t => t.id === tcsId);
        return teamsData.find(t => t.id === tcs?.teamId)?.name ?? `Team #${tcs?.teamId}`;
    };

    // Fixtures for this competition + season
    const { data: fixtures = [], isLoading: isLoadingFixtures } = useGetQueryFixture(
        { where: { competitionId, seasonId: activeSeasonId ?? undefined }, take: 100, order: { date: 'ASC' } } as any,
        { query: { enabled: !!competitionId && !!activeSeasonId } as any }
    );

    const sortedStandings = useMemo(
        () => [...standings].sort((a, b) => a.position - b.position),
        [standings]
    );

    const groupedFixtures = useMemo(() => {
        const groups: Record<string, typeof fixtures> = {};
        fixtures.forEach(f => {
            const key = f.date.slice(0, 10);
            (groups[key] ??= []).push(f);
        });
        return groups;
    }, [fixtures]);

    const isInternational = !competition?.country || competition.country.toLowerCase() === 'international';
    const loading = isLoadingComp || isLoadingTcs;

    if (loading) return <Container size="xl" my="xl" pos="relative"><LoadingOverlay visible /></Container>;
    if (!competition) return <Container size="xl" my="xl"><Text c="dimmed">Competition not found.</Text></Container>;

    return (
        <Container size="xl" my="xl" pos="relative">

            {/* Header */}
            <ModernCard hover={false} style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <Group align="center" gap="lg">
                    <ThemeIcon size={56} radius={0} style={{ backgroundColor: 'var(--modern-bg-tertiary)', color: 'var(--modern-text-secondary)' }}>
                        {isInternational ? <IconWorld size={28} stroke={1.5} /> : <IconTrophy size={28} stroke={1.5} />}
                    </ThemeIcon>
                    <Stack gap={4} style={{ flex: 1 }}>
                        <ModernH2 style={{ margin: 0 }}>{competition.name}</ModernH2>
                        <Group gap="xs">
                            {isInternational ? (
                                <><IconWorld size={14} style={{ color: 'var(--modern-text-secondary)' }} /><Text size="sm" c="dimmed">International Competition</Text></>
                            ) : (
                                <><IconFlag size={14} style={{ color: 'var(--modern-text-secondary)' }} /><Text size="sm" c="dimmed">{competition.country}</Text></>
                            )}
                            {competition.type && (
                                <Badge size="sm" style={{ backgroundColor: 'rgba(0,255,136,0.1)', color: 'var(--modern-lime)', border: '1px solid rgba(0,255,136,0.2)' }}>
                                    {competition.type}
                                </Badge>
                            )}
                        </Group>
                    </Stack>

                    {/* Season picker */}
                    {seasonOptions.length > 0 && (
                        <Select
                            size="sm"
                            placeholder="Season"
                            value={selectedSeasonId ?? String(seasonOptions[0]?.id ?? '')}
                            onChange={setSelectedSeasonId}
                            data={seasonOptions.map(s => ({ value: String(s.id), label: `${s.yearStart}/${s.yearEnd}` }))}
                            styles={{ input: { backgroundColor: 'var(--modern-bg-secondary)', borderColor: 'var(--modern-border-color)', color: 'var(--modern-text-primary)' } }}
                            w={140}
                        />
                    )}
                </Group>
            </ModernCard>

            <Tabs defaultValue="table" styles={{
                list: { borderBottom: '2px solid var(--modern-card-border)', marginBottom: '1.5rem' },
                tab: {
                    color: 'var(--modern-text-secondary)', padding: '0.75rem 1.5rem', fontWeight: 500,
                    '&[data-active]': { color: 'var(--modern-lime)', borderBottomColor: 'var(--modern-lime)' },
                },
            }}>
                <Tabs.List>
                    <Tabs.Tab value="table" leftSection={<IconTable size={16} />}>Table</Tabs.Tab>
                    <Tabs.Tab value="fixtures" leftSection={<IconCalendar size={16} />}>Fixtures</Tabs.Tab>
                </Tabs.List>

                {/* ── Standings tab ── */}
                <Tabs.Panel value="table">
                    {isLoadingStandings ? (
                        <Box pos="relative" h={200}><LoadingOverlay visible /></Box>
                    ) : sortedStandings.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconTable size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.4 }} />
                                <Text c="dimmed">No standings data for this season yet</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <ModernCard hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                            <Table highlightOnHover styles={{
                                th: { color: 'var(--modern-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.75rem 1rem' },
                                td: { padding: '0.65rem 1rem', borderColor: 'var(--modern-card-border)' },
                            }}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th w={40}>#</Table.Th>
                                        <Table.Th>Team</Table.Th>
                                        <Table.Th ta="center">P</Table.Th>
                                        <Table.Th ta="center">W</Table.Th>
                                        <Table.Th ta="center">D</Table.Th>
                                        <Table.Th ta="center">L</Table.Th>
                                        <Table.Th ta="center">GF</Table.Th>
                                        <Table.Th ta="center">GA</Table.Th>
                                        <Table.Th ta="center">GD</Table.Th>
                                        <Table.Th ta="center" fw={700}>Pts</Table.Th>
                                        <Table.Th ta="center">Form</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {sortedStandings.map(row => (
                                        <Table.Tr key={row.id}>
                                            <Table.Td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Text size="sm" fw={600}>{row.position}</Text>
                                                    {row.positionChange != null && row.positionChange > 0 && <IconArrowUp size={12} color="var(--modern-lime)" />}
                                                    {row.positionChange != null && row.positionChange < 0 && <IconArrowDown size={12} color="#ff4d4d" />}
                                                    {row.positionChange === 0 && <IconMinus size={12} color="var(--modern-text-secondary)" />}
                                                </Group>
                                            </Table.Td>
                                            <Table.Td><Text size="sm" fw={500}>{teamName(row.teamCompetitionSeasonId)}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm">{row.played}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm">{row.won}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm">{row.drawn}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm">{row.lost}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm">{row.goalsFor}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm">{row.goalsAgainst}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm" c={row.goalDifference > 0 ? 'var(--modern-lime)' : row.goalDifference < 0 ? '#ff4d4d' : undefined}>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</Text></Table.Td>
                                            <Table.Td ta="center"><Text size="sm" fw={700}>{row.points}</Text></Table.Td>
                                            <Table.Td ta="center">
                                                {row.form ? (
                                                    <Group gap={2} justify="center">
                                                        {row.form.split('').map((r, i) => (
                                                            <Box key={i} style={{
                                                                width: 16, height: 16, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                backgroundColor: r === 'W' ? 'var(--modern-lime)' : r === 'L' ? '#ff4d4d' : '#888',
                                                                fontSize: 10, fontWeight: 700,
                                                                color: r === 'W' ? 'var(--modern-bg-primary)' : 'white',
                                                            }}>
                                                                {r}
                                                            </Box>
                                                        ))}
                                                    </Group>
                                                ) : <Text size="xs" c="dimmed">—</Text>}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ModernCard>
                    )}
                </Tabs.Panel>

                {/* ── Fixtures tab ── */}
                <Tabs.Panel value="fixtures">
                    {isLoadingFixtures ? (
                        <Box pos="relative" h={200}><LoadingOverlay visible /></Box>
                    ) : Object.keys(groupedFixtures).length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconCalendar size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.4 }} />
                                <Text c="dimmed">No fixtures for this season</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Stack gap="xl">
                            {Object.entries(groupedFixtures).map(([date, dayFixtures]) => (
                                <Box key={date}>
                                    <Group gap="sm" mb="sm">
                                        <IconCalendar size={16} style={{ color: 'var(--modern-lime)' }} />
                                        <Text fw={600} size="sm">
                                            {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </Text>
                                        <Badge size="xs" style={{ backgroundColor: 'rgba(0,255,136,0.1)', color: 'var(--modern-lime)', border: '1px solid rgba(0,255,136,0.2)' }}>
                                            {dayFixtures.length}
                                        </Badge>
                                    </Group>
                                    <Stack gap="xs">
                                        {dayFixtures.map(fix => {
                                            const home = teamsData.find(t => t.id === fix.homeTeamId)?.name ?? `Team ${fix.homeTeamId}`;
                                            const away = teamsData.find(t => t.id === fix.awayTeamId)?.name ?? `Team ${fix.awayTeamId}`;
                                            const isCompleted = fix.status === 'Completed';
                                            return (
                                                <ModernCard key={fix.id} hover={false} style={{ padding: '0.75rem 1rem' }}>
                                                    <Group justify="space-between" wrap="nowrap">
                                                        <Text size="sm" fw={500} style={{ flex: 1, textAlign: 'right' }}>{home}</Text>
                                                        <Box style={{ minWidth: 64, textAlign: 'center' }}>
                                                            {isCompleted ? (
                                                                <Text size="sm" fw={700}>— : —</Text>
                                                            ) : (
                                                                <Text size="xs" c="dimmed">
                                                                    {new Date(fix.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                                </Text>
                                                            )}
                                                            <Badge size="xs" variant="dot" color={fix.status === 'Live' ? 'red' : 'gray'} style={{ fontSize: 9 }}>
                                                                {fix.status}
                                                            </Badge>
                                                        </Box>
                                                        <Text size="sm" fw={500} style={{ flex: 1 }}>{away}</Text>
                                                    </Group>
                                                </ModernCard>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
