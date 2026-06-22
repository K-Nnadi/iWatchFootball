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
    LoadingOverlay,
} from '@mantine/core';
import { IconUsers, IconCalendar, IconExchange, IconTrophy, IconFlag, IconBuilding, IconUser, IconMapPin } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { mockTeams } from './mockTeams';
import { useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from '../../i18n';
import {
    parseFixtureResultFromMetadata,
    resolveFixtureOutcome,
    isPenaltyDecided,
    type FixtureResultFields,
} from '../../shared/fixtureResult';
import { usePageTransition } from '../../hooks/usePageTransition';
import '../../styles/modern.css';
import { useGetOneTeam, useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetOneManager } from '@iWatchFootball/clients/controllers/manager';
import { useGetQueryStadium } from '@iWatchFootball/clients/controllers/stadium';
import { useGetQueryTeamStadium } from '@iWatchFootball/clients/controllers/team-stadium';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetQueryPlayer } from '@iWatchFootball/clients/controllers/player';
import { useGetQueryPosition } from '@iWatchFootball/clients/controllers/position';
import { useGetQueryCompetition } from '@iWatchFootball/clients/controllers/competition';
import { useGetAllSeason } from '@iWatchFootball/clients/controllers/season';
import { useTeamSquad, useTeamTransfers } from '../../shared/api/teamSquad.api';
import {
    resolvePositionGroup,
    SQUAD_POSITION_GROUP_ORDER,
    type SquadPositionGroup,
} from '../../shared/positionGroup';

type DisplaySquadMember = {
    name: string;
    position: string;
    positionGroup: SquadPositionGroup;
    age: number;
    nationality: string;
    playerRouteId: string;
};

type DisplayFixture = {
    homeTeamName: string;
    awayTeamName: string;
    date: string;
    home: boolean;
    competition: string;
    seasonId?: number;
    seasonLabel: string;
    seasonSortKey: number;
    /** When set, the card links to `/match/:id` */
    fixtureRouteId?: number;
    /** Goal totals (always home-club · away-club left-to-right); both set when a result exists. */
    homeScore?: number;
    awayScore?: number;
    homeTeamId?: number;
    awayTeamId?: number;
    metadata?: unknown;
} & FixtureResultFields;

type FixtureSeasonGroup = {
    seasonKey: string;
    seasonLabel: string;
    seasonSortKey: number;
    fixtures: DisplayFixture[];
};

type TransferBlock = {
    ins: { name: string; fee: string }[];
    outs: { name: string; fee: string }[];
};

type DisplayAchievement = { title: string; years: number[] };

type DisplayTeam = {
    name: string;
    crestUrl?: string | null;
    foundedDisplay: string;
    stadiumLabel: string;
    stadiumId?: number;
    managerName: string;
    managerNationality: string;
    managerPhotoUrl?: string | null;
    squad: DisplaySquadMember[];
    fixtures: DisplayFixture[];
    transfers: TransferBlock;
    achievements: DisplayAchievement[];
};

const emptyTransfers: TransferBlock = { ins: [], outs: [] };

function getMockPlayerRouteId(playerName: string, mockTeamNumericId: number): string {
    const playerIdMap: Record<string, Record<number, string>> = {
        'Erling Haaland': { 1: '1' },
        'Kevin De Bruyne': { 1: '2' },
        'Rúben Dias': { 1: '3' },
    };
    return playerIdMap[playerName]?.[mockTeamNumericId] || '1';
}

function initials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function ageFromIsoDate(dateStr?: string | null): number {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 0;
    const diffMs = Date.now() - d.getTime();
    return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

/** Coerces OpenAPI/string values to a finite numeric id where possible. */
function asFiniteNumberId(v: unknown): number | undefined {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
}

/** Parses API score integers (handles stringified numbers); `0` is a valid score. */
function asNullableScore(v: unknown): number | undefined {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
        const t = v.trim();
        if (t === '') return undefined;
        const n = Number(t);
        return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
}

/** Reads home/away goals from scalar columns first, then common metadata shapes (legacy sync payloads). */
function scoresFromFixtureRow(f: {
    homeScore?: unknown;
    awayScore?: unknown;
    metadata?: unknown;
}): { homeScore?: number; awayScore?: number } {
    let hs = asNullableScore(f.homeScore);
    let ascr = asNullableScore(f.awayScore);

    const metaRaw = f.metadata;
    const meta =
        metaRaw && typeof metaRaw === 'object' && metaRaw !== null
            ? (metaRaw as Record<string, unknown>)
            : undefined;

    if (meta !== undefined) {
        if (hs === undefined) {
            hs = asNullableScore(meta.homeScore ?? meta.home_score);
        }
        if (ascr === undefined) {
            ascr = asNullableScore(meta.awayScore ?? meta.away_score);
        }
    }

    if (hs === undefined || ascr === undefined) return {};

    return { homeScore: hs, awayScore: ascr };
}

function seasonLabelFromId(
    seasonId: number | undefined,
    seasonsById: Map<number, { yearStart?: number; yearEnd?: number }>,
): { seasonLabel: string; seasonSortKey: number } {
    if (seasonId === undefined) {
        return { seasonLabel: 'Season TBC', seasonSortKey: 0 };
    }
    const season = seasonsById.get(seasonId);
    if (!season) {
        return { seasonLabel: `Season ${seasonId}`, seasonSortKey: seasonId };
    }
    const start = season.yearStart ?? 0;
    const end = season.yearEnd ?? start;
    return {
        seasonLabel: `${start}/${end}`,
        seasonSortKey: start,
    };
}

function groupFixturesBySeason(fixtures: DisplayFixture[]): FixtureSeasonGroup[] {
    const bySeason = new Map<string, FixtureSeasonGroup>();
    for (const fixture of fixtures) {
        const seasonKey = fixture.seasonId != null ? String(fixture.seasonId) : fixture.seasonLabel;
        const existing = bySeason.get(seasonKey);
        if (existing) {
            existing.fixtures.push(fixture);
        } else {
            bySeason.set(seasonKey, {
                seasonKey,
                seasonLabel: fixture.seasonLabel,
                seasonSortKey: fixture.seasonSortKey,
                fixtures: [fixture],
            });
        }
    }

    return Array.from(bySeason.values())
        .sort((a, b) => b.seasonSortKey - a.seasonSortKey)
        .map((group) => ({
            ...group,
            fixtures: [...group.fixtures].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
        }));
}

function outcomeBadgeStyle(outcome: 'win' | 'draw' | 'loss'): CSSProperties {
    if (outcome === 'win') {
        return {
            backgroundColor: 'rgba(0, 255, 136, 0.15)',
            color: 'var(--modern-lime)',
            border: '1px solid rgba(0, 255, 136, 0.45)',
        };
    }
    if (outcome === 'draw') {
        return {
            backgroundColor: 'rgba(255, 214, 102, 0.12)',
            color: '#e6c862',
            border: '1px solid rgba(255, 214, 102, 0.42)',
        };
    }
    return {
        backgroundColor: 'rgba(255, 90, 90, 0.1)',
        color: '#ff8a8a',
        border: '1px solid rgba(255, 90, 90, 0.35)',
    };
}

/** Some records store nationality as JSON (`{"id":78,"name":"France"}`) or nested objects — show a readable label only. */
function displayNationalityLabel(raw: unknown): string {
    if (raw == null) return '—';
    if (typeof raw === 'object' && raw !== null && 'name' in raw && typeof (raw as { name: unknown }).name === 'string') {
        return String((raw as { name: string }).name).trim() || '—';
    }
    const s = String(raw).trim();
    if (!s) return '—';
    if (s.startsWith('{') || s.startsWith('[')) {
        try {
            const parsed: unknown = JSON.parse(s);
            if (parsed && typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
                const n = (parsed as { name: unknown }).name;
                if (typeof n === 'string' && n.trim()) return n.trim();
            }
        } catch {
            /* keep raw string below */
        }
    }
    return s;
}

function stadiumNameFromLinkedRows(
    byIdsRow: { name?: string } | null | undefined,
    byTeamLinks: Array<{ name?: string }>,
    stadiumIdCountFallback: number
): string {
    const fromExplicit = typeof byIdsRow?.name === 'string' && byIdsRow.name.trim() ? byIdsRow.name.trim() : '';
    if (fromExplicit) return fromExplicit;

    const fromTeamLink = byTeamLinks
        .map((s) => (typeof s.name === 'string' ? s.name.trim() : ''))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))[0];

    return fromTeamLink ?? (stadiumIdCountFallback > 0 ? `${stadiumIdCountFallback} ground(s)` : 'Ground TBC');
}

function mapMockToDisplay(team: (typeof mockTeams)[number]): DisplayTeam {
    return {
        name: team.name,
        crestUrl: team.crest,
        foundedDisplay: String(team.founded),
        stadiumLabel: team.stadium,
        managerName: team.manager.name,
        managerNationality: team.manager.nationality,
        managerPhotoUrl: team.manager.image,
        squad: team.squad.map((p) => ({
            name: p.name,
            position: p.position,
            positionGroup: resolvePositionGroup(p.position),
            age: p.age,
            nationality: p.nationality,
            playerRouteId: getMockPlayerRouteId(p.name, team.id),
        })),
        fixtures: team.fixtures.map((f) => {
            const year = new Date(f.date).getFullYear();
            return {
                homeTeamName: f.home ? team.name : f.opponent,
                awayTeamName: f.home ? f.opponent : team.name,
                date: f.date,
                home: f.home,
                competition: f.competition,
                seasonLabel: String(year),
                seasonSortKey: year,
            };
        }),
        transfers: team.transfers,
        achievements: team.achievements,
    };
}

function groupSquadByPosition(squad: DisplaySquadMember[]) {
    const grouped: Partial<Record<SquadPositionGroup, DisplaySquadMember[]>> = {};
    for (const group of SQUAD_POSITION_GROUP_ORDER) {
        const players = squad.filter((p) => p.positionGroup === group);
        if (players.length > 0) grouped[group] = players;
    }
    return grouped as Record<SquadPositionGroup, DisplaySquadMember[]>;
}

export function TeamPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id?: string }>();
    const routeId = id ?? '';
    const teamIdNum = routeId !== '' ? parseInt(routeId, 10) : NaN;
    const fetchFromApi = Number.isFinite(teamIdNum) && teamIdNum > 0;

    const [selectedComp, setSelectedComp] = useState<string>('All Competitions');
    const [homeAwayFilter, setHomeAwayFilter] = useState<'all' | 'home' | 'away'>('all');
    const [squadSeasonId, setSquadSeasonId] = useState<string | null>(null);
    const { navigateWithTransition } = usePageTransition();

    const { data: apiTeam, isLoading: loadingApiTeam } = useGetOneTeam(teamIdNum, {
        query: { enabled: fetchFromApi } as any,
    });

    const managerNumericId = asFiniteNumberId(apiTeam?.managerId);
    const { data: manager } = useGetOneManager(managerNumericId ?? 0, {
        query: {
            enabled: fetchFromApi && !!apiTeam && managerNumericId !== undefined,
        } as any,
    });

    /** Home grounds are now sourced from the `teamStadium` link table (replaces legacy `team.stadiumIds` / `stadium.teamIds`). */
    const { data: teamStadiumLinks = [] } = useGetQueryTeamStadium(
        { where: { teamId: teamIdNum }, take: 10 } as any,
        { query: { enabled: fetchFromApi && !!apiTeam } as any }
    );

    /** Prefer the link tagged `relationship: 'primary_home'` (set by `TeamStadiumService.ensurePrimaryHomeFromApiSportsTeams`); fall back to the first link. */
    const primaryStadiumLink = useMemo(() => {
        const primary = teamStadiumLinks.find((l) => {
            const m = (l as { metadata?: unknown }).metadata;
            return (
                m != null &&
                typeof m === 'object' &&
                (m as Record<string, unknown>)['relationship'] === 'primary_home'
            );
        });
        return primary ?? teamStadiumLinks[0];
    }, [teamStadiumLinks]);

    const linkedStadiumIds = useMemo(
        () =>
            Array.from(
                new Set(
                    teamStadiumLinks
                        .map((l) => asFiniteNumberId((l as { stadiumId?: unknown }).stadiumId))
                        .filter((n): n is number => n !== undefined)
                )
            ),
        [teamStadiumLinks]
    );

    const { data: linkedStadiums = [] } = useGetQueryStadium(
        {
            where: { id: { $in: linkedStadiumIds.length ? linkedStadiumIds : [-1] } },
            take: 10,
            order: { name: 'ASC' as const },
        } as any,
        { query: { enabled: fetchFromApi && !!apiTeam && linkedStadiumIds.length > 0 } as any }
    );

    const primaryStadium = useMemo(() => {
        const pid = asFiniteNumberId((primaryStadiumLink as { stadiumId?: unknown } | undefined)?.stadiumId);
        if (pid === undefined) return undefined;
        return linkedStadiums.find((s) => s.id === pid);
    }, [primaryStadiumLink, linkedStadiums]);

    const { data: squadResponse, isLoading: loadingSquad } = useTeamSquad(
        teamIdNum,
        squadSeasonId != null && squadSeasonId !== '' ? Number(squadSeasonId) : undefined,
        fetchFromApi && !!apiTeam,
    );

    const { data: transfersResponse } = useTeamTransfers(teamIdNum, fetchFromApi && !!apiTeam);

    const transferPlayerIds = useMemo(() => {
        const ids = new Set<number>();
        for (const row of [...(transfersResponse?.ins ?? []), ...(transfersResponse?.outs ?? [])]) {
            const pid = asFiniteNumberId(row.playerId);
            if (pid !== undefined) ids.add(pid);
        }
        return Array.from(ids);
    }, [transfersResponse]);

    const { data: transferPlayers = [] } = useGetQueryPlayer(
        { where: { id: { $in: transferPlayerIds.length ? transferPlayerIds : [-1] } }, take: 200 } as any,
        {
            query: {
                enabled: fetchFromApi && transferPlayerIds.length > 0,
            } as any,
        },
    );

    const playerNameById = useMemo(
        () => new Map(transferPlayers.map((p) => [p.id, p.name])),
        [transferPlayers],
    );

    const playersData = useMemo(
        () => [...(squadResponse?.players ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
        [squadResponse?.players],
    );

    const positionIdsForSquad = useMemo(() => {
        const ids = new Set<number>();
        for (const pl of playersData) {
            (pl.positionIds ?? []).forEach((pid) => {
                const n = asFiniteNumberId(pid);
                if (n !== undefined) ids.add(n);
            });
        }
        return Array.from(ids);
    }, [playersData]);

    const { data: positionRows = [] } = useGetQueryPosition(
        {
            where: { id: { $in: positionIdsForSquad.length ? positionIdsForSquad : [-1] } },
            take: 200,
        } as any,
        {
            query: {
                enabled: fetchFromApi && !!apiTeam && positionIdsForSquad.length > 0,
            } as any,
        }
    );

    const positionsById = useMemo(() => {
        const m = new Map<number, { name: string; type?: string }>();
        for (const p of positionRows) {
            m.set(p.id, { name: p.name, type: p.type });
        }
        return m;
    }, [positionRows]);

    const { data: homeFixturesRaw = [] } = useGetQueryFixture(
        { where: { homeTeamId: teamIdNum }, take: 75, order: { date: 'DESC' as const } } as any,
        { query: { enabled: fetchFromApi && !!apiTeam } as any }
    );

    const { data: awayFixturesRaw = [] } = useGetQueryFixture(
        { where: { awayTeamId: teamIdNum }, take: 75, order: { date: 'DESC' as const } } as any,
        { query: { enabled: fetchFromApi && !!apiTeam } as any }
    );

    const { data: opponentTeamsLookup = [] } = useGetQueryTeam(
        { take: 600 } as any,
        { query: { enabled: fetchFromApi && !!apiTeam } as any }
    );

    const { data: competitionsLookup = [] } = useGetQueryCompetition(
        { take: 400 } as any,
        { query: { enabled: fetchFromApi && !!apiTeam } as any }
    );

    const { data: allSeasons = [] } = useGetAllSeason({
        query: { enabled: fetchFromApi && !!apiTeam } as any,
    });

    const seasonsById = useMemo(
        () => new Map(allSeasons.map((s) => [s.id, { yearStart: s.yearStart, yearEnd: s.yearEnd }])),
        [allSeasons],
    );

    const mergedApiFixtures = useMemo(() => {
        type Fx = {
            id?: number | string;
            date: string;
            homeTeamId?: number | string;
            awayTeamId?: number | string;
            competitionId?: number | string;
            seasonId?: number | string;
            homeScore?: unknown;
            awayScore?: unknown;
            metadata?: unknown;
        };
        const merged = new Map<number, Fx & { id: number }>();
        for (const raw of [...(homeFixturesRaw as Fx[]), ...(awayFixturesRaw as Fx[])]) {
            const nid = asFiniteNumberId(raw.id);
            if (nid === undefined) continue;
            merged.set(nid, { ...raw, id: nid });
        }
        return Array.from(merged.values()).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [homeFixturesRaw, awayFixturesRaw]);

    const teamNameLookup = useMemo(() => new Map(opponentTeamsLookup.map((t) => [t.id, t.name])), [opponentTeamsLookup]);
    const competitionNameLookup = useMemo(() => new Map(competitionsLookup.map((c) => [c.id, c.name])), [competitionsLookup]);

    const displayTeam: DisplayTeam | null = useMemo(() => {
        const mockFallback = mockTeams.find((t) => t.id === teamIdNum);

        if (fetchFromApi && apiTeam) {
            const primaryPosFor = (p: (typeof playersData)[number]): { name: string; group: SquadPositionGroup } => {
                const pid0 = (p.positionIds ?? []).map(asFiniteNumberId).find((n) => n !== undefined);
                const info = pid0 != null ? positionsById.get(pid0) : undefined;
                const name = info?.name ?? 'Player';
                return { name, group: resolvePositionGroup(name, info?.type) };
            };

            const fixturesMapped: DisplayFixture[] = mergedApiFixtures.map((f) => {
                const isHome = asFiniteNumberId(f.homeTeamId) === teamIdNum;
                const homeTeamId = asFiniteNumberId(f.homeTeamId);
                const awayTeamId = asFiniteNumberId(f.awayTeamId);
                const homeTeamName =
                    homeTeamId !== undefined
                        ? teamNameLookup.get(homeTeamId) ?? `Team #${homeTeamId}`
                        : 'TBD';
                const awayTeamName =
                    awayTeamId !== undefined
                        ? teamNameLookup.get(awayTeamId) ?? `Team #${awayTeamId}`
                        : 'TBD';
                const compNumericId = asFiniteNumberId(f.competitionId);
                const compLabel =
                    compNumericId !== undefined
                        ? competitionNameLookup.get(compNumericId) ?? `Competition ${compNumericId}`
                        : 'Friendly';

                const seasonNumericId = asFiniteNumberId(f.seasonId);
                const { seasonLabel, seasonSortKey } = seasonLabelFromId(seasonNumericId, seasonsById);

                const dateIso =
                    typeof f.date === 'string'
                        ? f.date
                        : typeof f.date === 'number'
                          ? new Date(f.date).toISOString()
                          : '';

                const scorePair = scoresFromFixtureRow(f);
                const hasResultLine =
                    scorePair.homeScore !== undefined && scorePair.awayScore !== undefined;
                const resultMeta = parseFixtureResultFromMetadata(f.metadata, homeTeamId, awayTeamId);

                return {
                    homeTeamName,
                    awayTeamName,
                    date: dateIso,
                    home: isHome,
                    competition: compLabel,
                    seasonId: seasonNumericId,
                    seasonLabel,
                    seasonSortKey,
                    fixtureRouteId: f.id,
                    homeTeamId,
                    awayTeamId,
                    metadata: f.metadata,
                    ...resultMeta,
                    ...(hasResultLine
                        ? { homeScore: scorePair.homeScore, awayScore: scorePair.awayScore }
                        : {}),
                };
            });

            let foundedDisp = '—';
            if (apiTeam.founded != null && String(apiTeam.founded).trim() !== '') {
                const fy = new Date(apiTeam.founded as unknown as string | number).getFullYear();
                if (Number.isFinite(fy) && fy > 1600 && fy < 2100) foundedDisp = String(fy);
            }

            const stadiumLabel = stadiumNameFromLinkedRows(
                primaryStadium,
                linkedStadiums,
                linkedStadiumIds.length
            );

            return {
                name: apiTeam.name,
                crestUrl: apiTeam.logoUrl,
                foundedDisplay: foundedDisp,
                stadiumLabel,
                ...(primaryStadium?.id != null ? { stadiumId: primaryStadium.id } : {}),
                managerName: manager?.name ?? '—',
                managerNationality: displayNationalityLabel(manager?.nationality),
                managerPhotoUrl: null,
                squad: playersData.map((p) => {
                    const pos = primaryPosFor(p);
                    return {
                        name: p.name,
                        position: pos.name,
                        positionGroup: pos.group,
                        age: Math.max(0, ageFromIsoDate(typeof p.dateOfBirth === 'string' ? p.dateOfBirth : String(p.dateOfBirth))),
                        nationality: displayNationalityLabel(p.nationality),
                        playerRouteId: String(p.id),
                    };
                }),
                fixtures: fixturesMapped,
                transfers: emptyTransfers,
                achievements: [],
            };
        }

        if (mockFallback) {
            return mapMockToDisplay(mockFallback);
        }

        return null;
    }, [
        fetchFromApi,
        apiTeam,
        teamIdNum,
        playersData,
        positionsById,
        mergedApiFixtures,
        teamNameLookup,
        competitionNameLookup,
        seasonsById,
        primaryStadium,
        linkedStadiums,
        linkedStadiumIds.length,
        manager?.name,
        manager?.nationality,
    ]);

    const groupedSquad = useMemo(() => (displayTeam ? groupSquadByPosition(displayTeam.squad) : {}), [displayTeam]);

    const squadGroupLabels = useMemo(
        (): Record<SquadPositionGroup, string> => ({
            Goalkeeper: t('teamPage.squadGroupGoalkeepers'),
            Defender: t('teamPage.squadGroupDefenders'),
            Midfielder: t('teamPage.squadGroupMidfielders'),
            Forward: t('teamPage.squadGroupForwards'),
        }),
        [t],
    );

    const competitions = displayTeam ? Array.from(new Set(displayTeam.fixtures.map((f) => f.competition))) : [];
    const compOptions = ['All Competitions', ...competitions];

    const filteredFixtures =
        displayTeam?.fixtures.filter((f) => {
            const matchesComp = selectedComp === 'All Competitions' || f.competition === selectedComp;
            const matchesVenue =
                homeAwayFilter === 'all' ? true : homeAwayFilter === 'home' ? f.home === true : f.home === false;
            return matchesComp && matchesVenue;
        }) ?? [];

    const fixtureGroups = useMemo(() => groupFixturesBySeason(filteredFixtures), [filteredFixtures]);

    const squadSeasonOptions = useMemo(
        () => [
            { value: '', label: t('teamPage.squadCurrent') },
            ...[...allSeasons]
                .sort((a, b) => (b.yearStart ?? 0) - (a.yearStart ?? 0))
                .map((s) => ({
                    value: String(s.id),
                    label: `${s.yearStart}/${s.yearEnd}`,
                })),
        ],
        [allSeasons, t],
    );

    const transferDisplay = useMemo((): TransferBlock => {
        if (!fetchFromApi || !transfersResponse) return emptyTransfers;
        const formatFee = (fee: number) =>
            fee > 0 ? `£${(fee / 1_000_000).toFixed(1)}m` : t('teamPage.transferUndisclosed');
        return {
            ins: transfersResponse.ins.map((row) => ({
                name: playerNameById.get(row.playerId) ?? `Player #${row.playerId}`,
                fee: formatFee(row.transferFee),
            })),
            outs: transfersResponse.outs.map((row) => ({
                name: playerNameById.get(row.playerId) ?? `Player #${row.playerId}`,
                fee: formatFee(row.transferFee),
            })),
        };
    }, [fetchFromApi, transfersResponse, playerNameById, t]);

    const loadingPrimary = fetchFromApi && loadingApiTeam;

    if (loadingPrimary) {
        return (
            <Container size="xl" py="xl" pos="relative" mih={400}>
                <LoadingOverlay visible zIndex={10} overlayProps={{ radius: 'sm', blur: 6 }} />
            </Container>
        );
    }

    if (!displayTeam) {
        return (
            <Container py="xl">
                <Title order={2}>Team not found</Title>
                <Text c="dimmed">There is no team for this link (ID {id ?? 'missing'}).</Text>
            </Container>
        );
    }

    const team = displayTeam;

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
                        {team.crestUrl ? (
                            <Image
                                src={team.crestUrl}
                                alt={team.name}
                                width={120}
                                height={120}
                                fit="contain"
                                style={{
                                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                                }}
                            />
                        ) : (
                            <Avatar size={120} radius={0} style={{ border: '2px solid var(--modern-lime)' }}>
                                {initials(team.name)}
                            </Avatar>
                        )}
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
                                    Founded {team.foundedDisplay}
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <IconMapPin size={18} style={{ color: 'var(--modern-text-secondary)' }} />
                                {team.stadiumId != null ? (
                                    <Text
                                        component="button"
                                        type="button"
                                        size="sm"
                                        c="dimmed"
                                        onClick={() =>
                                            navigateWithTransition(`/stadium/${team.stadiumId}`, {
                                                transitionType: 'loading',
                                                duration: 900,
                                            })
                                        }
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            padding: 0,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {team.stadiumLabel}
                                    </Text>
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        {team.stadiumLabel}
                                    </Text>
                                )}
                            </Group>
                        </Group>
                    </Stack>

                    <Box
                        component={managerNumericId != null ? 'button' : 'div'}
                        onClick={
                            managerNumericId != null
                                ? () =>
                                      navigateWithTransition(`/manager/${managerNumericId}`, {
                                          transitionType: 'loading',
                                          duration: 900,
                                      })
                                : undefined
                        }
                        style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--modern-bg-tertiary)',
                            border: '1px solid var(--modern-card-border)',
                            borderRadius: 0,
                            minWidth: '200px',
                            cursor: managerNumericId != null ? 'pointer' : 'default',
                            textAlign: 'left',
                        }}
                    >
                        <Group gap="md">
                            {team.managerPhotoUrl ? (
                                <Image
                                    src={team.managerPhotoUrl}
                                    width={60}
                                    height={60}
                                    radius={0}
                                    style={{
                                        border: '2px solid var(--modern-card-border)',
                                    }}
                                />
                            ) : (
                                <Avatar size={60} radius={0} style={{ border: '2px solid var(--modern-card-border)' }}>
                                    {initials(team.managerName)}
                                </Avatar>
                            )}
                            <Stack gap="xs">
                                <Group gap="xs">
                                    <IconUser size={16} style={{ color: 'var(--modern-text-secondary)' }} />
                                    <Text size="xs" c="dimmed" fw={500}>
                                        Manager
                                    </Text>
                                </Group>
                                <Text fw={600} size="md">
                                    {team.managerName}
                                </Text>
                                <Group gap="xs">
                                    <IconFlag size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                                    <Text size="xs" c="dimmed">
                                        {team.managerNationality}
                                    </Text>
                                </Group>
                            </Stack>
                        </Group>
                    </Box>
                </Group>
            </Box>

            <Tabs
                defaultValue="squad"
                styles={{
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
                }}
            >
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
                        {fetchFromApi && squadSeasonOptions.length > 1 && (
                            <Select
                                label={t('teamPage.squadSeasonLabel')}
                                data={squadSeasonOptions}
                                value={squadSeasonId ?? ''}
                                onChange={(v) => setSquadSeasonId(v === '' || v == null ? null : v)}
                                maw={280}
                                allowDeselect={false}
                            />
                        )}
                        {loadingSquad && fetchFromApi ? (
                            <Center py="xl">
                                <LoadingOverlay visible zIndex={5} overlayProps={{ blur: 1 }} />
                            </Center>
                        ) : Object.keys(groupedSquad).length === 0 ? (
                            <Center py="xl">
                                <Stack align="center" gap="md">
                                    <IconUsers size={48} style={{ color: 'var(--modern-text-secondary)', opacity: 0.5 }} />
                                    <Text size="lg" c="dimmed" fw={500}>
                                        {t('teamPage.squadEmptyTitle')}
                                    </Text>
                                    <Text size="sm" ta="center" maw={480} c="dimmed">
                                        {t('teamPage.squadEmptyHint')}
                                    </Text>
                                </Stack>
                            </Center>
                        ) : (
                            Object.entries(groupedSquad).map(([positionGroup, players], positionIndex) => (
                                <Box key={positionGroup}>
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
                                            {squadGroupLabels[positionGroup as SquadPositionGroup] ?? positionGroup}
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
                                                key={`${player.name}-${player.playerRouteId}`}
                                                className="modern-card"
                                                padding="lg"
                                                radius={0}
                                                withBorder={false}
                                                onClick={() =>
                                                    navigateWithTransition(`/player/${player.playerRouteId}`, {
                                                        transitionType: 'loading',
                                                        duration: 1200,
                                                    })
                                                }
                                                style={{
                                                    animation: `fadeInUp 0.6s ease-out ${positionIndex * 0.1 + playerIndex * 0.05}s both`,
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
                                                        {initials(player.name)}
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
                                                            <IconFlag
                                                                size={14}
                                                                style={{ color: 'var(--modern-text-secondary)', flexShrink: 0 }}
                                                            />
                                                            <Text
                                                                size="sm"
                                                                c="dimmed"
                                                                style={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {player.nationality}
                                                            </Text>
                                                        </Group>
                                                        <Group gap="xs">
                                                            <Text size="sm" c="dimmed">
                                                                Age:
                                                            </Text>
                                                            <Text size="sm" fw={500}>
                                                                {player.age || '—'}
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
                            ))
                        )}
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
                        <Stack gap="xl">
                            {fixtureGroups.map((seasonGroup) => (
                                <Box key={seasonGroup.seasonKey}>
                                    <Group gap="md" mb="lg" align="center">
                                        <Box
                                            style={{
                                                width: '4px',
                                                height: '24px',
                                                backgroundColor: 'var(--modern-lime)',
                                            }}
                                        />
                                        <Title order={3} style={{ fontSize: '1.35rem', fontWeight: 600 }}>
                                            {seasonGroup.seasonLabel}
                                        </Title>
                                        <Badge
                                            variant="light"
                                            style={{
                                                backgroundColor: 'rgba(0, 255, 136, 0.08)',
                                                color: 'var(--modern-lime)',
                                                border: '1px solid rgba(0, 255, 136, 0.2)',
                                            }}
                                        >
                                            {seasonGroup.fixtures.length}{' '}
                                            {seasonGroup.fixtures.length === 1 ? 'match' : 'matches'}
                                        </Badge>
                                    </Group>

                                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                                        {seasonGroup.fixtures.map((f, i) => {
                                            const openFixture = f.fixtureRouteId != null;
                                            const outcome = resolveFixtureOutcome(
                                                {
                                                    homeScore: f.homeScore,
                                                    awayScore: f.awayScore,
                                                    homeTeamId: f.homeTeamId,
                                                    awayTeamId: f.awayTeamId,
                                                    metadata: f.metadata as Record<string, unknown> | undefined,
                                                },
                                                teamIdNum,
                                            );
                                            const decidedOnPens = isPenaltyDecided(f);
                                            const hasScores =
                                                f.homeScore !== undefined && f.awayScore !== undefined;
                                            const hasPenScoreline =
                                                decidedOnPens &&
                                                f.homePenaltyScore !== undefined &&
                                                f.awayPenaltyScore !== undefined;
                                            const resultAccentBorder =
                                                outcome === 'win'
                                                    ? 'var(--modern-lime)'
                                                    : outcome === 'draw'
                                                      ? '#c9ab3d'
                                                      : outcome === 'loss'
                                                        ? 'rgba(255, 105, 105, 0.9)'
                                                        : undefined;

                                            return (
                                                <Card
                                                    key={
                                                        f.fixtureRouteId != null
                                                            ? `fx-${f.fixtureRouteId}`
                                                            : `${f.date}-${f.homeTeamName}-${f.awayTeamName}-${i}`
                                                    }
                                                    className="modern-card"
                                                    padding="lg"
                                                    radius={0}
                                                    withBorder={false}
                                                    onClick={
                                                        openFixture
                                                            ? () =>
                                                                  navigateWithTransition(
                                                                      `/match/${f.fixtureRouteId}`,
                                                                      {
                                                                          transitionType: 'loading',
                                                                          duration: 1200,
                                                                      },
                                                                  )
                                                            : undefined
                                                    }
                                                    style={{
                                                        animation: `fadeInUp 0.6s ease-out ${i * 0.05}s both`,
                                                        cursor: openFixture ? 'pointer' : 'default',
                                                        ...(resultAccentBorder != null && outcome != null
                                                            ? {
                                                                  borderLeft: `4px solid ${resultAccentBorder}`,
                                                              }
                                                            : {}),
                                                    }}
                                                    role={openFixture ? 'button' : undefined}
                                                >
                                                    <Stack gap="sm">
                                                        <Group
                                                            justify="space-between"
                                                            align="flex-start"
                                                            wrap="nowrap"
                                                            gap="xs"
                                                        >
                                                            <Badge
                                                                variant="light"
                                                                style={{
                                                                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                                    color: 'var(--modern-lime)',
                                                                    border: '1px solid rgba(0, 255, 136, 0.2)',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {f.competition}
                                                            </Badge>
                                                            <Group gap="xs" justify="flex-end" wrap="wrap">
                                                                {outcome != null && (
                                                                    <Badge
                                                                        variant="light"
                                                                        fw={700}
                                                                        tt="uppercase"
                                                                        style={{
                                                                            flexShrink: 0,
                                                                            ...outcomeBadgeStyle(outcome),
                                                                        }}
                                                                    >
                                                                        {outcome === 'win'
                                                                            ? decidedOnPens
                                                                                ? t('teamPage.outcomeWinPens')
                                                                                : t('teamPage.outcomeWin')
                                                                            : outcome === 'draw'
                                                                              ? t('teamPage.outcomeDraw')
                                                                              : decidedOnPens
                                                                                ? t('teamPage.outcomeLossPens')
                                                                                : t('teamPage.outcomeLoss')}
                                                                    </Badge>
                                                                )}
                                                                <Badge
                                                                    variant={f.home ? 'filled' : 'outline'}
                                                                    style={{
                                                                        flexShrink: 0,
                                                                        backgroundColor: f.home
                                                                            ? 'var(--modern-lime)'
                                                                            : 'transparent',
                                                                        color: f.home
                                                                            ? 'var(--modern-bg-primary)'
                                                                            : 'var(--modern-lime)',
                                                                        borderColor: 'var(--modern-lime)',
                                                                    }}
                                                                >
                                                                    {f.home ? t('teamPage.home') : t('teamPage.away')}
                                                                </Badge>
                                                            </Group>
                                                        </Group>
                                                        <Divider color="var(--modern-card-border)" />
                                                        <Stack gap={2} align="center">
                                                            <Text fw={600} size="lg" ta="center" lh={1.25}>
                                                                {f.homeTeamName}{' '}
                                                                <span
                                                                    style={{
                                                                        color: 'var(--modern-text-secondary)',
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    vs
                                                                </span>{' '}
                                                                {f.awayTeamName}
                                                            </Text>
                                                        </Stack>
                                                        {hasScores && (
                                                            <Stack gap={4} align="center">
                                                                <Text
                                                                    fw={700}
                                                                    size="xl"
                                                                    ta="center"
                                                                    lh={1.2}
                                                                    title={
                                                                        hasPenScoreline
                                                                            ? t('teamPage.scoreTooltipWithPens', {
                                                                                  homeTeam: f.homeTeamName,
                                                                                  awayTeam: f.awayTeamName,
                                                                                  homeScore: f.homeScore!,
                                                                                  awayScore: f.awayScore!,
                                                                                  homePens: f.homePenaltyScore!,
                                                                                  awayPens: f.awayPenaltyScore!,
                                                                              })
                                                                            : t('teamPage.scoreTooltip', {
                                                                                  homeTeam: f.homeTeamName,
                                                                                  awayTeam: f.awayTeamName,
                                                                                  homeScore: f.homeScore!,
                                                                                  awayScore: f.awayScore!,
                                                                              })
                                                                    }
                                                                    style={{
                                                                        fontVariantNumeric: 'tabular-nums',
                                                                        letterSpacing: '0.05em',
                                                                    }}
                                                                >
                                                                    {f.homeScore} – {f.awayScore}
                                                                </Text>
                                                                {hasPenScoreline && (
                                                                    <Text
                                                                        size="sm"
                                                                        c="dimmed"
                                                                        ta="center"
                                                                        style={{ fontVariantNumeric: 'tabular-nums' }}
                                                                    >
                                                                        {t('teamPage.penaltiesLine', {
                                                                            home: f.homePenaltyScore!,
                                                                            away: f.awayPenaltyScore!,
                                                                        })}
                                                                    </Text>
                                                                )}
                                                            </Stack>
                                                        )}
                                                        <Group justify="center" gap="xs">
                                                            <IconCalendar
                                                                size={14}
                                                                style={{ color: 'var(--modern-text-secondary)' }}
                                                            />
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
                                            );
                                        })}
                                    </SimpleGrid>
                                </Box>
                            ))}
                        </Stack>
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
                            {transferDisplay.ins.length === 0 ? (
                                <Text c="dimmed">{t('teamPage.noTransfersIn')}</Text>
                            ) : (
                                <Stack gap="md">
                                    {transferDisplay.ins.map((tr) => (
                                        <Card
                                            key={`in-${tr.name}-${tr.fee}`}
                                            style={{
                                                backgroundColor: 'var(--modern-bg-tertiary)',
                                                border: '1px solid var(--modern-card-border)',
                                                padding: '1rem',
                                            }}
                                        >
                                            <Group justify="space-between" align="center">
                                                <Text fw={500}>{tr.name}</Text>
                                                <Badge
                                                    variant="light"
                                                    style={{
                                                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                        color: 'var(--modern-lime)',
                                                        border: '1px solid rgba(0, 255, 136, 0.2)',
                                                    }}
                                                >
                                                    {tr.fee}
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
                                <Title order={3}>Transfers Out</Title>
                            </Group>
                            {transferDisplay.outs.length === 0 ? (
                                <Text c="dimmed">{t('teamPage.noTransfersOut')}</Text>
                            ) : (
                                <Stack gap="md">
                                    {transferDisplay.outs.map((tr) => (
                                        <Card
                                            key={`out-${tr.name}-${tr.fee}`}
                                            style={{
                                                backgroundColor: 'var(--modern-bg-tertiary)',
                                                border: '1px solid var(--modern-card-border)',
                                                padding: '1rem',
                                            }}
                                        >
                                            <Group justify="space-between" align="center">
                                                <Text fw={500}>{tr.name}</Text>
                                                <Badge
                                                    variant="outline"
                                                    style={{
                                                        color: 'var(--modern-text-secondary)',
                                                        borderColor: 'var(--modern-card-border)',
                                                    }}
                                                >
                                                    {tr.fee}
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
