import { Card, Image, Text, Title, Stack, Group, Divider, ScrollArea, Modal, Badge, Box, SimpleGrid, Paper } from '@mantine/core';
import { IconBallFootball, IconBolt, IconCalendar, IconChartBar, IconMapPin, IconExternalLink } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { UserGame, MatchEvent } from '../pages/logs.page';
import { UiCard, UiH3, UiBody, UiButton } from '../components/ui';
import { usePageTransition } from '../hooks/usePageTransition';
import { isNavigablePlayerId, playerPageTransition } from '../shared/playerNavigation';
import { useTranslation } from '../i18n/useTranslation';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import { fetchMyAttendanceAdvancedStats } from '../shared/api/advancedStats.api';
import { useQuery } from '@tanstack/react-query';

interface PlayerStats {
    rank: number;
    name: string;
    id: string; // Player ID for navigation
    team: string;
    crest: string; // Team crest URL
    image?: string; // Player image URL (only for 1st place)
    value: number;
}
interface StatCategory {
    title: string;
    topPlayers: PlayerStats[];
}

interface PlayerGameStats {
    fixture: UserGame;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    substitutions: number;
    penalties: number;
    events: MatchEvent[];
}

interface StatsTabProps {
    loggedFixtures: UserGame[];
}

/** Category titles referenced for modals / row affordances — keep stable strings. */
const CAT_GOALS = 'Goal scorers';
const CAT_YELLOW_CARDS = 'Yellow cards';
const CAT_RED_CARDS = 'Red cards';
const CAT_ASSISTS = 'Top assists';
const CAT_VENUES = 'Most visited venues';

/** How many leaderboard rows we keep after sorting (UI reveals in batches below). */
const STATS_LEADERBOARD_CAP = 50;
const STATS_LEADER_INITIAL = 5;
const STATS_LOAD_MORE_INCREMENT = 5;

function scorerLabelFromGoalEvent(ev: MatchEvent): string | null {
    const d = ev.description.trim();
    if (/^goal\s+by\s+/i.test(d)) {
        let body = d.replace(/^Goal\s+by\s+/i, '').trim();
        const pCut = body.indexOf('(');
        if (pCut >= 0) body = body.slice(0, pCut).trim();
        const label = body || (ev.playerId ? `#${ev.playerId}` : '');
        return label || null;
    }
    const legacy = d.match(/\b(?:by|from)\s+([^,(\n]+)/i)?.[1]?.trim();
    if (legacy) return legacy;
    return ev.playerId ? `#${ev.playerId}` : null;
}

function bookingPlayerLabelFromEvent(ev: MatchEvent): string {
    const parts = ev.description.split(' · ');
    if (parts.length >= 2) return parts[parts.length - 1].trim();
    const m = ev.description.match(/\b(?:yellow|red)\s+card\b[^·]*·\s*(.+)$/i);
    if (m?.[1]) return m[1].trim();
    return ev.description.trim();
}

/** Yellow vs red from structured field or description fallback. */
function cardDisciplineKind(ev: MatchEvent): 'yellow' | 'red' | null {
    if (ev.type !== 'card') return null;
    if (ev.cardKind === 'yellow' || ev.cardKind === 'red') return ev.cardKind;
    const d = ev.description.toLowerCase();
    if (d.includes('red card')) return 'red';
    if (d.includes('yellow card')) return 'yellow';
    return null;
}

const NewStatsTab = ({ loggedFixtures }: StatsTabProps) => {
    const { t } = useTranslation();
    const { attendanceAdvancedStatsEnabled } = usePlatformFeaturesStore();

    const { data: advancedAttendanceStats } = useQuery({
        queryKey: ['attendanceAdvancedStats'],
        queryFn: fetchMyAttendanceAdvancedStats,
        enabled: attendanceAdvancedStatsEnabled && loggedFixtures.length > 0,
        staleTime: 60_000,
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<{ name: string; id: string; category: string } | null>(null);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<{ name: string; id: string } | null>(null);
    const [venueModalOpen, setVenueModalOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<{ name: string; id: string } | null>(null);
    const [leaderboardVisibleByTitle, setLeaderboardVisibleByTitle] = useState<Record<string, number>>({});
    const { navigateWithTransition } = usePageTransition();

    const logStableKey = useMemo(() => loggedFixtures.map((f) => f.fixtureId).sort().join(','), [loggedFixtures]);

    useEffect(() => {
        setLeaderboardVisibleByTitle({});
    }, [logStableKey]);

    // Helper function to get player ID from name
    // In a real app, this would come from the backend/events
    const getPlayerId = (playerName: string, fixture?: UserGame): string => {
        // First, try to find player ID from events
        if (fixture?.events) {
            for (const event of fixture.events) {
                if (event.playerId && event.description.toLowerCase().includes(playerName.toLowerCase())) {
                    return event.playerId;
                }
                if (event.assistPlayerId && event.description.toLowerCase().includes(playerName.toLowerCase())) {
                    return event.assistPlayerId;
                }
            }
        }
        
        // Fallback: create a mapping or use a default
        // In production, this should come from your backend
        const playerIdMap: Record<string, string> = {
            // Add your player name to ID mappings here
            // Example: 'John Smith': 'player-123'
        };
        
        return playerIdMap[playerName] || `player-${playerName.toLowerCase().replace(/\s+/g, '-')}`;
    };

    // Helper function to get team ID from name
    const getTeamId = (teamName: string): string => {
        // In production, this should come from your backend
        const teamIdMap: Record<string, string> = {
            // Add your team name to ID mappings here
        };
        
        return teamIdMap[teamName] || `team-${teamName.toLowerCase().replace(/\s+/g, '-')}`;
    };

    // Get all player stats across games
    const getPlayerGameStats = (
        playerName: string,
        playerId: string,
        statsCategory?: string,
    ): PlayerGameStats[] => {
        const playerGames: PlayerGameStats[] = [];

        loggedFixtures.forEach((fixture) => {
            let playerEvents =
                fixture.events?.filter((event) => {
                    if (event.playerId === playerId || event.assistPlayerId === playerId) return true;
                    const description = event.description.toLowerCase();
                    const nameLower = playerName.toLowerCase();
                    return (
                        description.includes(nameLower) ||
                        description.match(
                            new RegExp(`(?:by|from)\\s+${nameLower.replace(/\s+/g, '\\s+')}`, 'i'),
                        )
                    );
                }) || [];

            if (statsCategory === CAT_YELLOW_CARDS) {
                playerEvents = playerEvents.filter((e) => cardDisciplineKind(e) === 'yellow');
            } else if (statsCategory === CAT_RED_CARDS) {
                playerEvents = playerEvents.filter((e) => cardDisciplineKind(e) === 'red');
            }

            if (playerEvents.length > 0) {
                const goals = playerEvents.filter((e) => e.type === 'goal').length;
                const assists = playerEvents.filter((e) => e.description.toLowerCase().includes('assist')).length;
                const yellowCards = playerEvents.filter((e) => cardDisciplineKind(e) === 'yellow').length;
                const redCards = playerEvents.filter((e) => cardDisciplineKind(e) === 'red').length;
                const substitutions = playerEvents.filter((e) => e.type === 'substitution').length;
                const penalties = playerEvents.filter((e) => e.type === 'penalty').length;

                playerGames.push({
                    fixture,
                    goals,
                    assists,
                    yellowCards,
                    redCards,
                    substitutions,
                    penalties,
                    events: playerEvents,
                });
            }
        });

        return playerGames;
    };

    // Calculate stats from logged fixtures
    const calculateStats = (): StatCategory[] => {
        const stats: {
            goals: Record<string, { count: number; id: string }>;
            assists: Record<string, { count: number; id: string }>;
            yellowCards: Record<string, { count: number; id: string }>;
            redCards: Record<string, { count: number; id: string }>;
            venues: Record<string, { count: number; stadiumId?: number }>;
            teams: Record<string, { count: number; id: string }>;
            competitions: Record<string, { count: number; id: string }>;
        } = {
            goals: {},
            assists: {},
            yellowCards: {},
            redCards: {},
            venues: {},
            teams: {},
            competitions: {},
        };

        loggedFixtures.forEach((fixture) => {
            // Count venues
            if (fixture.venue) {
                const existing = stats.venues[fixture.venue];
                stats.venues[fixture.venue] = {
                    count: (existing?.count ?? 0) + 1,
                    stadiumId:
                        fixture.stadiumId != null && Number.isFinite(fixture.stadiumId)
                            ? fixture.stadiumId
                            : existing?.stadiumId,
                };
            }
            
            if (typeof fixture.competitionId === 'number' && fixture.competitionName) {
                const label = fixture.competitionName;
                if (!stats.competitions[label]) {
                    stats.competitions[label] = { count: 0, id: String(fixture.competitionId) };
                }
                stats.competitions[label].count += 1;
            }

            // Count teams (uses real team ids when available for /team/:id links)
            const homeTeamIdStr =
                fixture.homeTeamId != null && Number.isFinite(fixture.homeTeamId)
                    ? String(fixture.homeTeamId)
                    : getTeamId(fixture.homeTeam);
            const awayTeamIdStr =
                fixture.awayTeamId != null && Number.isFinite(fixture.awayTeamId)
                    ? String(fixture.awayTeamId)
                    : getTeamId(fixture.awayTeam);
            if (!stats.teams[fixture.homeTeam]) {
                stats.teams[fixture.homeTeam] = { count: 0, id: homeTeamIdStr };
            }
            stats.teams[fixture.homeTeam].count += 1;
            if (!stats.teams[fixture.awayTeam]) {
                stats.teams[fixture.awayTeam] = { count: 0, id: awayTeamIdStr };
            }
            stats.teams[fixture.awayTeam].count += 1;

            // Goals / yellow & red cards / assists from synced match events (/fixture/:id/events)
            fixture.events?.forEach((event) => {
                const description = event.description.toLowerCase();

                if (event.type === 'goal') {
                    const player = scorerLabelFromGoalEvent(event);
                    if (player) {
                        const playerId = event.playerId || getPlayerId(player, fixture);
                        if (!stats.goals[player]) {
                            stats.goals[player] = { count: 0, id: playerId };
                        }
                        stats.goals[player].count += 1;
                        if (event.playerId) {
                            stats.goals[player].id = event.playerId;
                        }
                    }

                    const assistInGoalPatterns = [
                        /\(assist(?:ed)?\s*(?:by|from|:)?\s*([^)]+)\)/i,
                        /assist(?:ed)?\s*(?:by|from|:)\s+([^,()]+)/i,
                    ];

                    for (const pattern of assistInGoalPatterns) {
                        const assistMatch = event.description.match(pattern);
                        if (assistMatch) {
                            const assistPlayer = assistMatch[1].trim();
                            const cleanPlayer = assistPlayer.replace(/^(by|from|:)\s*/i, '').trim();
                            if (
                                cleanPlayer &&
                                cleanPlayer.length > 0 &&
                                !cleanPlayer.match(/^(goal|by|from|team)/i)
                            ) {
                                const assistPlayerId = event.assistPlayerId || getPlayerId(cleanPlayer, fixture);
                                if (!stats.assists[cleanPlayer]) {
                                    stats.assists[cleanPlayer] = { count: 0, id: assistPlayerId };
                                }
                                stats.assists[cleanPlayer].count += 1;
                                if (event.assistPlayerId) {
                                    stats.assists[cleanPlayer].id = event.assistPlayerId;
                                }
                                break;
                            }
                        }
                    }
                }

                if (event.type === 'card') {
                    const player = bookingPlayerLabelFromEvent(event);
                    if (!player) return;
                    const kind = cardDisciplineKind(event);
                    if (!kind) return;

                    const bucket = kind === 'yellow' ? stats.yellowCards : stats.redCards;
                    const playerId = event.playerId || getPlayerId(player, fixture);
                    if (!bucket[player]) {
                        bucket[player] = { count: 0, id: playerId };
                    }
                    bucket[player].count += 1;
                    if (event.playerId) bucket[player].id = event.playerId;
                }

                if (description.includes('assist') && event.type !== 'goal' && event.type !== 'card') {
                    // Try multiple patterns for assist extraction
                    const assistPatterns = [
                        /assist(?:ed)?\s*(?:by|from|:)\s+([^,()]+)/i,
                        /(?:by|from)\s+([^,()]+)/i,
                    ];
                    
                    for (const pattern of assistPatterns) {
                        const playerMatch = event.description.match(pattern);
                        if (playerMatch) {
                            const player = playerMatch[1].trim();
                            // Remove common words that might be captured
                            const cleanPlayer = player.replace(/^(by|from|:)\s*/i, '').trim();
                            if (cleanPlayer && cleanPlayer.length > 0 && !cleanPlayer.match(/^(goal|by|from|team)/i)) {
                                const assistPlayerId = event.assistPlayerId || getPlayerId(cleanPlayer, fixture);
                                if (!stats.assists[cleanPlayer]) {
                                    stats.assists[cleanPlayer] = { count: 0, id: assistPlayerId };
                                }
                                stats.assists[cleanPlayer].count += 1;
                                // Update ID if we found one in the event
                                if (event.assistPlayerId) {
                                    stats.assists[cleanPlayer].id = event.assistPlayerId;
                                }
                                break; // Only count once per assist event
                            }
                        }
                    }
                }
            });
        });

        // Convert to sorted arrays and format for display
        const formatPlayerStats = (data: Record<string, { count: number; id: string }>, title: string): StatCategory => {
            const sorted = Object.entries(data)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, STATS_LEADERBOARD_CAP)
                .map(([name, data], index) => ({
                    rank: index + 1,
                    name,
                    id: data.id,
                    team: '', // Could be enhanced to extract team info
                    crest: '',
                    value: data.count,
                }));

            return {
                title,
                topPlayers: sorted,
            };
        };

        const formatTeamStats = (data: Record<string, { count: number; id: string }>, title: string): StatCategory => {
            const sorted = Object.entries(data)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, STATS_LEADERBOARD_CAP)
                .map(([name, data], index) => ({
                    rank: index + 1,
                    name,
                    id: data.id,
                    team: '',
                    crest: '',
                    value: data.count,
                }));

            return {
                title,
                topPlayers: sorted,
            };
        };

        const formatVenueStats = (data: Record<string, { count: number; stadiumId?: number }>, title: string): StatCategory => {
            const sorted = Object.entries(data)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, STATS_LEADERBOARD_CAP)
                .map(([name, entry], index) => ({
                    rank: index + 1,
                    name,
                    id:
                        entry.stadiumId != null
                            ? String(entry.stadiumId)
                            : `venue-${name.toLowerCase().replace(/\s+/g, '-')}`,
                    team: '',
                    crest: '',
                    value: entry.count,
                }));

            return {
                title,
                topPlayers: sorted,
            };
        };

        const result: StatCategory[] = [];

        if (Object.keys(stats.goals).length > 0) result.push(formatPlayerStats(stats.goals, CAT_GOALS));
        if (Object.keys(stats.yellowCards).length > 0)
            result.push(formatPlayerStats(stats.yellowCards, CAT_YELLOW_CARDS));
        if (Object.keys(stats.redCards).length > 0)
            result.push(formatPlayerStats(stats.redCards, CAT_RED_CARDS));
        if (Object.keys(stats.assists).length > 0) result.push(formatPlayerStats(stats.assists, CAT_ASSISTS));
        if (Object.keys(stats.venues).length > 0)
            result.push(formatVenueStats(stats.venues, CAT_VENUES));
        if (Object.keys(stats.teams).length > 0)
            result.push(formatTeamStats(stats.teams, 'Most-logged teams'));
        if (Object.keys(stats.competitions).length > 0)
            result.push(formatTeamStats(stats.competitions, 'Most-logged competitions'));

        // If no stats available, return empty array
        return result.length > 0 ? result : [];
    };

    const overview = useMemo(
        () => ({
            matches: loggedFixtures.length,
            goals: loggedFixtures.reduce(
                (s, f) => s + (f.scoresAvailable ? f.homeScore + f.awayScore : 0),
                0,
            ),
            uniqueVenues: new Set(loggedFixtures.map((f) => f.venue).filter(Boolean)).size,
            uniqueCompetitions: new Set(
                loggedFixtures
                    .map((f) => f.competitionId)
                    .filter((id): id is number => typeof id === 'number'),
            ).size,
        }),
        [loggedFixtures],
    );

    const stats = calculateStats();

    const advancedCategories: StatCategory[] = useMemo(() => {
        if (!attendanceAdvancedStatsEnabled) return [];
        return (advancedAttendanceStats?.leaderboards ?? []).map((board) => ({
            title: board.title,
            topPlayers: board.entries.map((entry) => ({
                rank: entry.rank,
                name: entry.name,
                id: String(entry.playerId),
                team: '',
                crest: '',
                value: entry.value,
            })),
        }));
    }, [attendanceAdvancedStatsEnabled, advancedAttendanceStats]);

    const advancedTitles = useMemo(
        () => new Set(advancedCategories.map((category) => category.title)),
        [advancedCategories],
    );

    const leaderboardCategories = useMemo(
        () => [...stats, ...advancedCategories],
        [stats, advancedCategories],
    );

    if (loggedFixtures.length === 0) {
        return (
            <Stack gap="md" p="md" style={{ textAlign: 'center' }}>
                <Text size="lg" c="dimmed">No statistics available for the selected filter</Text>
                <Text size="sm" c="dimmed">Add more matches or change the filter to see statistics</Text>
            </Stack>
        );
    }

    const hasLeaderboards = leaderboardCategories.length > 0;

    const handlePlayerClick = (playerName: string, playerId: string, category: string) => {
        if (isNavigablePlayerId(playerId)) {
            navigateWithTransition(`/player/${playerId}`, playerPageTransition);
            return;
        }

        const isPlayerStat =
            category === CAT_GOALS ||
            category === CAT_ASSISTS ||
            category === CAT_YELLOW_CARDS ||
            category === CAT_RED_CARDS ||
            advancedTitles.has(category);

        if (!isPlayerStat) return;

        setSelectedPlayer({ name: playerName, id: playerId, category });
        setModalOpen(true);
    };

    const handleTeamClick = (teamName: string, teamId: string) => {
        setSelectedTeam({ name: teamName, id: teamId });
        setTeamModalOpen(true);
    };

    const handleVenueClick = (venueName: string, venueId: string) => {
        setSelectedVenue({ name: venueName, id: venueId });
        setVenueModalOpen(true);
    };

    const handleViewPlayerPage = (playerId: string) => {
        navigateWithTransition(`/player/${playerId}`, {
            transitionType: 'loading',
            duration: 1200
        });
        setModalOpen(false);
    };

    const handleViewTeamPage = (teamId: string) => {
        navigateWithTransition(`/team/${teamId}`, {
            transitionType: 'loading',
            duration: 1200
        });
        setTeamModalOpen(false);
    };

    const handleViewStadium = (venueId: string) => {
        const numericId = Number.parseInt(venueId, 10);
        if (Number.isFinite(numericId) && numericId > 0) {
            navigateWithTransition(`/stadium/${numericId}`, {
                transitionType: 'loading',
                duration: 1200,
            });
        }
        setVenueModalOpen(false);
    };

    const handleOpenCompetition = (competitionId: string) => {
        navigateWithTransition(`/competition/${competitionId}`, {
            transitionType: 'loading',
            duration: 1200,
        });
    };

    const playerGameStats = selectedPlayer
        ? getPlayerGameStats(selectedPlayer.name, selectedPlayer.id, selectedPlayer.category)
        : [];
    const totalStats = playerGameStats.reduce(
        (acc, game) => ({
            goals: acc.goals + game.goals,
            assists: acc.assists + game.assists,
            yellowCards: acc.yellowCards + game.yellowCards,
            redCards: acc.redCards + game.redCards,
            substitutions: acc.substitutions + game.substitutions,
            penalties: acc.penalties + game.penalties,
        }),
        { goals: 0, assists: 0, yellowCards: 0, redCards: 0, substitutions: 0, penalties: 0 },
    );

    return (
        <>
            <ScrollArea h="100vh" p="md">
                <Stack gap="xl">
                    <Box>
                        <Title order={3} mb="sm" style={{ color: 'var(--modern-text-primary)' }}>
                            Your log at a glance
                        </Title>
                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                            {[
                                { title: 'Matches', hint: 'in your log', value: overview.matches },
                                {
                                    title: 'Fixture goals',
                                    hint: 'from final scores',
                                    value: overview.goals,
                                },
                                {
                                    title: 'Stadia',
                                    hint: 'unique venues',
                                    value: overview.uniqueVenues,
                                },
                                {
                                    title: 'Comps',
                                    hint: 'competitions touched',
                                    value: overview.uniqueCompetitions,
                                },
                            ].map((cell) => (
                                <Paper
                                    key={cell.title}
                                    p="sm"
                                    radius="md"
                                    withBorder
                                    style={{
                                        backgroundColor: 'var(--modern-bg-secondary)',
                                        borderColor: 'var(--modern-border-color)',
                                        minHeight: 96,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Stack gap={4}>
                                        <Text
                                            size="xs"
                                            fw={700}
                                            c="var(--modern-text-primary)"
                                            lh={1.25}
                                            style={{ overflowWrap: 'anywhere' }}
                                        >
                                            {cell.title}
                                        </Text>
                                        <Text size="xs" c="dimmed" lh={1.35} opacity={0.82}>
                                            {cell.hint}
                                        </Text>
                                    </Stack>
                                    <Text fw={800} fz="xl" mt={10} c="var(--modern-lime)">
                                        {cell.value}
                                    </Text>
                                </Paper>
                            ))}
                        </SimpleGrid>
                        <Text size="sm" c="dimmed" mt="sm">
                            Goal scorers and yellow / red card lists use match timelines from each logged fixture (same data
                            as the match page events view).
                        </Text>
                    </Box>

                    {!hasLeaderboards ? (
                        <Text size="sm" c="dimmed" px="xs">
                            No lists to show yet. Add logged matches — venue and competition breakdowns appear from your log,
                            while goal, yellow, and red card leaderboards appear when those fixtures load events from the API.
                        </Text>
                    ) : null}

                    {hasLeaderboards
                        ? leaderboardCategories.map((category) => {
                              const total = category.topPlayers.length;
                              const shown =
                                  leaderboardVisibleByTitle[category.title] ?? STATS_LEADER_INITIAL;
                              const visiblePlayers = category.topPlayers.slice(0, shown);
                              const canLoadMore = shown < total;

                              return (
                              <Stack key={category.title} gap="xs">
                                  <Group gap="xs" align="center" wrap="nowrap">
                                      {category.title === CAT_GOALS ? (
                                          <IconBallFootball size={22} stroke={1.65} aria-hidden />
                                      ) : category.title === CAT_YELLOW_CARDS ? (
                                          <Box
                                              w={14}
                                              h={18}
                                              style={{
                                                  borderRadius: 3,
                                                  backgroundColor: '#fbc02d',
                                                  flexShrink: 0,
                                              }}
                                              aria-hidden
                                          />
                                      ) : category.title === CAT_RED_CARDS ? (
                                          <Box
                                              w={14}
                                              h={18}
                                              style={{
                                                  borderRadius: 3,
                                                  backgroundColor: '#e53935',
                                                  flexShrink: 0,
                                              }}
                                              aria-hidden
                                          />
                                      ) : category.title === CAT_ASSISTS ? (
                                          <IconBolt size={22} stroke={1.65} aria-hidden />
                                      ) : category.title === CAT_VENUES ? (
                                          <IconMapPin size={22} stroke={1.65} aria-hidden />
                                      ) : advancedTitles.has(category.title) ? (
                                          <IconChartBar size={22} stroke={1.65} aria-hidden />
                                      ) : (
                                          <IconCalendar size={22} stroke={1.65} aria-hidden />
                                      )}
                                      <Title order={3} style={{ color: 'var(--modern-text-primary)', marginBottom: 0 }}>
                                          {category.title}
                                      </Title>
                                  </Group>
                                  <Card
                                      shadow="xs"
                                      radius="md"
                                      p={0}
                                      withBorder
                                      style={{
                                          backgroundColor: 'var(--modern-card-bg)',
                                          borderColor: 'var(--modern-border-color)',
                                          overflow: 'hidden',
                                      }}
                                  >
                                      <Stack gap={0}>
                                          {visiblePlayers.map((player, index) => {
                                              const isPlayerClickable =
                                                  category.title === CAT_GOALS ||
                                                  category.title === CAT_ASSISTS ||
                                                  category.title === CAT_YELLOW_CARDS ||
                                                  category.title === CAT_RED_CARDS ||
                                                  advancedTitles.has(category.title);

                                              const topRowBg =
                                                  player.rank !== 1
                                                      ? 'transparent'
                                                      : category.title === CAT_RED_CARDS
                                                        ? 'color-mix(in srgb, #e53935 12%, var(--modern-bg-secondary))'
                                                        : category.title === CAT_YELLOW_CARDS
                                                          ? 'color-mix(in srgb, #fbc02d 14%, var(--modern-bg-secondary))'
                                                          : 'color-mix(in srgb, var(--modern-lime) 6%, var(--modern-bg-secondary))';

                                              const isTeamClickable =
                                                  category.title === 'Most-logged teams';
                                              const isCompetitionClickable =
                                                  category.title === 'Most-logged competitions';
                                              const isVenueClickable = category.title === CAT_VENUES;
                                              const isClickable =
                                                  isPlayerClickable ||
                                                  isTeamClickable ||
                                                  isVenueClickable ||
                                                  isCompetitionClickable;

                                              const divider =
                                                  '1px solid color-mix(in srgb, var(--modern-border-color) 85%, transparent)';
                                              const showDividerBelowRow =
                                                  index < visiblePlayers.length - 1 || canLoadMore;

                                              return (
                                                  <Box
                                                      key={`${category.title}-${player.rank}`}
                                                      px="md"
                                                      py={12}
                                                      onClick={() => {
                                                          if (isPlayerClickable) {
                                                              handlePlayerClick(
                                                                  player.name,
                                                                  player.id,
                                                                  category.title,
                                                              );
                                                          } else if (isTeamClickable) {
                                                              handleTeamClick(player.name, player.id);
                                                          } else if (isVenueClickable) {
                                                              handleVenueClick(player.name, player.id);
                                                          } else if (isCompetitionClickable) {
                                                              handleOpenCompetition(player.id);
                                                          }
                                                      }}
                                                      role={isClickable ? 'button' : undefined}
                                                      tabIndex={isClickable ? 0 : undefined}
                                                      onKeyDown={(e) => {
                                                          if (!isClickable) return;
                                                          if (e.key !== 'Enter' && e.key !== ' ') return;
                                                          e.preventDefault();
                                                          if (isPlayerClickable) {
                                                              handlePlayerClick(
                                                                  player.name,
                                                                  player.id,
                                                                  category.title,
                                                              );
                                                              return;
                                                          }
                                                          if (isTeamClickable) handleTeamClick(player.name, player.id);
                                                          else if (isVenueClickable)
                                                              handleVenueClick(player.name, player.id);
                                                          else if (isCompetitionClickable)
                                                              handleOpenCompetition(player.id);
                                                      }}
                                                      style={{
                                                          cursor: isClickable ? 'pointer' : 'default',
                                                          borderBottom: showDividerBelowRow ? divider : undefined,
                                                          backgroundColor: topRowBg,
                                                          transition: 'background-color 140ms ease',
                                                      }}
                                                      onMouseEnter={(e) => {
                                                          if (!isClickable) return;
                                                          e.currentTarget.style.backgroundColor =
                                                              'color-mix(in srgb, var(--modern-text-primary) 6%, transparent)';
                                                      }}
                                                      onMouseLeave={(e) => {
                                                          if (!isClickable) return;
                                                          e.currentTarget.style.backgroundColor = topRowBg;
                                                      }}
                                                  >
                                                      <Group wrap="nowrap" align="flex-start" gap="sm">
                                                          <Text fw={900} fz="xs" mt={4} c="dimmed" w={26} ff="monospace">
                                                              {player.rank}.
                                                          </Text>
                                                          <Stack gap={2} miw={0} style={{ flex: 1 }}>
                                                              <Group gap="xs" wrap="nowrap">
                                                                  {player.image ? (
                                                                      <Image
                                                                          src={player.image}
                                                                          width={40}
                                                                          height={40}
                                                                          radius="50%"
                                                                          alt=""
                                                                      />
                                                                  ) : null}
                                                                  <Stack gap={2} miw={0} style={{ flex: 1 }}>
                                                                      <Text
                                                                          fw={600}
                                                                          size="sm"
                                                                          lh={1.35}
                                                                          style={{
                                                                              color: 'var(--modern-text-primary)',
                                                                              overflowWrap: 'anywhere',
                                                                          }}
                                                                      >
                                                                          {player.name}
                                                                      </Text>
                                                                      {player.team ? (
                                                                          <Group gap="xs">
                                                                              {player.crest ? (
                                                                                  <Image
                                                                                      src={player.crest}
                                                                                      width={18}
                                                                                      height={18}
                                                                                      alt=""
                                                                                  />
                                                                              ) : null}
                                                                              <Text size="xs" c="dimmed">
                                                                                  {player.team}
                                                                              </Text>
                                                                          </Group>
                                                                      ) : null}
                                                                  </Stack>
                                                              </Group>
                                                          </Stack>
                                                          <Text
                                                              fw={800}
                                                              size="xl"
                                                              c="var(--modern-lime)"
                                                              style={{ alignSelf: 'center', flexShrink: 0 }}
                                                          >
                                                              {player.value}
                                                          </Text>
                                                      </Group>
                                                  </Box>
                                              );
                                          })}
                                          {canLoadMore ? (
                                              <Box
                                                  px="md"
                                                  py={10}
                                                  style={{
                                                      backgroundColor:
                                                          'color-mix(in srgb, var(--modern-border-color) 6%, transparent)',
                                                  }}
                                              >
                                                  <UiButton
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      fullWidth
                                                      onClick={() =>
                                                          setLeaderboardVisibleByTitle((prev) => ({
                                                              ...prev,
                                                              [category.title]: Math.min(
                                                                  (prev[category.title] ??
                                                                      STATS_LEADER_INITIAL) +
                                                                      STATS_LOAD_MORE_INCREMENT,
                                                                  total,
                                                              ),
                                                          }))
                                                      }
                                                  >
                                                      Load more
                                                  </UiButton>
                                              </Box>
                                          ) : null}
                                      </Stack>
                                  </Card>
                                  <Box mb="xl" />

                              </Stack>
                              );
                          })
                        : null}
                </Stack>
            </ScrollArea>

            {/* Player Stats Modal */}
            <Modal
                opened={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedPlayer(null);
                }}
                title={
                    <UiH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                        {selectedPlayer?.name} - {selectedPlayer?.category}
                    </UiH3>
                }
                size="xl"
                centered
                overlayProps={{
                    backgroundOpacity: 0.85,
                    blur: 4,
                }}
                styles={{
                    content: {
                        backgroundColor: 'var(--modern-card-bg)',
                        boxShadow: '0 20px 60px var(--modern-shadow-color)',
                        border: '1px solid var(--modern-border-color)',
                    },
                    header: {
                        backgroundColor: 'var(--modern-bg-tertiary)',
                        borderBottom: '1px solid var(--modern-border-color)',
                        padding: '1.5rem',
                    },
                    body: {
                        padding: '1.5rem',
                        backgroundColor: 'var(--modern-card-bg)',
                    },
                    close: {
                        color: 'var(--modern-text-primary)',
                        '&:hover': {
                            backgroundColor: 'var(--modern-bg-tertiary)',
                        },
                    },
                }}
            >
                {selectedPlayer && (
                    <Stack gap="lg">
                        {/* Total Stats Summary */}
                        <Box>
                            <UiH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                Total Statistics
                            </UiH3>
                            <Group gap="md">
                                {totalStats.goals > 0 && (
                                    <Badge size="lg" style={{ 
                                        backgroundColor: 'var(--modern-lime)', 
                                        color: 'var(--modern-bg-primary)',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {totalStats.goals} {totalStats.goals === 1 ? 'Goal' : 'Goals'}
                                    </Badge>
                                )}
                                {totalStats.assists > 0 && (
                                    <Badge size="lg" style={{ 
                                        backgroundColor: 'var(--modern-bg-tertiary)', 
                                        color: 'var(--modern-text-primary)',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {totalStats.assists} {totalStats.assists === 1 ? 'Assist' : 'Assists'}
                                    </Badge>
                                )}
                                {totalStats.yellowCards > 0 && (
                                    <Badge
                                        size="lg"
                                        style={{
                                            backgroundColor: '#fbc02d',
                                            color: '#1a1b1e',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {totalStats.yellowCards}{' '}
                                        {totalStats.yellowCards === 1 ? 'yellow card' : 'yellow cards'}
                                    </Badge>
                                )}
                                {totalStats.redCards > 0 && (
                                    <Badge
                                        size="lg"
                                        style={{
                                            backgroundColor: '#e53935',
                                            color: '#fff',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {totalStats.redCards}{' '}
                                        {totalStats.redCards === 1 ? 'red card' : 'red cards'}
                                    </Badge>
                                )}
                                {totalStats.penalties > 0 && (
                                    <Badge size="lg" color="orange" style={{ 
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {totalStats.penalties} {totalStats.penalties === 1 ? 'Penalty' : 'Penalties'}
                                    </Badge>
                                )}
                            </Group>
                        </Box>

                        <Divider color="var(--modern-border-color)" />

                        {/* Games List */}
                        <Box>
                            <UiH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                Games ({playerGameStats.length})
                            </UiH3>
                            <ScrollArea h={400} type="never">
                                <Stack gap="md">
                                    {playerGameStats.length === 0 ? (
                                        <UiBody style={{ color: 'var(--modern-text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                            No games found for this player
                                        </UiBody>
                                    ) : (
                                        playerGameStats.map((gameStats, index) => (
                                            <UiCard 
                                                key={index}
                                                style={{ 
                                                    padding: '1.5rem', 
                                                    backgroundColor: 'var(--modern-bg-secondary)',
                                                    border: '1px solid var(--modern-border-color)',
                                                }}
                                            >
                                                <Stack gap="md">
                                                    {/* Match Header */}
                                                    <Box>
                                                        <Group justify="space-between" mb="xs">
                                                            <UiH3 style={{ color: 'var(--modern-text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                                                                {gameStats.fixture.homeTeam} vs {gameStats.fixture.awayTeam}
                                                            </UiH3>
                                                            <Badge size="sm" style={{ 
                                                                backgroundColor: 'var(--modern-lime)', 
                                                                color: 'var(--modern-bg-primary)',
                                                            }}>
                                                                {gameStats.fixture.scoresAvailable
                                                                    ? `${gameStats.fixture.homeScore} - ${gameStats.fixture.awayScore}`
                                                                    : '—'}
                                                            </Badge>
                                                        </Group>
                                                        <Group gap="md" mt="xs">
                                                            {gameStats.fixture.venue && (
                                                                <Group gap={4}>
                                                                    <IconMapPin size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                                                                    <UiBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                                                        {gameStats.fixture.venue}
                                                                    </UiBody>
                                                                </Group>
                                                            )}
                                                            <Group gap={4}>
                                                                <IconCalendar size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                                                                <UiBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                                                    {new Date(gameStats.fixture.date).toLocaleDateString('en-US', { 
                                                                        year: 'numeric', 
                                                                        month: 'short', 
                                                                        day: 'numeric'
                                                                    })}
                                                                </UiBody>
                                                            </Group>
                                                        </Group>
                                                    </Box>

                                                    <Divider color="var(--modern-border-color)" />

                                                    {/* Player Stats in this Game */}
                                                    <Box>
                                                        <UiBody style={{ color: 'var(--modern-text-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                            Performance in this match:
                                                        </UiBody>
                                                        <Group gap="sm">
                                                            {gameStats.goals > 0 && (
                                                                <Badge size="sm" leftSection={<IconBallFootball size={12} />} style={{ 
                                                                    backgroundColor: 'var(--modern-lime)', 
                                                                    color: 'var(--modern-bg-primary)',
                                                                }}>
                                                                    {gameStats.goals} {gameStats.goals === 1 ? 'Goal' : 'Goals'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.assists > 0 && (
                                                                <Badge size="sm" style={{ 
                                                                    backgroundColor: 'var(--modern-bg-tertiary)', 
                                                                    color: 'var(--modern-text-primary)',
                                                                }}>
                                                                    {gameStats.assists} {gameStats.assists === 1 ? 'Assist' : 'Assists'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.yellowCards > 0 && (
                                                                <Badge
                                                                    size="sm"
                                                                    style={{
                                                                        backgroundColor: '#fbc02d',
                                                                        color: '#1a1b1e',
                                                                    }}
                                                                >
                                                                    {gameStats.yellowCards}{' '}
                                                                    {gameStats.yellowCards === 1 ? 'yellow' : 'yellows'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.redCards > 0 && (
                                                                <Badge
                                                                    size="sm"
                                                                    style={{ backgroundColor: '#e53935', color: '#fff' }}
                                                                >
                                                                    {gameStats.redCards} {gameStats.redCards === 1 ? 'red' : 'reds'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.penalties > 0 && (
                                                                <Badge size="sm" color="orange">
                                                                    {gameStats.penalties} {gameStats.penalties === 1 ? 'Penalty' : 'Penalties'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.goals === 0 &&
                                                                gameStats.assists === 0 &&
                                                                gameStats.yellowCards === 0 &&
                                                                gameStats.redCards === 0 &&
                                                                gameStats.penalties === 0 && (
                                                                <UiBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                                                    No recorded stats
                                                                </UiBody>
                                                            )}
                                                        </Group>
                                                    </Box>

                                                    {/* Events in this Game */}
                                                    {gameStats.events.length > 0 && (
                                                        <Box>
                                                            <UiBody style={{ color: 'var(--modern-text-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                                Events:
                                                            </UiBody>
                                                            <Stack gap="xs">
                                                                {gameStats.events.map((event, eventIndex) => (
                                                                    <Group key={eventIndex} gap="xs" wrap="nowrap">
                                                                        <UiBody style={{ 
                                                                            fontWeight: 500, 
                                                                            fontSize: '0.875rem', 
                                                                            minWidth: 40,
                                                                            color: 'var(--modern-text-primary)' 
                                                                        }}>
                                                                            {event.time}'
                                                                        </UiBody>
                                                                        <UiBody style={{ fontSize: '0.875rem', color: 'var(--modern-text-primary)' }}>
                                                                            {event.description}
                                                                        </UiBody>
                                                                    </Group>
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </UiCard>
                                        ))
                                    )}
                                </Stack>
                            </ScrollArea>
                        </Box>

                        {/* Action Buttons */}
                        <Divider color="var(--modern-border-color)" />
                        <Group justify="flex-end" gap="md">
                            <UiButton
                                variant="primary"
                                onClick={() => handleViewPlayerPage(selectedPlayer.id)}
                                leftSection={<IconExternalLink size={16} />}
                            >
                                View Player Page
                            </UiButton>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Team Stats Modal */}
            <Modal
                opened={teamModalOpen}
                onClose={() => {
                    setTeamModalOpen(false);
                    setSelectedTeam(null);
                }}
                title={
                    <UiH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                        {selectedTeam?.name}
                    </UiH3>
                }
                size="lg"
                centered
                overlayProps={{
                    backgroundOpacity: 0.85,
                    blur: 4,
                }}
                styles={{
                    content: {
                        backgroundColor: 'var(--modern-card-bg)',
                        boxShadow: '0 20px 60px var(--modern-shadow-color)',
                        border: '1px solid var(--modern-border-color)',
                    },
                    header: {
                        backgroundColor: 'var(--modern-bg-tertiary)',
                        borderBottom: '1px solid var(--modern-border-color)',
                        padding: '1.5rem',
                    },
                    body: {
                        padding: '1.5rem',
                        backgroundColor: 'var(--modern-card-bg)',
                    },
                    close: {
                        color: 'var(--modern-text-primary)',
                        '&:hover': {
                            backgroundColor: 'var(--modern-bg-tertiary)',
                        },
                    },
                }}
            >
                {selectedTeam && (
                    <Stack gap="lg">
                        <Box>
                            <UiBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                You've logged{' '}
                                {stats.find((s) => s.title === 'Most-logged teams')?.topPlayers.find((p) => p.name === selectedTeam.name)
                                    ?.value || 0}{' '}
                                {stats.find((s) => s.title === 'Most-logged teams')?.topPlayers.find((p) => p.name === selectedTeam.name)
                                    ?.value === 1
                                    ? 'match'
                                    : 'matches'}{' '}
                                involving {selectedTeam.name}.
                            </UiBody>
                        </Box>
                        <Divider color="var(--modern-border-color)" />
                        <Group justify="flex-end" gap="md">
                            <UiButton
                                variant="primary"
                                onClick={() => handleViewTeamPage(selectedTeam.id)}
                                leftSection={<IconExternalLink size={16} />}
                            >
                                View Team Page
                            </UiButton>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Venue Stats Modal */}
            <Modal
                opened={venueModalOpen}
                onClose={() => {
                    setVenueModalOpen(false);
                    setSelectedVenue(null);
                }}
                title={
                    <UiH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                        {selectedVenue?.name}
                    </UiH3>
                }
                size="lg"
                centered
                overlayProps={{
                    backgroundOpacity: 0.85,
                    blur: 4,
                }}
                styles={{
                    content: {
                        backgroundColor: 'var(--modern-card-bg)',
                        boxShadow: '0 20px 60px var(--modern-shadow-color)',
                        border: '1px solid var(--modern-border-color)',
                    },
                    header: {
                        backgroundColor: 'var(--modern-bg-tertiary)',
                        borderBottom: '1px solid var(--modern-border-color)',
                        padding: '1.5rem',
                    },
                    body: {
                        padding: '1.5rem',
                        backgroundColor: 'var(--modern-card-bg)',
                    },
                    close: {
                        color: 'var(--modern-text-primary)',
                        '&:hover': {
                            backgroundColor: 'var(--modern-bg-tertiary)',
                        },
                    },
                }}
            >
                {selectedVenue && (
                    <Stack gap="lg">
                        <Box>
                            <Group gap="xs" mb="md">
                                <IconMapPin size={20} style={{ color: 'var(--modern-text-secondary)' }} />
                                <UiH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1rem', fontWeight: 600 }}>
                                    Stadium Information
                                </UiH3>
                            </Group>
                            <UiBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                You&apos;ve visited {selectedVenue.name}{' '}
                                {stats.find((s) => s.title === CAT_VENUES)?.topPlayers.find((p) => p.name === selectedVenue.name)
                                    ?.value || 0}{' '}
                                {stats.find((s) => s.title === CAT_VENUES)?.topPlayers.find((p) => p.name === selectedVenue.name)
                                    ?.value === 1
                                    ? 'time'
                                    : 'times'}
                                .
                            </UiBody>
                        </Box>
                        <Divider color="var(--modern-border-color)" />
                        <Group justify="flex-end" gap="md">
                            <UiButton
                                variant="primary"
                                disabled={
                                    !Number.isFinite(Number.parseInt(selectedVenue.id, 10)) ||
                                    Number.parseInt(selectedVenue.id, 10) <= 0
                                }
                                onClick={() => handleViewStadium(selectedVenue.id)}
                                leftSection={<IconExternalLink size={16} />}
                            >
                                View Stadium
                            </UiButton>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </>
    );
}
export default NewStatsTab