import React, {FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import { createPortal } from 'react-dom';
import {
    ActionIcon,
    Badge,
    Box,
    Grid,
    Group,
    LoadingOverlay,
    ScrollArea,
    Select,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    Tabs,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconLock, IconArrowLeft, IconTicket, IconShoppingBag } from '@tabler/icons-react';
import {
    UiBadge,
    UiBody,
    UiButton,
    UiCaption,
    UiCard,
    UiH2,
    UiH3,
    UiPageContainer,
    uiSelectStyles,
    uiSegmentedControlStyles,
} from '../components/ui';
import { getMyTicketLog, type TicketLogEntry } from '../shared/api/userTicketLog.api';
import { useAuthStore } from '../shared/stores/auth.store';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import { usePageTransition } from '../hooks/usePageTransition';
import { useTranslation } from '../i18n/useTranslation';
import { useGetQueryCompetition } from '@iWatchFootball/clients/controllers/competition';
import { useGetQueryTeamCompetitionSeason } from '@iWatchFootball/clients/controllers/team-competition-season';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetAllSeason } from '@iWatchFootball/clients/controllers/season';
import { useCreateLog } from '@iWatchFootball/clients/controllers/log';
import { useQueryClient, useQuery, useQueries } from '@tanstack/react-query';
import {
    createPremiumCheckout,
    extractApiErrorMessage,
    getMyLogHistory,
    openSubscriptionPortal,
    type TrackerEntitlements,
} from '../shared/api/tracker.api';
import { clientInstance } from '@iWatchFootball/clients/client-instance';
import { resolveFixtureScores, type FixtureScoresInput } from '../shared/fixtureScores';
import {
    buildLogFixtureTimelineEvents,
    type FixtureEventsForLogPayload,
} from '../shared/loggedFixtureTimeline.events';

import {LoggedFixtureCard} from '../components/cards/fixture.card';
import NewStatsTab from "../tabs/newStats.tab";
import type { LogFixtureTimelineEvent } from '../shared/loggedFixtureTimeline.events';

export type MatchEvent = LogFixtureTimelineEvent;

export interface UserGame {
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamId?: number;
    awayTeamId?: number;
    homeScore: number;
    awayScore: number;
    /** False when API has no final score — avoid showing 0–0 as real */
    scoresAvailable: boolean;
    date: string;
    competitionName: string;
    competitionId?: number;
    leaguePosition?: number;
    isVerified: boolean;
    venue?: string;
    stadiumId?: number;
    userTeam?: 'home' | 'away';
    stage: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    /** Optional per-log events (leaderboards); timeline lives on the API for the match page. */
    events?: MatchEvent[];
}

function LogEmptyState({ title, message }: { title: string; message: string }) {
    return (
        <UiCard density="spacious" style={{ textAlign: 'center' }}>
            <UiH3 style={{ marginBottom: '0.5rem' }}>{title}</UiH3>
            <UiBody>{message}</UiBody>
        </UiCard>
    );
}

export function LogsPage() {
    const { t } = useTranslation();
    const { isLoggedIn, user } = useAuthStore();
    const { marketplaceEnabled } = usePlatformFeaturesStore();
    const { navigateWithTransition } = usePageTransition();
    const queryClient = useQueryClient();

    const [myTickets, setMyTickets] = useState<TicketLogEntry[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) return;
        setTicketsLoading(true);
        getMyTicketLog()
            .then(setMyTickets)
            .catch(() => setMyTickets([]))
            .finally(() => setTicketsLoading(false));
    }, [isLoggedIn]);

    const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
    const [selectedHomeTeam, setSelectedHomeTeam] = useState<string | null>(null);
    const [selectedAwayTeam, setSelectedAwayTeam] = useState<string | null>(null);
    const [selectedFixture, setSelectedFixture] = useState<string | null>(null);

    const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified'>('all');

    const { mutateAsync: createLog, isPending: isCreatingLog } = useCreateLog();

    // Fetch competitions from the API
    const { data: competitionsData = [], isLoading: isLoadingCompetitions } = useGetQueryCompetition(
        { take: 200 } as any
    );

    // Fetch TCS entries to derive seasons for the selected competition
    const { data: tcsForSeasons = [], isLoading: isLoadingSeasons } = useGetQueryTeamCompetitionSeason(
        { where: { competitionId: selectedCompetition ? Number(selectedCompetition) : undefined } } as any,
        { query: { enabled: !!selectedCompetition } as any }
    );

    // Derive unique season IDs from the TCS result
    const uniqueSeasonIds = useMemo(() => {
        const seen = new Set<number>();
        return tcsForSeasons.filter(tcs => {
            if (seen.has(tcs.seasonId)) return false;
            seen.add(tcs.seasonId);
            return true;
        }).map(tcs => tcs.seasonId);
    }, [tcsForSeasons]);

    // Fetch TCS entries to derive teams for the selected competition + season
    const { data: tcsForTeams = [], isLoading: isLoadingTeamsTcs } = useGetQueryTeamCompetitionSeason(
        { where: { competitionId: selectedCompetition ? Number(selectedCompetition) : undefined, seasonId: selectedSeason ? Number(selectedSeason) : undefined } } as any,
        { query: { enabled: !!(selectedCompetition && selectedSeason) } as any }
    );

    const uniqueTeamIds = useMemo(() => {
        const seen = new Set<number>();
        return tcsForTeams.filter(tcs => {
            if (seen.has(tcs.teamId)) return false;
            seen.add(tcs.teamId);
            return true;
        }).map(tcs => tcs.teamId);
    }, [tcsForTeams]);

    // All teams loaded globally so we can resolve names for any fixture (form + logged games)
    const { data: teamsData = [], isLoading: isLoadingTeams } = useGetQueryTeam(
        { take: 500 } as any
    );

    // Filter teams to those registered in the selected competition/season (for the Add New Match form)
    const teams = useMemo(() => {
        if (!uniqueTeamIds.length) return [];
        return teamsData.filter(t => uniqueTeamIds.includes(t.id));
    }, [teamsData, uniqueTeamIds]);

    // Load all seasons so we can display proper year labels in the season dropdown
    const { data: allSeasonsData = [] } = useGetAllSeason();

    // Fetch real fixtures from the API when all four filters are set (Add New Match form)
    const canFetchFixtures = !!(selectedCompetition && selectedSeason && selectedHomeTeam && selectedAwayTeam);
    const { data: fixturesData = [], isLoading: isLoadingFixtures } = useGetQueryFixture(
        {
            where: {
                competitionId: selectedCompetition ? Number(selectedCompetition) : undefined,
                seasonId: selectedSeason ? Number(selectedSeason) : undefined,
                homeTeamId: selectedHomeTeam ? Number(selectedHomeTeam) : undefined,
                awayTeamId: selectedAwayTeam ? Number(selectedAwayTeam) : undefined,
            },
            take: 100,
        } as any,
        { query: { enabled: canFetchFixtures } as any }
    );

    const [upgradeLoading, setUpgradeLoading] = useState(false);

    const { data: logHistory, isLoading: isLoadingLogs } = useQuery({
        queryKey: ['log', 'my-history'],
        queryFn: getMyLogHistory,
        enabled: isLoggedIn && !!user?.id,
    });
    const userLogsData = logHistory?.logs ?? [];
    const trackerEntitlements: TrackerEntitlements | undefined = logHistory?.entitlements;

    const handleUpgradePremium = async () => {
        setUpgradeLoading(true);
        try {
            const origin = window.location.origin;
            const { url } = await createPremiumCheckout(
                `${origin}/logs?subscribed=1`,
                `${origin}/logs`,
            );
            window.location.href = url;
        } catch (e) {
            showNotification({
                title: t('logs.upgradeUnavailable'),
                message: extractApiErrorMessage(e),
                color: 'red',
            });
        } finally {
            setUpgradeLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setUpgradeLoading(true);
        try {
            const { url } = await openSubscriptionPortal(`${window.location.origin}/logs`);
            window.location.href = url;
        } catch {
            showNotification({
                title: t('logs.billingUnavailable'),
                message: t('logs.billingUnavailableMessage'),
                color: 'orange',
            });
        } finally {
            setUpgradeLoading(false);
        }
    };

    // Fetch fixtures for the user's logged games so we can display team names / dates
    const loggedFixtureIds = useMemo(
        () => Array.from(new Set(userLogsData.map(l => l.fixtureId))),
        [userLogsData]
    );
    const { data: loggedFixturesRaw = [], isLoading: isLoadingLoggedFixtures } = useGetQueryFixture(
        { where: { id: { $in: loggedFixtureIds } }, take: 200 } as any,
        { query: { enabled: loggedFixtureIds.length > 0 } as any }
    );

    const loggedStadiumIds = useMemo(
        () =>
            Array.from(
                new Set(
                    loggedFixturesRaw
                        .map((f) => f.stadiumId)
                        .filter((id): id is number => typeof id === 'number'),
                ),
            ),
        [loggedFixturesRaw],
    );

    const { data: loggedStadiumRows = [] } = useQuery({
        queryKey: ['/stadium/query', 'logs', loggedStadiumIds],
        queryFn: () =>
            clientInstance<{ id: number; name: string }[]>({
                url: '/stadium/query',
                method: 'GET',
                params: { where: { id: { $in: loggedStadiumIds } }, take: 200 },
            }),
        enabled: loggedStadiumIds.length > 0,
    });

    /** Match timelines for stats leaderboards — same `/fixture/:id/events` data as MatchEventsSection. */
    const fixtureEventsQueries = useQueries({
        queries: loggedFixtureIds.map((fixtureId) => ({
            queryKey: ['/fixture', fixtureId, 'events'],
            queryFn: async ({ signal }: { signal?: AbortSignal }) =>
                clientInstance<FixtureEventsForLogPayload>({
                    url: `/fixture/${fixtureId}/events`,
                    method: 'GET',
                    signal,
                }),
            enabled: isLoggedIn && loggedFixtureIds.length > 0,
            staleTime: 5 * 60 * 1000,
        })),
    });
    // Map DB logs → UserGame using the enriched fixture + team + competition data
    const loggedFixtures = useMemo((): UserGame[] => {
        const ix = new Map<number, number>();
        loggedFixtureIds.forEach((id, i) => {
            ix.set(id, i);
        });

        return userLogsData.map(log => {
            const fixture = loggedFixturesRaw.find(f => f.id === log.fixtureId);
            const homeTeamDoc = teamsData.find(t => t.id === fixture?.homeTeamId);
            const awayTeamDoc = teamsData.find(t => t.id === fixture?.awayTeamId);
            const competition = competitionsData.find(c => c.id === fixture?.competitionId);
            const resolved = fixture ? resolveFixtureScores(fixture as FixtureScoresInput) : null;
            const venue =
                typeof fixture?.stadiumId === 'number'
                    ? loggedStadiumRows.find((s) => s.id === fixture.stadiumId)?.name
                    : undefined;
            const payloadIdx = ix.get(log.fixtureId);
            const eventsPayload =
                typeof payloadIdx === 'number' ? fixtureEventsQueries[payloadIdx]?.data : undefined;
            const events =
                eventsPayload != null && fixture != null
                    ? buildLogFixtureTimelineEvents(eventsPayload, fixture.homeTeamId, fixture.awayTeamId)
                    : undefined;
            return {
                fixtureId: String(log.fixtureId),
                homeTeam: homeTeamDoc?.name ?? t('logs.teamFallback', { id: fixture?.homeTeamId ?? '?' }),
                awayTeam: awayTeamDoc?.name ?? t('logs.teamFallback', { id: fixture?.awayTeamId ?? '?' }),
                homeTeamLogo: homeTeamDoc?.logoUrl,
                awayTeamLogo: awayTeamDoc?.logoUrl,
                homeTeamId: fixture?.homeTeamId,
                awayTeamId: fixture?.awayTeamId,
                homeScore: resolved?.home ?? 0,
                awayScore: resolved?.away ?? 0,
                scoresAvailable: resolved != null,
                date: fixture?.date ?? '',
                competitionName: competition?.name ?? t('logs.unknownCompetition'),
                competitionId: fixture?.competitionId,
                isVerified: log.isVerified,
                stage: fixture?.stage ?? '',
                venue,
                stadiumId: typeof fixture?.stadiumId === 'number' ? fixture.stadiumId : undefined,
                events,
            };
        });
    }, [
        userLogsData,
        loggedFixturesRaw,
        teamsData,
        competitionsData,
        loggedStadiumRows,
        loggedFixtureIds,
        fixtureEventsQueries,
        t,
    ]);

    const formLoading =
        isLoadingCompetitions ||
        isLoadingSeasons ||
        isLoadingTeamsTcs ||
        isLoadingTeams ||
        isLoadingFixtures ||
        isCreatingLog;
    const logsLoading = isLoadingLogs || isLoadingLoggedFixtures;

    const handleAddToLog = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedFixture || !user?.id) {
            return;
        }

        const addedFixture = fixturesData.find((f) => String(f.id) === selectedFixture);
        if (!addedFixture) return;

        const homeTeam = teamsData.find(t => t.id === addedFixture.homeTeamId);
        const awayTeam = teamsData.find(t => t.id === addedFixture.awayTeamId);

        try {
            await createLog({
                data: {
                    userId: user.id,
                    fixtureId: addedFixture.id,
                    isVerified: false,
                },
            });

            // Invalidate the log query so the right-hand list refreshes
            queryClient.invalidateQueries({ queryKey: ['log', 'my-history'] });

            showNotification({
                title: t('logs.matchAddedTitle'),
                message: t('logs.matchAddedMessage', {
                    home: homeTeam?.name ?? t('common.home'),
                    away: awayTeam?.name ?? t('common.away'),
                }),
                color: 'green',
                autoClose: 3000,
            });

            setSelectedCompetition(null);
            setSelectedSeason(null);
            setSelectedHomeTeam(null);
            setSelectedAwayTeam(null);
            setSelectedFixture(null);

        } catch {
            showNotification({
                title: t('logs.matchAddFailedTitle'),
                message: t('logs.matchAddFailedMessage'),
                color: 'red',
                autoClose: 4000,
            });
        }
    };

    const [showTopButton, setShowTopButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {  // Show button when scrolled more than 300px
                setShowTopButton(true);
            } else {
                setShowTopButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const [columnSpan, setColumnSpan] = useState(6);
    useEffect(() => {
        // Function to handle resizing
        const handleResize = () => {
            if (window.innerWidth < 786) {
                setColumnSpan(12);
            } else {
                setColumnSpan(6);
            }
        };

        // Set the initial span based on the current window size
        handleResize();

        // Add event listener on mount
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const headerRef = useRef<HTMLDivElement>(null);
    const tabsRef = useRef<HTMLDivElement>(null);
    const [scrollAreaHeight, setScrollAreaHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            const headerHeight = headerRef.current?.offsetHeight || 0;
            const tabsHeight = tabsRef.current?.offsetHeight || 0;
            const padding = 80; // Increased padding to account for form and margins
            setScrollAreaHeight(window.innerHeight - headerHeight - tabsHeight - padding);
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Filter logged fixtures based on verification status
    const filteredLoggedFixtures = useMemo(() => {
        if (verificationFilter === 'all') {
            return loggedFixtures;
        } else {
            return loggedFixtures.filter(fixture => fixture.isVerified);
        }
    }, [loggedFixtures, verificationFilter]);

    const emptyLogTitle = useMemo(() => {
        if (loggedFixtures.length === 0) return t('logs.emptyNoLogs');
        if (verificationFilter === 'verified') return t('logs.emptyNoVerified');
        return t('logs.emptyNoMatches');
    }, [loggedFixtures.length, verificationFilter, t]);

    const emptyLogMessage = useMemo(() => {
        if (loggedFixtures.length === 0) return t('logs.emptyStartAdding');
        return t('logs.emptyTryFilter');
    }, [loggedFixtures.length, t]);

    // Lock Overlay component - rendered via portal to document body
    const lockOverlay = !isLoggedIn ? (
        createPortal(
            <Box
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'var(--ui-backdrop-color, rgba(0, 0, 0, 0.7))',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActionIcon
                    onClick={() => window.history.back()}
                    variant="filled"
                    size="xl"
                    radius="xl"
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        backgroundColor: 'var(--ui-accent)',
                        color: 'var(--ui-accent-text)',
                        zIndex: 10001,
                    }}
                >
                    <IconArrowLeft size={24} />
                </ActionIcon>

                <UiCard density="spacious" accent style={{ maxWidth: 500, width: '90%', textAlign: 'center' }}>
                    <Stack gap="lg" align="center">
                        <IconLock size={64} color="var(--ui-accent)" />
                        <UiH2>{t('logs.authRequired')}</UiH2>
                        <UiBody>{t('logs.authRequiredMessage')}</UiBody>
                        <Group gap="md" mt="md">
                            <UiButton onClick={() => navigateWithTransition('/signIn')}>{t('nav.signIn')}</UiButton>
                            <UiButton variant="outline" onClick={() => navigateWithTransition('/join')}>
                                {t('logs.signUp')}
                            </UiButton>
                        </Group>
                    </Stack>
                </UiCard>
            </Box>,
            document.body,
        )
    ) : null;

    return (
        <Box style={{ minHeight: '100vh', backgroundColor: 'var(--ui-bg-base)' }}>
            {lockOverlay}

            <UiPageContainer>
                <Grid gutter="xl">
                    <Grid.Col span={columnSpan}>
                        <Stack gap="xs" mb="lg">
                            <UiH2>{t('logs.title')}</UiH2>
                            <UiBody>{t('logs.subtitle')}</UiBody>
                        </Stack>

                        <Box pos="relative" mb="xl">
                            <LoadingOverlay visible={formLoading} zIndex={10} overlayProps={{ blur: 1 }} />
                            <UiCard hover={false} density="spacious">
                                <Stack gap="lg">
                                    <Stack gap="xs" align="center">
                                        <UiH3>{t('logs.addNewMatch')}</UiH3>
                                        <UiBody style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                                            {t('logs.addNewMatchHint')}
                                        </UiBody>
                                    </Stack>

                                    <Box>
                                        <UiCaption style={{ display: 'block', marginBottom: '0.75rem' }}>
                                            {t('logs.competition')}
                                        </UiCaption>
                                        <Select
                                            placeholder={t('logs.selectCompetition')}
                                            data={competitionsData.map((c) => ({
                                                value: String(c.id),
                                                label: c.name,
                                            }))}
                                            value={selectedCompetition}
                                            onChange={(val) => {
                                                setSelectedCompetition(val);
                                                setSelectedSeason(null);
                                                setSelectedHomeTeam(null);
                                                setSelectedAwayTeam(null);
                                                setSelectedFixture(null);
                                            }}
                                            searchable
                                            clearable
                                            size="md"
                                            styles={uiSelectStyles}
                                        />
                                    </Box>

                                {selectedCompetition && (
                                    <Box>
                                        <UiCaption style={{ display: 'block', marginBottom: '0.75rem' }}>{t('logs.season')}</UiCaption>
                                        <Select
                                            placeholder={isLoadingSeasons ? t('logs.loadingSeasons') : t('logs.selectSeason')}
                                            data={uniqueSeasonIds.map((seasonId) => {
                                                const season = allSeasonsData.find(s => s.id === seasonId);
                                                const label = season
                                                    ? `${season.yearStart}/${season.yearEnd}`
                                                    : String(seasonId);
                                                return { value: String(seasonId), label };
                                            })}
                                            value={selectedSeason}
                                            onChange={(val) => {
                                                setSelectedSeason(val);
                                                setSelectedHomeTeam(null);
                                                setSelectedAwayTeam(null);
                                                setSelectedFixture(null);
                                            }}
                                            searchable
                                            clearable
                                            size="md" styles={uiSelectStyles}
                                        />
                                    </Box>
                                )}

                                {selectedSeason && (
                                    <>
                                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                            <Box>
                                                <UiCaption style={{ display: 'block', marginBottom: '0.75rem' }}>{t('logs.homeTeam')}</UiCaption>
                                                <Select
                                                    placeholder={isLoadingTeams ? t('logs.loadingTeams') : t('logs.selectHomeTeam')}
                                                    data={teams
                                                        .filter(team => String(team.id) !== selectedAwayTeam)
                                                        .map((team) => ({
                                                            value: String(team.id),
                                                            label: team.name
                                                        }))}
                                                    value={selectedHomeTeam}
                                                    onChange={(value) => {
                                                        setSelectedHomeTeam(value);
                                                        setSelectedFixture(null);
                                                    }}
                                                    searchable
                                                    clearable
                                                    size="md" styles={uiSelectStyles}
                                                />
                                            </Box>
                                            <Box>
                                                <UiCaption style={{ display: 'block', marginBottom: '0.75rem' }}>{t('logs.awayTeam')}</UiCaption>
                                                <Select
                                                    placeholder={isLoadingTeams ? t('logs.loadingTeams') : t('logs.selectAwayTeam')}
                                                    data={teams
                                                        .filter(team => String(team.id) !== selectedHomeTeam)
                                                        .map((team) => ({
                                                            value: String(team.id),
                                                            label: team.name
                                                        }))}
                                                    value={selectedAwayTeam}
                                                    onChange={(value) => {
                                                        setSelectedAwayTeam(value);
                                                        setSelectedFixture(null);
                                                    }}
                                                    searchable
                                                    clearable
                                                    size="md" styles={uiSelectStyles}
                                                />
                                            </Box>
                                        </SimpleGrid>

                                        {selectedHomeTeam && selectedAwayTeam && fixturesData.length > 0 && (
                                            <Box>
                                                <UiCaption style={{ display: 'block', marginBottom: '0.75rem' }}>{t('logs.selectFixture')}</UiCaption>
                                                <Select
                                                    placeholder={isLoadingFixtures ? t('logs.loadingFixtures') : t('logs.chooseFixture')}
                                                    data={fixturesData.map((f) => {
                                                        const home = teamsData.find(t => t.id === f.homeTeamId)?.name || String(f.homeTeamId);
                                                        const away = teamsData.find(t => t.id === f.awayTeamId)?.name || String(f.awayTeamId);
                                                        return {
                                                            value: String(f.id),
                                                            label: `${home} vs ${away} (${new Date(f.date).toLocaleDateString()})`,
                                                        };
                                                    })}
                                                    value={selectedFixture}
                                                    onChange={setSelectedFixture}
                                                    searchable
                                                    clearable
                                                    size="md" styles={uiSelectStyles}
                                                />
                                                <UiCaption style={{ color: 'var(--modern-text-secondary)', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                                    {fixturesData.length === 1
                                                        ? t('logs.matchesFoundSingular', { count: fixturesData.length })
                                                        : t('logs.matchesFoundPlural', { count: fixturesData.length })}
                                                </UiCaption>
                                            </Box>
                                        )}

                                        {selectedHomeTeam && selectedAwayTeam && !isLoadingFixtures && fixturesData.length === 0 && (
                                            <Box style={{ textAlign: 'center', padding: '1rem' }}>
                                                <UiBody style={{ color: 'var(--modern-text-secondary)' }}>
                                                    {t('logs.noMatchesBetweenTeams')}
                                                </UiBody>
                                            </Box>
                                        )}

                                        {selectedHomeTeam && selectedAwayTeam && (
                                            <Box mt="md">
                                                <UiButton
                                                    onClick={handleAddToLog}
                                                    disabled={!selectedFixture}
                                                    fullWidth
                                                    size="md"
                                                    variant="primary"
                                                >
                                                    {t('logs.addMatchToLogs')}
                                                </UiButton>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Stack>
                            </UiCard>
                        </Box>

                </Grid.Col>
                <Grid.Col span={columnSpan}>
                        <Tabs
                            defaultValue={'matches'}
                            styles={{
                                list: {
                                    flexWrap: 'nowrap',
                                    width: '100%',
                                    justifyContent: 'stretch',
                                    gap: 0,
                                    overflowX: 'auto',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                },
                                tab: {
                                    flex: '1 1 0',
                                    minWidth: 0,
                                    maxWidth: '100%',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: 'clamp(0.8125rem, 2.8vw, 1.1rem)',
                                    padding:
                                        'clamp(0.5rem, 1.75vw, 0.875rem) clamp(0.25rem, 1.75vw, 1rem)',
                                    whiteSpace: 'nowrap',
                                },
                            }}
                        >
                        <Tabs.List>
                            <Tabs.Tab value={'matches'}>{t('logs.tabMatches')}</Tabs.Tab>
                            <Tabs.Tab value={'stats'}>{t('logs.tabStats')}</Tabs.Tab>
                            <Tabs.Tab value={'tickets'}>
                                <Group gap={6} wrap="nowrap" justify="center">
                                    <IconTicket size={16} style={{ flexShrink: 0 }} />
                                    {t('logs.tabTickets')}
                                    {myTickets.length > 0 && (
                                        <Badge
                                            size="xs"
                                            style={{
                                                backgroundColor: 'var(--ui-accent)',
                                                color: 'var(--ui-accent-text)',
                                            }}
                                        >
                                            {myTickets.length}
                                        </Badge>
                                    )}
                                </Group>
                            </Tabs.Tab>
                        </Tabs.List>
                        <Box mb="md" mt="md" style={{ display: 'flex', justifyContent: 'center' }}>
                            <SegmentedControl
                                value={verificationFilter}
                                onChange={(value) => setVerificationFilter(value as 'all' | 'verified')}
                                data={[
                                    { label: t('logs.filterAllGames'), value: 'all' },
                                    { label: t('logs.filterVerified'), value: 'verified' },
                                ]}
                                size="sm"
                                styles={uiSegmentedControlStyles}
                            />
                        </Box>
                        {trackerEntitlements?.upgradeRequired && (
                            <UiCard density="compact" accent style={{ marginBottom: '1rem' }}>
                                <Stack gap="sm">
                                    <UiBody>
                                        {t('logs.upgradePrompt', {
                                            total: trackerEntitlements.verifiedTotal,
                                            limit: trackerEntitlements.freeVerifiedLimit,
                                        })}
                                    </UiBody>
                                    <UiButton loading={upgradeLoading} onClick={handleUpgradePremium}>{t('logs.upgradePremium')}</UiButton>
                                </Stack>
                            </UiCard>
                        )}
                        {trackerEntitlements?.isPremium && (
                            <Box mb="md">
                                <UiButton variant="ghost" size="xs" loading={upgradeLoading} onClick={handleManageSubscription}>{t('logs.manageSubscription')}</UiButton>
                            </Box>
                        )}
                        <Tabs.Panel value={'matches'}>
                            <Box pos="relative">
                                <LoadingOverlay visible={logsLoading} zIndex={10} overlayProps={{ blur: 1 }} />
                            <ScrollArea
                                style={{ height: `${scrollAreaHeight}px`, minHeight: '400px' }}
                                type="never"
                                scrollbarSize={2}
                                scrollHideDelay={0}
                            >
                                {filteredLoggedFixtures.length === 0 && !logsLoading ? (
                                    <LogEmptyState title={emptyLogTitle} message={emptyLogMessage} />
                                ) : (
                                    <SimpleGrid
                                        cols={1}
                                        style={{ gap: 'var(--mantine-spacing-lg)', maxHeight: '80vh', overflowY: 'auto', padding: '0 8px' }}
                                    >
                                        {filteredLoggedFixtures.map((fixture) => (
                                            <LoggedFixtureCard
                                                key={fixture.fixtureId}
                                                fixtureId={fixture.fixtureId}
                                                homeTeam={fixture.homeTeam}
                                                awayTeam={fixture.awayTeam}
                                                homeTeamId={fixture.homeTeamId}
                                                awayTeamId={fixture.awayTeamId}
                                                homeScore={fixture.homeScore}
                                                awayScore={fixture.awayScore}
                                                scoresAvailable={fixture.scoresAvailable}
                                                date={fixture.date}
                                                competitionName={fixture.competitionName}
                                                competitionId={fixture.competitionId}
                                                leaguePosition={fixture.leaguePosition}
                                                isVerified={fixture.isVerified}
                                                venue={fixture.venue}
                                                userTeam={fixture.userTeam}
                                                stage={fixture.stage}
                                                homeTeamLogo={fixture.homeTeamLogo}
                                                awayTeamLogo={fixture.awayTeamLogo}
                                            />
                                        ))}
                                    </SimpleGrid>
                                )}
                            </ScrollArea>
                            </Box>
                        </Tabs.Panel>
                        <Tabs.Panel value={'stats'}>
                            <ScrollArea
                                style={{ height: `${scrollAreaHeight}px` }}
                                type="never"
                                scrollbarSize={2}
                                scrollHideDelay={0}
                            >
                                {filteredLoggedFixtures.length === 0 && !logsLoading ? (
                                    <LogEmptyState title={emptyLogTitle} message={emptyLogMessage} />
                                ) : (
                                    // <StatsTab loggedFixtures={filteredLoggedFixtures}/>
                                    <NewStatsTab loggedFixtures={filteredLoggedFixtures} />
                                )}
                            </ScrollArea>
                        </Tabs.Panel>

                        <Tabs.Panel value={'tickets'}>
                            <ScrollArea
                                style={{ height: `${scrollAreaHeight}px`, minHeight: '400px' }}
                                type="never"
                                scrollbarSize={2}
                                scrollHideDelay={0}
                            >
                                {ticketsLoading ? (
                                    <LogEmptyState title={t('logs.loadingTickets')} message={t('logs.loadingTicketsMessage')} />
                                ) : myTickets.length === 0 ? (
                                    <UiCard density="spacious" style={{ textAlign: 'center' }}>
                                        <IconTicket size={40} color="var(--ui-text-muted)" style={{ margin: '0 auto 1rem' }} />
                                        <UiH3 style={{ marginBottom: '0.5rem' }}>{t('logs.noTickets')}</UiH3>
                                        <UiBody style={{ marginBottom: '1.5rem' }}>
                                            {t('logs.noTicketsMessage')}
                                        </UiBody>
                                        <UiButton onClick={() => navigateWithTransition('/tickets')}>
                                            {t('logs.browseTickets')}
                                        </UiButton>
                                    </UiCard>
                                ) : (
                                    <SimpleGrid cols={1} style={{ gap: 'var(--mantine-spacing-md)', padding: '0 8px' }}>
                                        {myTickets.map((entry) => (
                                            <UiCard key={entry.id} density="default">
                                                <Group justify="space-between" mb="xs">
                                                    <Group gap="sm">
                                                        <IconTicket size={18} color="var(--ui-accent)" />
                                                        <Text fw={600}>{entry.ticket?.category ?? t('logs.ticketLabel')}</Text>
                                                    </Group>
                                                    <UiBadge size="sm">{t('logs.inWallet')}</UiBadge>
                                                </Group>

                                                <Stack gap={4} mb="md">
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="dimmed">{t('logs.fixtureLabel')}</Text>
                                                        <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                                            {entry.ticket?.fixtureLabel ??
                                                                `#${entry.ticket?.fixtureId ?? entry.ticketId}`}
                                                        </Text>
                                                    </Group>
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="dimmed">{t('logs.ticketNumber')}</Text>
                                                        <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                                            #{entry.ticketId}
                                                        </Text>
                                                    </Group>
                                                    {entry.ticket?.price != null && (
                                                        <Group justify="space-between">
                                                            <Text size="sm" c="dimmed">{t('logs.faceValue')}</Text>
                                                            <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                                                {new Intl.NumberFormat('en-GB', {
                                                                    style: 'currency',
                                                                    currency: 'GBP',
                                                                }).format(entry.ticket.price)}
                                                            </Text>
                                                        </Group>
                                                    )}
                                                </Stack>

                                                {marketplaceEnabled && (
                                                    <Group gap="sm">
                                                        <UiButton
                                                            variant="primary"
                                                            style={{ flex: 1 }}
                                                            onClick={() =>
                                                                navigateWithTransition('/marketplace/sell', {
                                                                    state: { ticketId: entry.ticketId },
                                                                })
                                                            }
                                                        >
                                                            <Group gap={6}>
                                                                <IconShoppingBag size={14} />
                                                                {t('logs.sellOnMarketplace')}
                                                            </Group>
                                                        </UiButton>
                                                    </Group>
                                                )}
                                            </UiCard>
                                        ))}
                                    </SimpleGrid>
                                )}
                            </ScrollArea>
                        </Tabs.Panel>

                    </Tabs>
                    <UiButton
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{
                            display: showTopButton ? 'block' : 'none',
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            zIndex: 1000
                        }}
                        variant="primary"
                    >
                        {t('logs.goToTop')}
                    </UiButton>
                </Grid.Col>
            </Grid>

            </UiPageContainer>
        </Box>
    );
}
