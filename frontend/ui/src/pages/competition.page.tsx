import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container, LoadingOverlay, Tabs, Text, Box, Group, Badge,
    Stack, Center, Table, Select, ThemeIcon,
} from '@mantine/core';
import {
    IconTable, IconCalendar, IconWorld, IconFlag, IconTrophy,
    IconArrowUp, IconArrowDown, IconMinus, IconChartBar, IconBallFootball,
} from '@tabler/icons-react';
import { ModernCard, ModernH2 } from '../components/modern';
import { UiMatchList } from '../components/ui';
import { useGetOneCompetition } from '@iWatchFootball/clients/controllers/competition';
import { useGetQueryTeamCompetitionSeason } from '@iWatchFootball/clients/controllers/team-competition-season';
import { useGetAllSeason } from '@iWatchFootball/clients/controllers/season';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { clientInstance } from '@iWatchFootball/clients/client-instance';
import { useQuery } from '@tanstack/react-query';
import { usePageTransition } from '../hooks/usePageTransition';
import { formatMatchHeadingDate, useTranslation } from '../i18n';
import '../styles/modern.css';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import {
    CompetitionMySeasonTab,
    CompetitionStatsTab,
} from './competition/competitionTabs';
import {
    competitionTableStyles,
    fixtureToMatchRowData,
    type FixtureRecord,
    type TeamRecord,
} from './competition/shared';

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

function useCompetitionSeasonStandings(competitionId: number, seasonId: number | null) {
    return useQuery({
        queryKey: ['/competitionStanding/query', 'season', competitionId, seasonId],
        queryFn: () =>
            clientInstance<CompetitionStanding[]>({
                url: '/competitionStanding/query',
                method: 'GET',
                params: {
                    relations: ['teamCompetitionSeason'],
                    where: {
                        teamCompetitionSeason: {
                            competitionId,
                            seasonId,
                        },
                    },
                    take: 500,
                    order: { position: 'ASC' },
                },
            }),
        enabled: Number.isFinite(competitionId) && seasonId != null,
    });
}

export function CompetitionPage() {
    const { t, locale } = useTranslation();
    const { id: competitionIdStr } = useParams<{ id: string }>();
    const competitionId = Number(competitionIdStr);
    const { navigateWithTransition } = usePageTransition();

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
    const [activeTab, setActiveTab] = useState<string | null>('table');
    const attendanceTrackingEnabled = usePlatformFeaturesStore((s) => s.attendanceTrackingEnabled);
    const activeSeasonId = selectedSeasonId
        ? Number(selectedSeasonId)
        : seasonOptions[0]?.id ?? null;

    // TCS rows for competition + selected season
    const tcsForSeason = useMemo(
        () => tcsAll.filter(t => t.seasonId === activeSeasonId),
        [tcsAll, activeSeasonId]
    );

    const standingTeamIds = useMemo(
        () => Array.from(new Set(tcsForSeason.map((t) => t.teamId).filter((id): id is number => id != null))),
        [tcsForSeason],
    );

    const { data: standings = [], isLoading: isLoadingStandings } = useCompetitionSeasonStandings(
        competitionId,
        activeSeasonId,
    );

    // Teams for this competition season only (avoids missing names when global team list is paginated)
    const { data: teamsData = [] } = useGetQueryTeam(
        { where: { id: { $in: standingTeamIds.length ? standingTeamIds : [-1] } }, take: standingTeamIds.length || 1 } as any,
        { query: { enabled: standingTeamIds.length > 0 } as any },
    );
    const teamName = (tcsId: number) => {
        const tcs = tcsForSeason.find(t => t.id === tcsId);
        return teamsData.find(t => t.id === tcs?.teamId)?.name ?? `Team #${tcs?.teamId}`;
    };

    const teamIdForStanding = (tcsId: number): number | undefined => {
        const tcs = tcsForSeason.find(t => t.id === tcsId);
        return tcs?.teamId;
    };

    const pickPreferredStanding = (a: CompetitionStanding, b: CompetitionStanding) => {
        const aForm = a.form?.trim() ? 1 : 0;
        const bForm = b.form?.trim() ? 1 : 0;
        if (bForm !== aForm) return bForm > aForm ? b : a;
        return b.id > a.id ? b : a;
    };

    const dedupedStandings = useMemo(() => {
        const byTcs = new Map<number, CompetitionStanding>();
        for (const row of standings) {
            const existing = byTcs.get(row.teamCompetitionSeasonId);
            byTcs.set(
                row.teamCompetitionSeasonId,
                existing ? pickPreferredStanding(existing, row) : row,
            );
        }

        const byTeam = new Map<number, CompetitionStanding>();
        for (const row of Array.from(byTcs.values())) {
            const teamId = teamIdForStanding(row.teamCompetitionSeasonId);
            if (teamId == null) continue;
            const existing = byTeam.get(teamId);
            byTeam.set(teamId, existing ? pickPreferredStanding(existing, row) : row);
        }

        return Array.from(byTeam.values()).sort((a, b) => a.position - b.position);
    }, [standings, tcsForSeason]);

    // Fixtures for this competition + season
    const { data: fixtures = [], isLoading: isLoadingFixtures } = useGetQueryFixture(
        { where: { competitionId, seasonId: activeSeasonId ?? undefined }, take: 500, order: { date: 'DESC' } } as any,
        { query: { enabled: !!competitionId && !!activeSeasonId } as any }
    );

    const sortedStandings = dedupedStandings;

    const fixtureGroups = useMemo(() => {
        const groups = new Map<string, FixtureRecord[]>();
        const sortedFixtures = [...(fixtures as FixtureRecord[])].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        for (const f of sortedFixtures) {
            const key = f.date.slice(0, 10);
            const day = groups.get(key);
            if (day) day.push(f);
            else groups.set(key, [f]);
        }
        return Array.from(groups.entries()).map(([date, dayFixtures]) => ({
            league: formatMatchHeadingDate(new Date(`${date}T12:00:00`)),
            matches: dayFixtures.map((f) => fixtureToMatchRowData(f, teamsData as TeamRecord[])),
        }));
    }, [fixtures, teamsData, locale]);

    const isInternational = !competition?.country || competition.country.toLowerCase() === 'international';
    const loading = isLoadingComp || isLoadingTcs;

    if (loading) return <Container size="xl" my="xl" pos="relative"><LoadingOverlay visible /></Container>;
    if (!competition) return <Container size="xl" my="xl"><Text c="dimmed">{t('competitions.notFound')}</Text></Container>;

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
                                <><IconWorld size={14} style={{ color: 'var(--modern-text-secondary)' }} /><Text size="sm" c="dimmed">{t('competitions.internationalCompetition')}</Text></>
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
                            placeholder={t('competitions.season')}
                            value={selectedSeasonId ?? String(seasonOptions[0]?.id ?? '')}
                            onChange={setSelectedSeasonId}
                            data={seasonOptions.map(s => ({ value: String(s.id), label: `${s.yearStart}/${s.yearEnd}` }))}
                            styles={{ input: { backgroundColor: 'var(--modern-bg-secondary)', borderColor: 'var(--modern-border-color)', color: 'var(--modern-text-primary)' } }}
                            w={140}
                        />
                    )}
                </Group>
            </ModernCard>

            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                styles={{
                list: { borderBottom: '2px solid var(--modern-card-border)', marginBottom: '1.5rem', flexWrap: 'wrap' },
                tab: {
                    color: 'var(--modern-text-secondary)', padding: '0.75rem 1.5rem', fontWeight: 500,
                    '&[data-active]': { color: 'var(--modern-lime)', borderBottomColor: 'var(--modern-lime)' },
                },
            }}>
                <Tabs.List>
                    <Tabs.Tab value="table" leftSection={<IconTable size={16} />}>{t('competitions.tabTable')}</Tabs.Tab>
                    <Tabs.Tab value="fixtures" leftSection={<IconCalendar size={16} />}>{t('competitions.tabFixtures')}</Tabs.Tab>
                    <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>{t('competitions.tabStats')}</Tabs.Tab>
                    {attendanceTrackingEnabled && (
                        <Tabs.Tab value="my-season" leftSection={<IconBallFootball size={16} />}>
                            {t('competitions.tabMySeason')}
                        </Tabs.Tab>
                    )}
                </Tabs.List>

                {/* ── Standings tab ── */}
                <Tabs.Panel value="table">
                    {isLoadingStandings ? (
                        <Box pos="relative" h={200}><LoadingOverlay visible /></Box>
                    ) : sortedStandings.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconTable size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.4 }} />
                                <Text c="dimmed">{t('competitions.noStandings')}</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <ModernCard hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                            <Table highlightOnHover styles={competitionTableStyles}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th w={40}>#</Table.Th>
                                        <Table.Th>{t('competitions.team')}</Table.Th>
                                        <Table.Th ta="center">P</Table.Th>
                                        <Table.Th ta="center">W</Table.Th>
                                        <Table.Th ta="center">D</Table.Th>
                                        <Table.Th ta="center">L</Table.Th>
                                        <Table.Th ta="center">GF</Table.Th>
                                        <Table.Th ta="center">GA</Table.Th>
                                        <Table.Th ta="center">GD</Table.Th>
                                        <Table.Th ta="center" fw={700}>Pts</Table.Th>
                                        <Table.Th ta="center">{t('competitions.form')}</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {sortedStandings.map(row => {
                                        const teamId = teamIdForStanding(row.teamCompetitionSeasonId);
                                        const label = teamName(row.teamCompetitionSeasonId);
                                        return (
                                        <Table.Tr key={row.id}>
                                            <Table.Td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Text size="sm" fw={600}>{row.position}</Text>
                                                    {row.positionChange != null && row.positionChange > 0 && <IconArrowUp size={12} color="var(--modern-lime)" />}
                                                    {row.positionChange != null && row.positionChange < 0 && <IconArrowDown size={12} color="#ff4d4d" />}
                                                    {row.positionChange === 0 && <IconMinus size={12} color="var(--modern-text-secondary)" />}
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                {teamId != null ? (
                                                    <Text
                                                        component="button"
                                                        type="button"
                                                        size="sm"
                                                        fw={500}
                                                        onClick={() =>
                                                            navigateWithTransition(`/team/${teamId}`, {
                                                                transitionType: 'loading',
                                                                duration: 900,
                                                            })
                                                        }
                                                        style={{
                                                            border: 'none',
                                                            background: 'transparent',
                                                            padding: 0,
                                                            cursor: 'pointer',
                                                            color: 'inherit',
                                                            textAlign: 'left',
                                                        }}
                                                    >
                                                        {label}
                                                    </Text>
                                                ) : (
                                                    <Text size="sm" fw={500}>{label}</Text>
                                                )}
                                            </Table.Td>
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
                                                        {row.form.split('').map((r: string, i: number) => (
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
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </ModernCard>
                    )}
                </Tabs.Panel>

                {/* ── Fixtures tab ── */}
                <Tabs.Panel value="fixtures">
                    {isLoadingFixtures ? (
                        <Box pos="relative" h={200}><LoadingOverlay visible /></Box>
                    ) : fixtureGroups.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconCalendar size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.4 }} />
                                <Text c="dimmed">{t('competitions.noFixtures')}</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <UiMatchList
                            groups={fixtureGroups}
                            onMatchClick={(id) =>
                                navigateWithTransition(`/match/${id}`, {
                                    transitionType: 'loading',
                                    duration: 1200,
                                })
                            }
                        />
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="stats">
                    <CompetitionStatsTab
                        competitionId={competitionId}
                        seasonId={activeSeasonId}
                        teams={teamsData as TeamRecord[]}
                        onPlayerClick={(playerId) =>
                            navigateWithTransition(`/player/${playerId}`, {
                                transitionType: 'loading',
                                duration: 900,
                            })
                        }
                    />
                </Tabs.Panel>

                {attendanceTrackingEnabled && (
                    <Tabs.Panel value="my-season">
                        <CompetitionMySeasonTab
                            competitionId={competitionId}
                            seasonId={activeSeasonId}
                            seasonFixtures={fixtures as FixtureRecord[]}
                            teams={teamsData as TeamRecord[]}
                            locale={locale}
                            onMatchClick={(id) =>
                                navigateWithTransition(`/match/${id}`, {
                                    transitionType: 'loading',
                                    duration: 1200,
                                })
                            }
                            onBrowseFixtures={() => setActiveTab('fixtures')}
                        />
                    </Tabs.Panel>
                )}
            </Tabs>
        </Container>
    );
}
