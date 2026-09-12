import { useEffect, useMemo, useState } from 'react';
import {
    Avatar,
    Badge,
    Box,
    Center,
    Group,
    LoadingOverlay,
    SegmentedControl,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
    UnstyledButton,
} from '@mantine/core';
import {
    IconBallFootball,
    IconCalendar,
    IconChartBar,
    IconChevronDown,
    IconChevronUp,
    IconMapPin,
    IconSearch,
    IconSelector,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetQueryStadium } from '@iWatchFootball/clients/controllers/stadium';
import { clientInstance } from '@iWatchFootball/clients/client-instance';
import { ModernCard } from '../../components/modern';
import { UiButton, UiCaption, UiCard, UiH3, UiMatchList } from '../../components/ui';
import { uiSegmentedControlStyles, uiSelectStyles } from '../../components/ui/formStyles';
import { formatMatchHeadingDate, useTranslation } from '../../i18n';
import { getMyAttendance } from '../../shared/api/attendance.api';
import {
    competitionTableStyles,
    fixtureToMatchRowData,
    type FixtureRecord,
    type TeamRecord,
} from './shared';

type NamedPlayer = {
    id?: unknown;
    name?: unknown;
    photoUrl?: unknown;
};

type GoalRow = {
    scorerId: number;
    assistantId?: number | null;
    teamId?: number | null;
    ownGoal?: boolean | null;
    penalty?: boolean | null;
    scorer?: NamedPlayer | null;
    assistant?: NamedPlayer | null;
};

type CardRow = {
    playerId: number;
    teamId?: number | null;
    type: string;
    player?: NamedPlayer | null;
};

type LeaderRow = {
    playerId: number;
    goals: number;
    penalties: number;
    assists: number;
    played: number;
    yellow: number;
    red: number;
    teamId?: number;
};

type StatsView = 'goals' | 'assists' | 'cards';

type PlayerLookup = {
    name: string;
    photoUrl?: string;
};

function asPlayerId(value: unknown): number | null {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function rememberPlayer(map: Map<number, PlayerLookup>, player?: NamedPlayer | null) {
    if (!player || typeof player !== 'object') return;
    const id = asPlayerId(player.id);
    const name = typeof player.name === 'string' ? player.name.trim() : '';
    if (id == null || !name) return;
    map.set(id, {
        name,
        photoUrl: typeof player.photoUrl === 'string' ? player.photoUrl : undefined,
    });
}

function playersFromEvents(goals: GoalRow[], cards: CardRow[]): Map<number, PlayerLookup> {
    const map = new Map<number, PlayerLookup>();
    for (const goal of goals) {
        rememberPlayer(map, goal.scorer);
        rememberPlayer(map, goal.assistant);
    }
    for (const card of cards) {
        rememberPlayer(map, card.player);
    }
    return map;
}

async function fetchPlayersByIds(ids: number[]): Promise<Map<number, PlayerLookup>> {
    const unique = Array.from(new Set(ids)).filter((id) => Number.isFinite(id) && id > 0);
    const found = new Map<number, PlayerLookup>();
    if (unique.length === 0) return found;
    const rows = await clientInstance<Array<{ id?: unknown; name?: unknown; photoUrl?: unknown }>>({
        url: '/player/lookup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { ids: unique },
    });
    if (!Array.isArray(rows)) return found;
    for (const row of rows) {
        rememberPlayer(found, row);
    }
    return found;
}

function useCompetitionSeasonGoals(competitionId: number, seasonId: number | null) {
    return useQuery({
        queryKey: ['/goal/query', 'season', competitionId, seasonId],
        queryFn: () =>
            clientInstance<GoalRow[]>({
                url: '/goal/query',
                method: 'GET',
                params: {
                    where: { fixture: { competitionId, seasonId } },
                    take: 2000,
                    loadEagerRelations: false,
                },
            }),
        enabled: Number.isFinite(competitionId) && seasonId != null,
    });
}

function useCompetitionSeasonCards(competitionId: number, seasonId: number | null) {
    return useQuery({
        queryKey: ['/card/query', 'season', competitionId, seasonId],
        queryFn: () =>
            clientInstance<CardRow[]>({
                url: '/card/query',
                method: 'GET',
                params: {
                    where: { fixture: { competitionId, seasonId } },
                    take: 2000,
                    loadEagerRelations: false,
                },
            }),
        enabled: Number.isFinite(competitionId) && seasonId != null,
    });
}

function useCompetitionSeasonAssists(competitionId: number, seasonId: number | null) {
    return useQuery({
        queryKey: ['/competition-stats/assists', competitionId, seasonId],
        queryFn: () =>
            clientInstance<Array<{ playerId: number; assists: number }>>({
                url: '/competition-stats/assists',
                method: 'GET',
                params: { competitionId, seasonId },
            }),
        enabled: Number.isFinite(competitionId) && seasonId != null,
    });
}

function useCompetitionSeasonAppearances(competitionId: number, seasonId: number | null) {
    return useQuery({
        queryKey: ['/competition-stats/appearances', competitionId, seasonId],
        queryFn: () =>
            clientInstance<Array<{ playerId: number; played: number }>>({
                url: '/competition-stats/appearances',
                method: 'GET',
                params: { competitionId, seasonId },
            }),
        enabled: Number.isFinite(competitionId) && seasonId != null,
    });
}

function ensureLeader(map: Map<number, LeaderRow>, playerId: number, teamId?: number | null): LeaderRow {
    let row = map.get(playerId);
    if (!row) {
        row = { playerId, goals: 0, penalties: 0, assists: 0, played: 0, yellow: 0, red: 0 };
        map.set(playerId, row);
    }
    if (teamId != null && row.teamId == null) row.teamId = teamId;
    return row;
}

function aggregateLeaders(
    goals: GoalRow[],
    cards: CardRow[],
    assistCounts: Array<{ playerId: number; assists: number }> = [],
    appearanceCounts: Array<{ playerId: number; played: number }> = [],
): LeaderRow[] {
    const byPlayer = new Map<number, LeaderRow>();

    for (const goal of goals) {
        if (goal.ownGoal) continue;
        const scorerId = asPlayerId(goal.scorerId);
        if (scorerId == null) continue;
        const scorer = ensureLeader(byPlayer, scorerId, goal.teamId);
        scorer.goals += 1;
        if (goal.penalty) scorer.penalties += 1;
        const assistantId = asPlayerId(goal.assistantId);
        if (assistantId != null) ensureLeader(byPlayer, assistantId, goal.teamId).assists += 1;
    }

    for (const card of cards) {
        const playerId = asPlayerId(card.playerId);
        if (playerId == null) continue;
        const row = ensureLeader(byPlayer, playerId, card.teamId);
        const type = card.type.toLowerCase();
        if (type === 'red') row.red += 1;
        else if (type === 'yellow') row.yellow += 1;
    }

    for (const count of assistCounts) {
        const playerId = asPlayerId(count.playerId);
        if (playerId == null || count.assists <= 0) continue;
        const row = ensureLeader(byPlayer, playerId);
        if (count.assists > row.assists) row.assists = count.assists;
    }

    for (const count of appearanceCounts) {
        const playerId = asPlayerId(count.playerId);
        if (playerId == null || count.played <= 0) continue;
        const row = byPlayer.get(playerId);
        if (row && count.played > row.played) row.played = count.played;
    }

    return Array.from(byPlayer.values());
}

function playerInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function PlayerNameButton({
    name,
    onClick,
}: {
    name: string;
    onClick: () => void;
}) {
    return (
        <Text
            component="button"
            type="button"
            size="sm"
            fw={500}
            onClick={onClick}
            style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                color: 'inherit',
                textAlign: 'left',
            }}
        >
            {name}
        </Text>
    );
}

const STATS_PAGE_SIZE = 25;

type StatsSortKey = 'player' | 'team' | 'played' | 'goals' | 'penalties' | 'assists' | 'yellow' | 'red';

const NUMERIC_SORT_KEYS: StatsSortKey[] = ['played', 'goals', 'penalties', 'assists', 'yellow', 'red'];

function defaultSortForView(view: StatsView): { key: StatsSortKey; desc: boolean } {
    if (view === 'assists') return { key: 'assists', desc: true };
    if (view === 'cards') return { key: 'yellow', desc: true };
    return { key: 'goals', desc: true };
}

function SortableTh({
    label,
    column,
    sortKey,
    desc,
    onSort,
    ta,
}: {
    label: string;
    column: StatsSortKey;
    sortKey: StatsSortKey;
    desc: boolean;
    onSort: (column: StatsSortKey) => void;
    ta?: 'center' | 'left';
}) {
    const active = sortKey === column;
    const Icon = !active ? IconSelector : desc ? IconChevronDown : IconChevronUp;
    return (
        <Table.Th ta={ta}>
            <UnstyledButton
                onClick={() => onSort(column)}
                aria-label={`Sort by ${label}`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: ta === 'center' ? 'center' : 'flex-start',
                    gap: 4,
                    width: '100%',
                    color: 'inherit',
                    font: 'inherit',
                    letterSpacing: 'inherit',
                    textTransform: 'inherit',
                    cursor: 'pointer',
                }}
            >
                {label}
                <Icon size={13} stroke={1.75} style={{ opacity: active ? 1 : 0.4, flexShrink: 0 }} />
            </UnstyledButton>
        </Table.Th>
    );
}

export function CompetitionStatsTab({
    competitionId,
    seasonId,
    teams,
    onPlayerClick,
}: {
    competitionId: number;
    seasonId: number | null;
    teams: TeamRecord[];
    onPlayerClick: (playerId: number) => void;
}) {
    const { t } = useTranslation();
    const [view, setView] = useState<StatsView>('goals');
    const [search, setSearch] = useState('');
    const [teamFilter, setTeamFilter] = useState<string | null>('all');
    const [sortKey, setSortKey] = useState<StatsSortKey>('goals');
    const [sortDesc, setSortDesc] = useState(true);
    const [visibleCount, setVisibleCount] = useState(STATS_PAGE_SIZE);
    const { data: goals = [], isLoading: loadingGoals } = useCompetitionSeasonGoals(competitionId, seasonId);
    const { data: cards = [], isLoading: loadingCards } = useCompetitionSeasonCards(competitionId, seasonId);
    const { data: assistCounts = [], isLoading: loadingAssists } = useCompetitionSeasonAssists(
        competitionId,
        seasonId,
    );
    const { data: appearanceCounts = [], isLoading: loadingAppearances } = useCompetitionSeasonAppearances(
        competitionId,
        seasonId,
    );

    const leaders = useMemo(
        () => aggregateLeaders(goals, cards, assistCounts, appearanceCounts),
        [goals, cards, assistCounts, appearanceCounts],
    );
    const playerIds = useMemo(
        () => Array.from(new Set(leaders.map((row) => row.playerId))).sort((a, b) => a - b),
        [leaders],
    );
    const { data: fetchedPlayers, isLoading: loadingPlayers } = useQuery({
        queryKey: ['/player/lookup', 'competition-stats', competitionId, seasonId, playerIds],
        queryFn: () => fetchPlayersByIds(playerIds),
        enabled: playerIds.length > 0,
        staleTime: 5 * 60 * 1000,
    });
    const playerById = useMemo(() => {
        const map = playersFromEvents(goals, cards);
        if (fetchedPlayers) {
            fetchedPlayers.forEach((player, id) => {
                map.set(id, player);
            });
        }
        return map;
    }, [goals, cards, fetchedPlayers]);

    const teamName = (teamId?: number) =>
        teamId == null ? '—' : (teams.find((team) => team.id === teamId)?.name ?? '—');

    const ranked = useMemo(() => {
        return leaders.filter((row) => {
            if (view === 'goals') return row.goals > 0;
            if (view === 'assists') return row.assists > 0;
            return row.yellow + row.red > 0;
        });
    }, [leaders, view]);

    const teamOptions = useMemo(() => {
        const names = new Set<string>();
        for (const row of ranked) {
            const name = teamName(row.teamId);
            if (name !== '—') names.add(name);
        }
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [ranked, teams]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return ranked.filter((row) => {
            const player = playerById.get(row.playerId);
            const name = player?.name ?? '';
            const team = teamName(row.teamId);
            if (teamFilter && teamFilter !== 'all' && team !== teamFilter) return false;
            if (!q) return true;
            return name.toLowerCase().includes(q) || team.toLowerCase().includes(q);
        });
    }, [ranked, playerById, search, teamFilter, teams]);

    const displayed = useMemo(() => {
        const rows = [...filtered];
        rows.sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'player') {
                const aName = playerById.get(a.playerId)?.name ?? `Player #${a.playerId}`;
                const bName = playerById.get(b.playerId)?.name ?? `Player #${b.playerId}`;
                cmp = aName.localeCompare(bName);
            } else if (sortKey === 'team') {
                cmp = teamName(a.teamId).localeCompare(teamName(b.teamId));
            } else {
                cmp = a[sortKey] - b[sortKey];
            }
            if (cmp !== 0) return sortDesc ? -cmp : cmp;
            return b.goals - a.goals || b.assists - a.assists || a.playerId - b.playerId;
        });
        return rows;
    }, [filtered, sortKey, sortDesc, playerById, teams]);

    useEffect(() => {
        setVisibleCount(STATS_PAGE_SIZE);
    }, [view, search, teamFilter, sortKey, sortDesc]);

    const visibleRows = displayed.slice(0, visibleCount);
    const canLoadMore = visibleCount < displayed.length;

    const handleSort = (column: StatsSortKey) => {
        if (sortKey === column) {
            setSortDesc((current) => !current);
            return;
        }
        setSortKey(column);
        setSortDesc(NUMERIC_SORT_KEYS.includes(column));
    };

    const loading =
        loadingGoals ||
        loadingCards ||
        loadingAssists ||
        loadingAppearances ||
        (playerIds.length > 0 && loadingPlayers);

    if (loading) {
        return (
            <Box pos="relative" h={200}>
                <LoadingOverlay visible />
            </Box>
        );
    }

    return (
        <Stack gap="md">
            <SegmentedControl
                value={view}
                onChange={(value) => {
                    const next = value as StatsView;
                    setView(next);
                    setSearch('');
                    setTeamFilter('all');
                    setVisibleCount(STATS_PAGE_SIZE);
                    const nextSort = defaultSortForView(next);
                    setSortKey(nextSort.key);
                    setSortDesc(nextSort.desc);
                }}
                data={[
                    { label: t('competitions.statsGoals'), value: 'goals' },
                    { label: t('competitions.statsAssists'), value: 'assists' },
                    { label: t('competitions.statsCards'), value: 'cards' },
                ]}
                styles={uiSegmentedControlStyles}
            />

            {ranked.length === 0 ? (
                <Center py="xl">
                    <Stack align="center" gap="md">
                        <IconChartBar size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.4 }} />
                        <Text c="dimmed">{t('competitions.noStats')}</Text>
                    </Stack>
                </Center>
            ) : (
                <>
                    <Group gap="sm" align="flex-end" wrap="wrap">
                        <TextInput
                            placeholder={t('competitions.statsSearchPlaceholder')}
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                            style={{ flex: 1, minWidth: 200 }}
                            styles={{
                                input: {
                                    backgroundColor: 'var(--ui-bg-surface)',
                                    borderColor: 'var(--ui-border)',
                                    color: 'var(--ui-text-primary)',
                                },
                            }}
                        />
                        {teamOptions.length > 1 && (
                            <Select
                                placeholder={t('competitions.statsAllTeams')}
                                value={teamFilter}
                                onChange={setTeamFilter}
                                data={[
                                    { value: 'all', label: t('competitions.statsAllTeams') },
                                    ...teamOptions.map((name) => ({ value: name, label: name })),
                                ]}
                                w={220}
                                searchable
                                styles={uiSelectStyles}
                            />
                        )}
                    </Group>
                    {(search.trim() || (teamFilter && teamFilter !== 'all') || displayed.length > STATS_PAGE_SIZE) && (
                        <Text size="sm" c="dimmed">
                            {displayed.length === 0
                                ? t('competitions.statsNoFilterResults', { query: search.trim() || teamFilter || '' })
                                : t('competitions.statsShowing', { shown: visibleRows.length, total: displayed.length })}
                        </Text>
                    )}
                    {displayed.length === 0 ? (
                        <Center py="xl">
                            <Text c="dimmed">{t('competitions.statsNoFilterResults', { query: search.trim() || teamFilter || '' })}</Text>
                        </Center>
                    ) : (
                    <>
                <ModernCard hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                    <Table highlightOnHover styles={competitionTableStyles}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={40}>#</Table.Th>
                                <SortableTh
                                    label={t('competitions.player')}
                                    column="player"
                                    sortKey={sortKey}
                                    desc={sortDesc}
                                    onSort={handleSort}
                                />
                                <SortableTh
                                    label={t('competitions.team')}
                                    column="team"
                                    sortKey={sortKey}
                                    desc={sortDesc}
                                    onSort={handleSort}
                                />
                                <SortableTh
                                    label={t('competitions.colPlayed')}
                                    column="played"
                                    sortKey={sortKey}
                                    desc={sortDesc}
                                    onSort={handleSort}
                                    ta="center"
                                />
                                {view === 'goals' && (
                                    <>
                                        <SortableTh label={t('competitions.colGoals')} column="goals" sortKey={sortKey} desc={sortDesc} onSort={handleSort} ta="center" />
                                        <SortableTh label={t('competitions.colPenalties')} column="penalties" sortKey={sortKey} desc={sortDesc} onSort={handleSort} ta="center" />
                                        <SortableTh label={t('competitions.colAssists')} column="assists" sortKey={sortKey} desc={sortDesc} onSort={handleSort} ta="center" />
                                    </>
                                )}
                                {view === 'assists' && (
                                    <>
                                        <SortableTh label={t('competitions.colAssists')} column="assists" sortKey={sortKey} desc={sortDesc} onSort={handleSort} ta="center" />
                                        <SortableTh label={t('competitions.colGoals')} column="goals" sortKey={sortKey} desc={sortDesc} onSort={handleSort} ta="center" />
                                    </>
                                )}
                                {view === 'cards' && (
                                    <>
                                        <SortableTh label={t('competitions.colYellow')} column="yellow" sortKey={sortKey} desc={sortDesc} onSort={handleSort} ta="center" />
                                        <SortableTh label={t('competitions.colRed')} column="red" sortKey={sortKey} desc={sortDesc} onSort={handleSort} ta="center" />
                                    </>
                                )}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {visibleRows.map((row, index) => {
                                const player = playerById.get(row.playerId);
                                const name = player?.name || `Player #${row.playerId}`;
                                return (
                                    <Table.Tr key={row.playerId}>
                                        <Table.Td>
                                            <Text size="sm" fw={600}>
                                                {index + 1}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="sm" wrap="nowrap">
                                                <Avatar src={player?.photoUrl} size={28} radius="xl">
                                                    {playerInitials(name)}
                                                </Avatar>
                                                <PlayerNameButton
                                                    name={name}
                                                    onClick={() => onPlayerClick(row.playerId)}
                                                />
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">
                                                {teamName(row.teamId)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td ta="center">
                                            <Text size="sm">{row.played || '—'}</Text>
                                        </Table.Td>
                                        {view === 'goals' && (
                                            <>
                                                <Table.Td ta="center">
                                                    <Text size="sm" fw={700}>
                                                        {row.goals}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td ta="center">
                                                    <Text size="sm">{row.penalties || '—'}</Text>
                                                </Table.Td>
                                                <Table.Td ta="center">
                                                    <Text size="sm">{row.assists || '—'}</Text>
                                                </Table.Td>
                                            </>
                                        )}
                                        {view === 'assists' && (
                                            <>
                                                <Table.Td ta="center">
                                                    <Text size="sm" fw={700}>
                                                        {row.assists}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td ta="center">
                                                    <Text size="sm">{row.goals || '—'}</Text>
                                                </Table.Td>
                                            </>
                                        )}
                                        {view === 'cards' && (
                                            <>
                                                <Table.Td ta="center">
                                                    <Text size="sm">{row.yellow}</Text>
                                                </Table.Td>
                                                <Table.Td ta="center">
                                                    <Text size="sm" c={row.red > 0 ? '#ff4d4d' : undefined} fw={row.red > 0 ? 700 : 400}>
                                                        {row.red}
                                                    </Text>
                                                </Table.Td>
                                            </>
                                        )}
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ModernCard>
                {canLoadMore && (
                    <UiButton
                        type="button"
                        variant="secondary"
                        onClick={() => setVisibleCount((current) => current + STATS_PAGE_SIZE)}
                    >
                        {t('competitions.loadMore')}
                    </UiButton>
                )}
                    </>
                    )}
                </>
            )}
        </Stack>
    );
}

export function CompetitionMySeasonTab({
    competitionId,
    seasonId,
    seasonFixtures,
    teams,
    locale,
    onMatchClick,
    onBrowseFixtures,
}: {
    competitionId: number;
    seasonId: number | null;
    seasonFixtures: FixtureRecord[];
    teams: TeamRecord[];
    locale: string;
    onMatchClick: (id: string | number) => void;
    onBrowseFixtures: () => void;
}) {
    const { t } = useTranslation();
    const { data: attendance = [], isLoading } = useQuery({
        queryKey: ['my-attendance'],
        queryFn: getMyAttendance,
        staleTime: 2 * 60 * 1000,
    });

    const attendanceFixtureIds = useMemo(
        () => Array.from(new Set(attendance.map((record) => record.fixtureId).filter((id) => Number.isFinite(id) && id > 0))),
        [attendance],
    );

    const { data: attendedFixtureRows = [], isLoading: loadingAttendedFixtures } = useGetQueryFixture(
        {
            where: { id: { $in: attendanceFixtureIds.length ? attendanceFixtureIds : [-1] } },
            take: Math.max(attendanceFixtureIds.length, 1),
            loadEagerRelations: false,
        } as any,
        { query: { enabled: attendanceFixtureIds.length > 0 } as any },
    );

    const attendedFixtures = useMemo(() => {
        const inSeason = (attendedFixtureRows as FixtureRecord[]).filter((fixture) => {
            if (seasonId == null) return false;
            return fixture.competitionId === competitionId && fixture.seasonId === seasonId;
        });
        const seen = new Set<number>();
        const rows: FixtureRecord[] = [];
        for (const fixture of inSeason) {
            if (seen.has(fixture.id)) continue;
            seen.add(fixture.id);
            rows.push(fixture);
        }
        return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendedFixtureRows, competitionId, seasonId]);

    const seasonStadiumIds = useMemo(() => {
        const ids = new Set<number>();
        for (const fixture of seasonFixtures) {
            if (fixture.stadiumId != null) ids.add(fixture.stadiumId);
        }
        return Array.from(ids);
    }, [seasonFixtures]);

    const visitedStadiumIds = useMemo(() => {
        const ids = new Set<number>();
        for (const fixture of attendedFixtures) {
            if (fixture.stadiumId != null) ids.add(fixture.stadiumId);
        }
        return Array.from(ids);
    }, [attendedFixtures]);

    const { data: stadiums = [] } = useGetQueryStadium(
        { where: { id: { $in: visitedStadiumIds.length ? visitedStadiumIds : [-1] } }, take: visitedStadiumIds.length || 1 } as any,
        { query: { enabled: visitedStadiumIds.length > 0 } as any },
    );

    const fixtureGroups = useMemo(() => {
        const groups: Record<string, FixtureRecord[]> = {};
        attendedFixtures.forEach((fixture) => {
            const key = fixture.date.slice(0, 10);
            (groups[key] ??= []).push(fixture);
        });
        return Object.entries(groups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dayFixtures]) => ({
                league: formatMatchHeadingDate(new Date(`${date}T12:00:00`)),
                matches: dayFixtures.map((fixture) => fixtureToMatchRowData(fixture, teams)),
            }));
    }, [attendedFixtures, teams, locale]);

    if (isLoading || (attendanceFixtureIds.length > 0 && loadingAttendedFixtures)) {
        return (
            <Box pos="relative" h={200}>
                <LoadingOverlay visible />
            </Box>
        );
    }

    if (attendedFixtures.length === 0) {
        return (
            <Center py="xl">
                <Stack align="center" gap="md">
                    <IconBallFootball size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.4 }} />
                    <Text c="dimmed" ta="center" maw={360}>
                        {attendance.length > 0
                            ? t('competitions.mySeasonEmptyOther', { count: attendance.length })
                            : t('competitions.mySeasonEmpty')}
                    </Text>
                    <UiButton variant="secondary" onClick={onBrowseFixtures}>
                        {t('competitions.browseFixtures')}
                    </UiButton>
                </Stack>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <UiCard density="default">
                    <Group gap="sm">
                        <IconCalendar size={22} color="var(--ui-accent)" />
                        <Stack gap={2}>
                            <UiH3>{t('competitions.mySeasonMatches', { count: attendedFixtures.length })}</UiH3>
                            <UiCaption>{t('competitions.mySeasonMatchesHint')}</UiCaption>
                        </Stack>
                    </Group>
                </UiCard>
                <UiCard density="default">
                    <Group gap="sm">
                        <IconMapPin size={22} color="var(--ui-accent)" />
                        <Stack gap={2}>
                            <UiH3>
                                {seasonStadiumIds.length > 0
                                    ? t('competitions.mySeasonStadiums', {
                                          visited: visitedStadiumIds.length,
                                          total: seasonStadiumIds.length,
                                      })
                                    : t('competitions.mySeasonStadiumsUnknown', { count: visitedStadiumIds.length })}
                            </UiH3>
                            <UiCaption>{t('competitions.mySeasonStadiumsHint')}</UiCaption>
                        </Stack>
                    </Group>
                </UiCard>
            </SimpleGrid>

            {stadiums.length > 0 && (
                <Group gap="xs">
                    {stadiums.map((stadium) => (
                        <Badge
                            key={stadium.id}
                            variant="outline"
                            color="gray"
                            size="sm"
                        >
                            {stadium.name}
                        </Badge>
                    ))}
                </Group>
            )}

            <UiMatchList groups={fixtureGroups} onMatchClick={onMatchClick} />
        </Stack>
    );
}
