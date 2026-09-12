import { useMemo, useState } from 'react';
import { Box, LoadingOverlay, Stack } from '@mantine/core';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetQueryCompetition } from '@iWatchFootball/clients/controllers/competition';
import type { Competition, Fixture, Team } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { usePageTransition } from '../hooks/usePageTransition';
import { MatchToolbar } from '../components/filters/MatchToolbar';
import { formatMatchShortDate, useTranslation } from '../i18n';
import { scoresFromFixtureRow } from '../shared/fixtureScores';
import { formatLiveClockLabel, LIVE_FIXTURE_POLL_MS } from '../shared/liveClock';
import { queryTicketLinks } from '../shared/api/ticketLink.api';
import { useQuery } from '@tanstack/react-query';
import {
    UiBody,
    UiCard,
    UiH1,
    UiH3,
    UiMatchList,
    UiPageContainer,
    type MatchRowData,
} from '../components/ui';
import {
    buildDeprecatedMockMatches,
    deprecatedMockTeamCrests,
    isDeprecatedMatchMocksEnabled,
} from './matches/deprecatedMockMatches';

type DayMatch = {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    homeLogo?: string;
    awayLogo?: string;
    homeScore?: number;
    awayScore?: number;
    hasTickets?: boolean;
    isLive?: boolean;
    time?: string;
};

function isFinishedMatch(m: DayMatch): boolean {
    if (m.isLive) return false;
    return m.homeScore != null && m.awayScore != null;
}

function ticketsAvailable(m: DayMatch): boolean {
    return !!m.hasTickets && !isFinishedMatch(m);
}

function toMatchRowData(m: DayMatch): MatchRowData {
    const kickoff = new Date(m.date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (m.isLive) {
        return {
            id: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            homeLogo: m.homeLogo,
            awayLogo: m.awayLogo,
            time: m.time ?? 'LIVE',
            isLive: true,
            hasTickets: ticketsAvailable(m),
        };
    }

    if (m.homeScore != null && m.awayScore != null) {
        return {
            id: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            homeLogo: m.homeLogo,
            awayLogo: m.awayLogo,
            time: m.time && m.time !== kickoff ? m.time : 'FT',
            isLive: false,
            hasTickets: false,
        };
    }

    return {
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeLogo: m.homeLogo,
        awayLogo: m.awayLogo,
        time: m.time ?? kickoff,
        isLive: false,
        hasTickets: ticketsAvailable(m),
    };
}

function dayRangeIso(day: Date): { from: string; to: string } {
    const from = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    const to = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
}

function uniqueIds(values: Array<number | undefined>): number[] {
    return Array.from(new Set(values.filter((id): id is number => typeof id === 'number')));
}

function ticketedFixtureIds(
    fixtures: Fixture[],
    links: Array<{ fixtureId?: number; teamId?: number; competitionId?: number }>,
): Set<number> {
    const ids = new Set<number>();
    for (const fix of fixtures) {
        const hit = links.some((l) => {
            if (l.fixtureId != null && l.fixtureId === fix.id) return true;
            if (l.teamId != null && (l.teamId === fix.homeTeamId || l.teamId === fix.awayTeamId)) return true;
            if (l.competitionId != null && l.competitionId === fix.competitionId) return true;
            return false;
        });
        if (hit) ids.add(fix.id);
    }
    return ids;
}

function mapApiFixtures(
    fixtures: Fixture[],
    teams: Team[],
    competitions: Competition[],
    ticketedIds: Set<number>,
): DayMatch[] {
    const teamById = new Map(teams.map((t) => [t.id, t]));
    const competitionById = new Map(competitions.map((c) => [c.id, c]));

    return fixtures.map((fix) => {
        const home = typeof fix.homeTeamId === 'number' ? teamById.get(fix.homeTeamId) : undefined;
        const away = typeof fix.awayTeamId === 'number' ? teamById.get(fix.awayTeamId) : undefined;
        const competition = competitionById.get(fix.competitionId);
        const scores = scoresFromFixtureRow(fix);
        const isLive = fix.status === 'Live';
        return {
            id: String(fix.id),
            competitionName: competition?.name?.trim() || 'Competition',
            homeTeam: home?.name?.trim() || (fix.homeTeamId != null ? `Team ${fix.homeTeamId}` : 'Home'),
            awayTeam: away?.name?.trim() || (fix.awayTeamId != null ? `Team ${fix.awayTeamId}` : 'Away'),
            date: fix.date,
            homeLogo: home?.logoUrl,
            awayLogo: away?.logoUrl,
            homeScore: scores.homeScore,
            awayScore: scores.awayScore,
            isLive,
            hasTickets: ticketedIds.has(fix.id),
            time: formatLiveClockLabel({
                status: fix.status,
                metadata: fix.metadata,
                kickoffIso: fix.date,
            }),
        };
    });
}

export function MatchesPage() {
    const { navigateWithTransition } = usePageTransition();
    const { t } = useTranslation();
    const useDeprecatedMocks = isDeprecatedMatchMocksEnabled();
    const [showLive, setShowLive] = useState(false);
    const [showAvailableTickets, setShowAvailableTickets] = useState(false);
    const [teamSearch, setTeamSearch] = useState('');

    const windowSize = 7;

    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const [currentStartDate, setCurrentStartDate] = useState(() => {
        const d = new Date(today);
        d.setDate(d.getDate() - 3);
        return d;
    });

    const [selectedDateIndex, setSelectedDateIndex] = useState(3);

    const dates = useMemo(() => {
        const arr: Date[] = [];
        for (let i = 0; i < windowSize; i++) {
            const d = new Date(currentStartDate);
            d.setDate(currentStartDate.getDate() + i);
            d.setHours(0, 0, 0, 0);
            arr.push(d);
        }
        return arr;
    }, [currentStartDate, windowSize]);

    const selectedDate = dates[selectedDateIndex];
    const isSelectedToday =
        !!selectedDate && selectedDate.toDateString() === today.toDateString();
    const { from, to } = useMemo(
        () => (selectedDate ? dayRangeIso(selectedDate) : { from: '', to: '' }),
        [selectedDate],
    );

    const {
        data: apiFixtures = [],
        isLoading: loadingFixtures,
        isFetching: fetchingFixtures,
    } = useGetQueryFixture(
        {
            where: { date: { $gte: from, $lte: to } },
            take: 200,
            order: { date: 'ASC' },
        } as any,
        {
            query: {
                enabled: !useDeprecatedMocks && !!from,
                refetchInterval: !useDeprecatedMocks && isSelectedToday ? LIVE_FIXTURE_POLL_MS : false,
            } as any,
        },
    );

    const { data: ticketLinks = [] } = useQuery({
        queryKey: ['ticket-links', 'matches-list'],
        queryFn: () => queryTicketLinks({}),
        enabled: !useDeprecatedMocks,
        staleTime: 60_000,
    });

    const fixtures = Array.isArray(apiFixtures) ? apiFixtures : [];

    const teamIds = useMemo(
        () => uniqueIds(fixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId])),
        [fixtures],
    );
    const competitionIds = useMemo(
        () => uniqueIds(fixtures.map((f) => f.competitionId)),
        [fixtures],
    );

    const { data: teamsData = [], isLoading: loadingTeams } = useGetQueryTeam(
        { where: { id: { $in: teamIds.length ? teamIds : [-1] } }, take: Math.max(teamIds.length, 1) } as any,
        { query: { enabled: !useDeprecatedMocks && teamIds.length > 0 } as any },
    );
    const { data: competitionsData = [], isLoading: loadingCompetitions } = useGetQueryCompetition(
        {
            where: { id: { $in: competitionIds.length ? competitionIds : [-1] } },
            take: Math.max(competitionIds.length, 1),
        } as any,
        { query: { enabled: !useDeprecatedMocks && competitionIds.length > 0 } as any },
    );

    const matches = useMemo((): DayMatch[] => {
        if (useDeprecatedMocks && selectedDate) {
            return buildDeprecatedMockMatches(selectedDate, today).map((m) => ({
                ...m,
                homeLogo: deprecatedMockTeamCrests[m.homeTeam],
                awayLogo: deprecatedMockTeamCrests[m.awayTeam],
            }));
        }
        return mapApiFixtures(
            fixtures,
            Array.isArray(teamsData) ? teamsData : [],
            Array.isArray(competitionsData) ? competitionsData : [],
            ticketedFixtureIds(fixtures, ticketLinks),
        );
    }, [useDeprecatedMocks, selectedDate, today, fixtures, teamsData, competitionsData, ticketLinks]);

    const loading = useDeprecatedMocks
        ? false
        : loadingFixtures ||
          fetchingFixtures ||
          (teamIds.length > 0 && loadingTeams) ||
          (competitionIds.length > 0 && loadingCompetitions);

    function onPrevClick() {
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() - 1);
        setCurrentStartDate(newStart);
    }

    function onNextClick() {
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() + 1);
        setCurrentStartDate(newStart);
    }

    function onDateSelect(date: Date) {
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);

        const indexInWindow = dates.findIndex((d) => d.toDateString() === selected.toDateString());

        if (indexInWindow !== -1) {
            setSelectedDateIndex(indexInWindow);
        } else {
            const newStart = new Date(selected);
            newStart.setDate(selected.getDate() - 3);
            setCurrentStartDate(newStart);
            setSelectedDateIndex(3);
        }
    }

    function onReturnToToday() {
        const t0 = new Date();
        t0.setHours(0, 0, 0, 0);
        const newStart = new Date(t0);
        newStart.setDate(t0.getDate() - 3);
        setCurrentStartDate(newStart);
        setSelectedDateIndex(3);
    }

    function getDateLabelForNav(d: Date): string {
        const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diff = (dayDate.getTime() - dayToday.getTime()) / (24 * 3600 * 1000);

        if (diff === 0) return t('matches.today');
        if (diff === -1) return t('matches.yesterday');
        if (diff === 1) return t('matches.tomorrow');
        return formatMatchShortDate(d);
    }

    const filteredMatches = useMemo(() => {
        const query = teamSearch.trim().toLowerCase();
        return matches.filter((match) => {
            if (showLive && !match.isLive) return false;
            if (showAvailableTickets && !ticketsAvailable(match)) return false;
            if (query) {
                const inHome = match.homeTeam.toLowerCase().includes(query);
                const inAway = match.awayTeam.toLowerCase().includes(query);
                if (!inHome && !inAway) return false;
            }
            return true;
        });
    }, [matches, showLive, showAvailableTickets, teamSearch]);

    const matchGroups = useMemo(() => {
        const byCompetition = filteredMatches.reduce<Record<string, DayMatch[]>>((acc, match) => {
            if (!acc[match.competitionName]) acc[match.competitionName] = [];
            acc[match.competitionName].push(match);
            return acc;
        }, {});

        return Object.entries(byCompetition).map(([league, compMatches]) => ({
            league,
            matches: compMatches.map(toMatchRowData),
        }));
    }, [filteredMatches]);

    const isEmpty = matchGroups.length === 0 && !loading;

    return (
        <Box style={{ backgroundColor: 'var(--ui-bg-base)', minHeight: '100vh' }}>
            <UiPageContainer size="lg">
                <Stack gap="lg">
                    <UiH1>{t('matches.title')}</UiH1>

                    <MatchToolbar
                        dates={dates}
                        selectedDateIndex={selectedDateIndex}
                        setSelectedDateIndex={setSelectedDateIndex}
                        onPrevClick={onPrevClick}
                        onNextClick={onNextClick}
                        onDateSelect={onDateSelect}
                        onReturnToToday={onReturnToToday}
                        getDateLabel={getDateLabelForNav}
                        showLive={showLive}
                        setShowLive={setShowLive}
                        showAvailableTickets={showAvailableTickets}
                        setShowAvailableTickets={setShowAvailableTickets}
                        teamSearch={teamSearch}
                        onTeamSearchChange={setTeamSearch}
                    />

                    <Box pos="relative" mih={200}>
                        <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} zIndex={10} />

                        {isEmpty ? (
                            <UiCard density="spacious" style={{ textAlign: 'center' }}>
                                <UiH3 style={{ marginBottom: '0.5rem' }}>
                                    {showLive || showAvailableTickets || teamSearch.trim()
                                        ? t('matches.noMatchesFilters')
                                        : t('matches.noMatchesDate')}
                                </UiH3>
                                <UiBody>
                                    {showLive || showAvailableTickets || teamSearch.trim()
                                        ? t('matches.tryAdjustingFilters')
                                        : t('matches.checkBackLater')}
                                </UiBody>
                            </UiCard>
                        ) : (
                            <UiMatchList
                                groups={matchGroups}
                                onMatchClick={(id) => navigateWithTransition(`/match/${id}`)}
                            />
                        )}
                    </Box>
                </Stack>
            </UiPageContainer>
        </Box>
    );
}
