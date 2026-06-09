import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Container,
    Box,
    Stack,
    LoadingOverlay,
    Text,
    Center,
} from '@mantine/core';
import {useParams} from 'react-router-dom';
import {ScorePredictionCard} from '../../components/predictions';
import {MatchHeader, MatchEventsSection, TeamFormSection, type MatchDetails, type TeamFormResult, getMatchStatus} from '../../components/match';
import TeamLineups from "./teamLineup";
import { MatchInsightPanel } from '../../components/match/MatchInsightPanel';
import { useGetOneFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetOneTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetOneStadium } from '@iWatchFootball/clients/controllers/stadium';
import { useGetOneCompetition } from '@iWatchFootball/clients/controllers/competition';
import { clientInstance } from '@iWatchFootball/clients/client-instance';
import { useTranslation } from '../../i18n/useTranslation';
import {
    attachLineupsToFixtureSides,
    collectPositionIds,
    normalizePositionQueryResult,
    type ApiLineUpBundle,
} from '../../components/match/lineupFromApi';

// Re-export types + calendar helper for backward compatibility
export type { MatchDetails, Player, Lineup } from '../../components/match';
export { getMatchStatus } from '../../components/match';

/** Validates last-five form from fixture metadata (array of letters or five-char string). */
function parseRecentForm(value: unknown): TeamFormResult[] | null {
    const letter = (c: string): TeamFormResult | null => {
        const u = c.toUpperCase();
        return u === 'W' || u === 'D' || u === 'L' ? u : null;
    };
    if (typeof value === 'string') {
        const s = value.trim();
        if (s.length !== 5) return null;
        const out: TeamFormResult[] = [];
        for (let i = 0; i < 5; i++) {
            const r = letter(s[i]!);
            if (!r) return null;
            out.push(r);
        }
        return out;
    }
    if (Array.isArray(value) && value.length === 5) {
        const out: TeamFormResult[] = [];
        for (const x of value) {
            if (typeof x !== 'string' || x.trim().length !== 1) return null;
            const r = letter(x.trim()[0]!);
            if (!r) return null;
            out.push(r);
        }
        return out;
    }
    return null;
}

/** Demo routes use ids like `match2`; numeric ids load fixture `GET /fixture/:id`. */
function routeUsesHardcodedMatchPreview(routeFixtureId: string | undefined): boolean {
    return routeFixtureId != null && routeFixtureId.toLowerCase().includes('match');
}

export function MatchPage() {
    const { t } = useTranslation();
    const { id: routeFixtureId } = useParams<{ id: string }>();
    const fixtureNumericId = routeFixtureId ? parseInt(routeFixtureId, 10) : NaN;
    const useHardcodedPreview = routeUsesHardcodedMatchPreview(routeFixtureId);
    const fetchFromApi = !useHardcodedPreview && Number.isFinite(fixtureNumericId);

    const hardcodedMatchDetails: MatchDetails = useMemo(
        () => ({
            matchId: routeFixtureId || '1',
            homeTeam: 'Liverpool',
            awayTeam: 'Manchester City',
            homeTeamId: 1,
            awayTeamId: 2,
            date: '2025-01-24T15:00:00Z',
            venue: 'Anfield',
            competition: 'Premier League',
            competitionId: 1,
            homeTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
            awayTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
            homeLineup: {
                formation: '4-3-3',
                players: [
                    { id: 'h1', name: 'Alisson', number: 1, position: 'GK' },
                    { id: 'h2', name: 'Alexander-Arnold', number: 66, position: 'DF' },
                    { id: 'h3', name: 'Van Dijk', number: 4, position: 'DF' },
                    { id: 'h4', name: 'Konate', number: 5, position: 'DF' },
                    { id: 'h5', name: 'Robertson', number: 26, position: 'DF' },
                    { id: 'h6', name: 'Mac Allister', number: 7, position: 'MF' },
                    { id: 'h7', name: 'Szoboszlai', number: 8, position: 'MF' },
                    { id: 'h8', name: 'Jones', number: 17, position: 'MF' },
                    { id: 'h9', name: 'Salah', number: 11, position: 'FW' },
                    { id: 'h10', name: 'Nunez', number: 27, position: 'FW' },
                    { id: 'h11', name: 'Diaz', number: 23, position: 'FW' },
                ],
                substitutes: [
                    { id: 'hs1', name: 'Kelleher', number: 62, position: 'GK' },
                    { id: 'hs2', name: 'Gomez', number: 12, position: 'DF' },
                    { id: 'hs3', name: 'Endo', number: 6, position: 'MF' },
                    { id: 'hs4', name: 'Elliott', number: 67, position: 'MF' },
                    { id: 'hs5', name: 'Gakpo', number: 18, position: 'FW' },
                ],
            },
            awayLineup: {
                formation: '4-2-3-1',
                players: [
                    { id: 'a1', name: 'Ederson', number: 31, position: 'GK' },
                    { id: 'a2', name: 'Walker', number: 2, position: 'DF' },
                    { id: 'a3', name: 'Dias', number: 3, position: 'DF' },
                    { id: 'a4', name: 'Stones', number: 5, position: 'DF' },
                    { id: 'a5', name: 'Ake', number: 6, position: 'DF' },
                    { id: 'a6', name: 'Rodri', number: 16, position: 'MF' },
                    { id: 'a7', name: 'De Bruyne', number: 17, position: 'MF' },
                    { id: 'a8', name: 'Bernardo', number: 20, position: 'MF' },
                    { id: 'a9', name: 'Foden', number: 47, position: 'MF' },
                    { id: 'a10', name: 'Grealish', number: 10, position: 'MF' },
                    { id: 'a11', name: 'Haaland', number: 9, position: 'FW' },
                ],
                substitutes: [
                    { id: 'as1', name: 'Ortega', number: 33, position: 'GK' },
                    { id: 'as2', name: 'Akanji', number: 25, position: 'DF' },
                    { id: 'as3', name: 'Kovacic', number: 8, position: 'MF' },
                    { id: 'as4', name: 'Doku', number: 11, position: 'FW' },
                    { id: 'as5', name: 'Alvarez', number: 15, position: 'FW' },
                ],
            },
            homePredictedLineup: {
                formation: '4-3-3',
                players: [
                    { id: 'hp1', name: 'Alisson', number: 1, position: 'GK' },
                    { id: 'hp2', name: 'Alexander-Arnold', number: 66, position: 'DF' },
                    { id: 'hp3', name: 'Van Dijk', number: 4, position: 'DF' },
                    { id: 'hp4', name: 'Konate', number: 5, position: 'DF' },
                    { id: 'hp5', name: 'Robertson', number: 26, position: 'DF' },
                    { id: 'hp6', name: 'Mac Allister', number: 7, position: 'MF' },
                    { id: 'hp7', name: 'Szoboszlai', number: 8, position: 'MF' },
                    { id: 'hp8', name: 'Jones', number: 17, position: 'MF' },
                    { id: 'hp9', name: 'Salah', number: 11, position: 'FW' },
                    { id: 'hp10', name: 'Nunez', number: 27, position: 'FW' },
                    { id: 'hp11', name: 'Diaz', number: 23, position: 'FW' },
                ],
            },
            awayPredictedLineup: {
                formation: '4-2-3-1',
                players: [
                    { id: 'ap1', name: 'Ederson', number: 31, position: 'GK' },
                    { id: 'ap2', name: 'Walker', number: 2, position: 'DF' },
                    { id: 'ap3', name: 'Dias', number: 3, position: 'DF' },
                    { id: 'ap4', name: 'Stones', number: 5, position: 'DF' },
                    { id: 'ap5', name: 'Ake', number: 6, position: 'DF' },
                    { id: 'ap6', name: 'Rodri', number: 16, position: 'MF' },
                    { id: 'ap7', name: 'De Bruyne', number: 17, position: 'MF' },
                    { id: 'ap8', name: 'Bernardo', number: 20, position: 'MF' },
                    { id: 'ap9', name: 'Foden', number: 47, position: 'MF' },
                    { id: 'ap10', name: 'Grealish', number: 10, position: 'MF' },
                    { id: 'ap11', name: 'Haaland', number: 9, position: 'FW' },
                ],
            },
        }),
        [routeFixtureId]
    );

    const { data: fixture, isLoading: loadingFixture, isError: fixtureIsError } = useGetOneFixture(
        fixtureNumericId,
        { query: { enabled: fetchFromApi } as any }
    );

    const homeTeamId = fixture?.homeTeamId;
    const awayTeamId = fixture?.awayTeamId;
    const stadiumId = fixture?.stadiumId;
    const competitionId = fixture?.competitionId;

    const { data: homeTeam, isLoading: loadingHome } = useGetOneTeam(homeTeamId ?? 0, {
        query: { enabled: fetchFromApi && typeof homeTeamId === 'number' } as any,
    });
    const { data: awayTeam, isLoading: loadingAway } = useGetOneTeam(awayTeamId ?? 0, {
        query: { enabled: fetchFromApi && typeof awayTeamId === 'number' } as any,
    });
    const { data: stadium, isLoading: loadingStadium } = useGetOneStadium(stadiumId ?? 0, {
        query: { enabled: fetchFromApi && typeof stadiumId === 'number' } as any,
    });
    const { data: competition, isLoading: loadingCompetition } = useGetOneCompetition(competitionId ?? 0, {
        query: { enabled: fetchFromApi && typeof competitionId === 'number' } as any,
    });

    const { data: bundleLineUps = [], isLoading: loadingLineUps } = useQuery({
        queryKey: ['/lineUp/query', fixtureNumericId],
        queryFn: () =>
            clientInstance<ApiLineUpBundle[]>({
                url: '/lineUp/query',
                method: 'GET',
                params: {
                    where: { fixtureId: fixtureNumericId },
                    relations: ['playerLineups', 'playerLineups.player', 'manager'],
                    take: 10,
                },
            }),
        enabled: fetchFromApi && Number.isFinite(fixtureNumericId),
    });

    const positionIds = useMemo(() => collectPositionIds(bundleLineUps), [bundleLineUps]);

    const { data: positionRows = [], isLoading: loadingPositions } = useQuery({
        queryKey: ['/position/query', 'fixture-lineup', positionIds],
        queryFn: () =>
            clientInstance<{ id: number; type: string }[]>({
                url: '/position/query',
                method: 'GET',
                params: {
                    where: { id: { $in: positionIds } },
                    take: 200,
                },
            }),
        enabled: fetchFromApi && positionIds.length > 0,
    });

    const positionsById = useMemo(() => {
        const m = new Map<number, { type: string }>();
        normalizePositionQueryResult(positionRows).forEach((p) => m.set(p.id, { type: p.type }));
        return m;
    }, [positionRows]);

    const apiMatchDetails = useMemo((): MatchDetails | null => {
        if (!fixture || !homeTeam || !awayTeam || !stadium || !competition) return null;
        const meta = (fixture as { metadata?: Record<string, unknown> }).metadata;
        const hs =
            fixture.homeScore ??
            (typeof meta?.homeScore === 'number' ? meta.homeScore : undefined);
        const as =
            fixture.awayScore ??
            (typeof meta?.awayScore === 'number' ? meta.awayScore : undefined);
        const homeRecentForm = meta ? parseRecentForm(meta.homeRecentForm) : null;
        const awayRecentForm = meta ? parseRecentForm(meta.awayRecentForm) : null;
        const sides = attachLineupsToFixtureSides(
            bundleLineUps,
            fixture.homeTeamId ?? undefined,
            fixture.awayTeamId ?? undefined,
            positionsById,
        );
        return {
            matchId: String(fixture.id),
            homeTeam: homeTeam.name,
            awayTeam: awayTeam.name,
            homeTeamId: fixture.homeTeamId,
            awayTeamId: fixture.awayTeamId,
            date: fixture.date,
            venue: stadium.name,
            competition: competition.name,
            competitionId: fixture.competitionId ?? competition.id,
            homeTeamLogo: homeTeam.logoUrl,
            awayTeamLogo: awayTeam.logoUrl,
            homeLineup: sides.home,
            awayLineup: sides.away,
            ...(typeof hs === 'number' &&
            typeof as === 'number' &&
            Number.isFinite(hs) &&
            Number.isFinite(as)
                ? { homeScore: hs, awayScore: as }
                : {}),
            ...(homeRecentForm && awayRecentForm
                ? { homeRecentForm, awayRecentForm }
                : {}),
        };
    }, [fixture, homeTeam, awayTeam, stadium, competition, bundleLineUps, positionsById]);

    const matchDetails: MatchDetails | null = useHardcodedPreview ? hardcodedMatchDetails : apiMatchDetails;

    const loadingLineupsBundle =
        fetchFromApi &&
        (loadingLineUps || (positionIds.length > 0 && loadingPositions));

    const loadingReal =
        fetchFromApi &&
        (loadingFixture ||
            loadingHome ||
            loadingAway ||
            loadingStadium ||
            loadingCompetition ||
            loadingLineupsBundle);

    if (!routeFixtureId) {
        return (
            <Container size="xl" py="xl">
                <Center>
                    <Text c="dimmed">{t('match.missingMatchId')}</Text>
                </Center>
            </Container>
        );
    }

    if (!useHardcodedPreview && !Number.isFinite(fixtureNumericId)) {
        return (
            <Container size="xl" py="xl">
                <Center>
                    <Text c="dimmed">{t('match.invalidMatchId')}</Text>
                </Center>
            </Container>
        );
    }

    if (fetchFromApi && fixtureIsError) {
        return (
            <Container size="xl" py="xl">
                <Center>
                    <Text c="dimmed">{t('match.couldNotLoadFixture', { id: routeFixtureId })}</Text>
                </Center>
            </Container>
        );
    }

    if (fetchFromApi && !loadingReal && !apiMatchDetails) {
        return (
            <Container size="xl" py="xl">
                <Center>
                    <Text c="dimmed">{t('match.fixtureIncomplete')}</Text>
                </Center>
            </Container>
        );
    }

    if (!matchDetails) {
        return (
            <Container size="xl" py="xl" pos="relative" style={{ minHeight: 240 }}>
                <LoadingOverlay visible />
            </Container>
        );
    }

    const status = getMatchStatus(matchDetails.date);

    return (
        <>
            {/* Match Header Section */}
            <MatchHeader 
                matchDetails={matchDetails} 
                showViewTicketsButton={true}
                variant="full-width"
            />

            {/* Form & Prediction Section */}
            <Box
                py={{ base: '3rem', md: '6rem' }}
                px={{ base: 'md', md: 0 }}
                style={{
                    backgroundColor: 'var(--modern-bg-secondary)',
                    color: 'var(--modern-text-primary)',
                    borderTop: '1px solid var(--modern-section-divider)',
                    borderBottom: '1px solid var(--modern-section-divider)',
                    position: 'relative',
                    overflowX: 'hidden',
                }}
            >
                {/* Subtle Background Pattern */}
                <Box
                    className="section-background-pattern"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
                    <Stack gap="xl">
                        {fetchFromApi && Number.isFinite(fixtureNumericId) && (
                            <MatchInsightPanel fixtureId={fixtureNumericId} />
                        )}
                        {matchDetails.homeRecentForm && matchDetails.awayRecentForm ? (
                            <TeamFormSection
                                homeForm={matchDetails.homeRecentForm}
                                awayForm={matchDetails.awayRecentForm}
                            />
                        ) : null}

                        {/* Score Prediction Section */}
                        <ScorePredictionCard
                            homeTeam={matchDetails.homeTeam}
                            awayTeam={matchDetails.awayTeam}
                            date={matchDetails.date}
                            fixtureId={fetchFromApi ? fixtureNumericId : undefined}
                        />
                    </Stack>
                </Container>
            </Box>

            {/* Match events (API fixtures only) */}
            {fetchFromApi && fixture && (
                <Box
                    py={{ base: '3rem', md: '6rem' }}
                    px={{ base: 'md', md: 0 }}
                    style={{
                        backgroundColor: 'var(--modern-bg-secondary)',
                        color: 'var(--modern-text-primary)',
                        borderTop: '1px solid var(--modern-section-divider)',
                        position: 'relative',
                        overflowX: 'hidden',
                    }}
                >
                    <Box
                        className="section-background-pattern"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.03,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                    <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
                        <MatchEventsSection
                            fixtureId={fixtureNumericId}
                            homeTeamId={matchDetails.homeTeamId}
                            awayTeamId={matchDetails.awayTeamId}
                            homeTeamName={matchDetails.homeTeam}
                            awayTeamName={matchDetails.awayTeam}
                        />
                    </Container>
                </Box>
            )}

            {/* Team Lineups Section */}
            <Box
                py={{ base: '3rem', md: '6rem' }}
                px={{ base: 'md', md: 0 }}
                style={{
                    backgroundColor: 'var(--modern-bg-secondary)',
                    color: 'var(--modern-text-primary)',
                    borderTop: '1px solid var(--modern-section-divider)',
                    position: 'relative',
                    overflowX: 'hidden',
                }}
            >
                {/* Subtle Background Pattern */}
                <Box
                    className="section-background-pattern"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
                    <TeamLineups matchDetails={matchDetails} status={status}/>
                </Container>
            </Box>
        </>
    );
}
