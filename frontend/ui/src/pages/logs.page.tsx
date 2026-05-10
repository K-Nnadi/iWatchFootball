import React, {FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import { createPortal } from 'react-dom';
import {
    ActionIcon,
    Badge,
    Box,
    Container,
    Grid,
    Group,
    LoadingOverlay,
    Paper,
    ScrollArea,
    Select,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    Tabs
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconLock, IconArrowLeft, IconTicket, IconShoppingBag } from '@tabler/icons-react';
import { ModernButton, ModernCard, ModernH2, ModernH3, ModernBody, ModernCaption } from '../components/modern';
import { getMyTicketLog, type TicketLogEntry } from '../shared/api/userTicketLog.api';
import { useAuthStore } from '../shared/stores/auth.store';
import { usePageTransition } from '../hooks/usePageTransition';
import { useGetQueryCompetition } from '@iWatchFootball/clients/controllers/competition';
import { useGetQueryTeamCompetitionSeason } from '@iWatchFootball/clients/controllers/team-competition-season';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetAllSeason } from '@iWatchFootball/clients/controllers/season';
import { useCreateLog, useGetQueryLog } from '@iWatchFootball/clients/controllers/log';
import { useQueryClient } from '@tanstack/react-query';
import { getGetQueryLogQueryKey } from '@iWatchFootball/clients/controllers/log';

import {LoggedFixtureCard} from '../components/cards/fixture.card';
import NewStatsTab from "../tabs/newStats.tab";

export interface MatchEvent {
    time: number;
    description: string;
    team: 'home' | 'away';
    type: 'goal' | 'card' | 'substitution' | 'other' | 'penalty';
    playerId?: string; // Optional player ID
    assistPlayerId?: string; // Optional assist player ID
}

export interface UserGame {
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    date: string;
    competitionName: string;
    leaguePosition?: number;
    isVerified: boolean;
    venue?: string;
    userTeam?: 'home' | 'away';
    stage: string;
    events?: MatchEvent[];
}

export function LogsPage() {
    const { isLoggedIn, user } = useAuthStore();
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

    // Fetch this user's saved logs from the DB
    const { data: userLogsData = [], isLoading: isLoadingLogs } = useGetQueryLog(
        { where: { userId: user?.id }, take: 200 } as any,
        { query: { enabled: isLoggedIn && !!user?.id } as any }
    );

    // Fetch fixtures for the user's logged games so we can display team names / dates
    const loggedFixtureIds = useMemo(
        () => Array.from(new Set(userLogsData.map(l => l.fixtureId))),
        [userLogsData]
    );
    const { data: loggedFixturesRaw = [], isLoading: isLoadingLoggedFixtures } = useGetQueryFixture(
        { where: { id: { $in: loggedFixtureIds } }, take: 200 } as any,
        { query: { enabled: loggedFixtureIds.length > 0 } as any }
    );

    // Map DB logs → UserGame using the enriched fixture + team + competition data
    const loggedFixtures = useMemo((): UserGame[] => {
        return userLogsData.map(log => {
            const fixture = loggedFixturesRaw.find(f => f.id === log.fixtureId);
            const homeTeam = teamsData.find(t => t.id === fixture?.homeTeamId);
            const awayTeam = teamsData.find(t => t.id === fixture?.awayTeamId);
            const competition = competitionsData.find(c => c.id === fixture?.competitionId);
            return {
                fixtureId: String(log.fixtureId),
                homeTeam: homeTeam?.name ?? `Team ${fixture?.homeTeamId ?? '?'}`,
                awayTeam: awayTeam?.name ?? `Team ${fixture?.awayTeamId ?? '?'}`,
                homeScore: 0,
                awayScore: 0,
                date: fixture?.date ?? '',
                competitionName: competition?.name ?? 'Unknown',
                isVerified: log.isVerified,
                stage: fixture?.stage ?? '',
                events: [],
            };
        });
    }, [userLogsData, loggedFixturesRaw, teamsData, competitionsData]);

    const loading = isLoadingCompetitions || isLoadingSeasons || isLoadingTeamsTcs || isLoadingTeams
        || isLoadingFixtures || isLoadingLogs || isLoadingLoggedFixtures || isCreatingLog;

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
            queryClient.invalidateQueries({ queryKey: getGetQueryLogQueryKey() });

            showNotification({
                title: 'Match Added!',
                message: `${homeTeam?.name ?? 'Home'} vs ${awayTeam?.name ?? 'Away'} has been added to your logs`,
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
                title: 'Failed to save match',
                message: 'Something went wrong. Please try again.',
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
    // Lock Overlay component - rendered via portal to document body
    const lockOverlay = !isLoggedIn ? (
        createPortal(
            <Box
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'auto',
                    margin: 0,
                    padding: 0,
                }}
            >
                {/* Back Button */}
                <ActionIcon
                    onClick={() => window.history.back()}
                    variant="filled"
                    size="xl"
                    radius="xl"
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        backgroundColor: 'var(--modern-lime)',
                        color: 'var(--modern-bg-primary)',
                        zIndex: 10001,
                        border: '2px solid var(--modern-lime)',
                    }}
                >
                    <IconArrowLeft size={24} />
                </ActionIcon>

                <ModernCard
                    style={{
                        padding: '3rem',
                        backgroundColor: 'var(--modern-card-bg)',
                        border: '2px solid var(--modern-lime)',
                        maxWidth: '500px',
                        width: '90%',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 10000,
                    }}
                >
                    <Stack gap="lg" align="center">
                        <IconLock 
                            size={64} 
                            style={{ 
                                color: 'var(--modern-lime)',
                                marginBottom: '1rem'
                            }} 
                        />
                        <ModernH2 style={{ color: 'var(--modern-text-primary)' }}>
                            Authentication Required
                        </ModernH2>
                        <ModernBody style={{ color: 'var(--modern-text-secondary)' }}>
                            You need to be logged in to access your match logs. Sign in to track and manage your match history.
                        </ModernBody>
                        <Group gap="md" mt="md">
                            <ModernButton
                                onClick={() => navigateWithTransition('/signIn')}
                                variant="primary"
                                size="md"
                            >
                                Sign In
                            </ModernButton>
                            <ModernButton
                                onClick={() => navigateWithTransition('/join')}
                                variant="outline"
                                size="md"
                                style={{
                                    borderColor: 'var(--modern-lime)',
                                    color: 'var(--modern-lime)',
                                }}
                            >
                                Sign Up
                            </ModernButton>
                        </Group>
                    </Stack>
                </ModernCard>
            </Box>,
            document.body
        )
    ) : null;

    return (
        <Box className="dark-theme" style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--modern-bg-primary)',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            marginTop: '-1rem',
            position: 'relative'
        }}>
            {lockOverlay}
            
            <Container>
                <Grid my={10}>
                    <LoadingOverlay visible={loading} />
                    <Grid.Col span={columnSpan}>

                        <Box mb={10}>
                            <ModernH2 style={{ color: 'var(--modern-text-primary)', marginBottom: '0.5rem' }}>
                                My Logged Games
                            </ModernH2>
                            <ModernBody style={{ color: 'var(--modern-text-secondary)' }}>
                                Track and manage your match history across different competitions
                            </ModernBody>
                        </Box>

                    <Box mb="xl" style={{ maxHeight: 'none' }}>
                        <ModernCard 
                            hover={false}
                            style={{ 
                                padding: '2rem', 
                                backgroundColor: 'var(--modern-card-bg)',
                                maxHeight: 'none'
                            }}
                            styles={{
                                root: {
                                    maxHeight: 'none',
                                    position: 'static',
                                    transform: 'none !important',
                                    '&:hover': {
                                        transform: 'none !important',
                                        position: 'static'
                                    }
                                }
                            }}
                        >
                            <Stack gap="lg">
                                <Box style={{ textAlign: 'center' }}>
                                    <ModernH3 style={{ color: 'var(--modern-text-primary)', marginBottom: '0.5rem' }}>
                                        Add New Match
                                    </ModernH3>
                                    <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.9rem' }}>
                                        Search for a fixture by selecting competition, season, and filtering teams
                                    </ModernBody>
                                </Box>

                                <Box>
                                    <ModernCaption style={{ color: 'var(--modern-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>Competition</ModernCaption>
                                    <Select
                                        placeholder="Select competition"
                                        data={competitionsData.map((c) => ({value: String(c.id), label: c.name}))}
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
                                        styles={{
                                            input: {
                                                backgroundColor: 'var(--modern-bg-secondary)',
                                                borderColor: 'var(--modern-border-color)',
                                                color: 'var(--modern-text-primary)',
                                                '&:focus': {
                                                    borderColor: 'var(--modern-lime)',
                                                }
                                            }
                                        }}
                                    />
                                </Box>

                                {selectedCompetition && (
                                    <Box>
                                        <ModernCaption style={{ color: 'var(--modern-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>Season</ModernCaption>
                                        <Select
                                            placeholder={isLoadingSeasons ? 'Loading seasons…' : 'Select season'}
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
                                            size="md"
                                            styles={{
                                                input: {
                                                    backgroundColor: 'var(--modern-bg-secondary)',
                                                    borderColor: 'var(--modern-border-color)',
                                                    color: 'var(--modern-text-primary)',
                                                    '&:focus': {
                                                        borderColor: 'var(--modern-lime)',
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                )}

                                {selectedSeason && (
                                    <>
                                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                            <Box>
                                                <ModernCaption style={{ color: 'var(--modern-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>Home Team</ModernCaption>
                                                <Select
                                                    placeholder={isLoadingTeams ? 'Loading teams…' : 'Select home team'}
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
                                                    size="md"
                                                    styles={{
                                                        input: {
                                                            backgroundColor: 'var(--modern-bg-secondary)',
                                                            borderColor: 'var(--modern-border-color)',
                                                            color: 'var(--modern-text-primary)',
                                                            '&:focus': {
                                                                borderColor: 'var(--modern-lime)',
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Box>
                                                <ModernCaption style={{ color: 'var(--modern-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>Away Team</ModernCaption>
                                                <Select
                                                    placeholder={isLoadingTeams ? 'Loading teams…' : 'Select away team'}
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
                                                    size="md"
                                                    styles={{
                                                        input: {
                                                            backgroundColor: 'var(--modern-bg-secondary)',
                                                            borderColor: 'var(--modern-border-color)',
                                                            color: 'var(--modern-text-primary)',
                                                            '&:focus': {
                                                                borderColor: 'var(--modern-lime)',
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </SimpleGrid>

                                        {selectedHomeTeam && selectedAwayTeam && fixturesData.length > 0 && (
                                            <Box>
                                                <ModernCaption style={{ color: 'var(--modern-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>Select Fixture</ModernCaption>
                                                <Select
                                                    placeholder={isLoadingFixtures ? 'Loading fixtures…' : 'Choose a fixture'}
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
                                                    size="md"
                                                    styles={{
                                                        input: {
                                                            backgroundColor: 'var(--modern-bg-secondary)',
                                                            borderColor: 'var(--modern-border-color)',
                                                            color: 'var(--modern-text-primary)',
                                                            '&:focus': {
                                                                borderColor: 'var(--modern-lime)',
                                                            }
                                                        }
                                                    }}
                                                />
                                                <ModernCaption style={{ color: 'var(--modern-text-secondary)', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                                    {fixturesData.length} {fixturesData.length === 1 ? 'match' : 'matches'} found
                                                </ModernCaption>
                                            </Box>
                                        )}

                                        {selectedHomeTeam && selectedAwayTeam && !isLoadingFixtures && fixturesData.length === 0 && (
                                            <Box style={{ textAlign: 'center', padding: '1rem' }}>
                                                <ModernBody style={{ color: 'var(--modern-text-secondary)' }}>
                                                    No matches found between these teams
                                                </ModernBody>
                                            </Box>
                                        )}

                                        {selectedHomeTeam && selectedAwayTeam && (
                                            <Box mt="md">
                                                <ModernButton
                                                    onClick={handleAddToLog}
                                                    disabled={!selectedFixture}
                                                    fullWidth
                                                    size="md"
                                                    variant="primary"
                                                >
                                                    Add Match to Logs
                                                </ModernButton>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Stack>
                        </ModernCard>
                    </Box>

                </Grid.Col>
                <Grid.Col span={columnSpan}>
                        <Tabs defaultValue={'matches'}>
                        <Tabs.List style={{ justifyContent: 'center', width: '100%' }}>
                            <Tabs.Tab 
                                value={'matches'}
                                style={{ 
                                    fontSize: '1.1rem',
                                    padding: '1rem 2rem',
                                    fontWeight: 600
                                }}
                            >
                                Matches
                            </Tabs.Tab>
                            <Tabs.Tab 
                                value={'stats'}
                                style={{ 
                                    fontSize: '1.1rem',
                                    padding: '1rem 2rem',
                                    fontWeight: 600
                                }}
                            >
                                Stats
                            </Tabs.Tab>
                            <Tabs.Tab
                                value={'tickets'}
                                style={{
                                    fontSize: '1.1rem',
                                    padding: '1rem 2rem',
                                    fontWeight: 600
                                }}
                            >
                                <Group gap={6}>
                                    <IconTicket size={16} />
                                    My Tickets
                                    {myTickets.length > 0 && (
                                        <Badge
                                            size="xs"
                                            style={{
                                                backgroundColor: 'var(--modern-lime)',
                                                color: 'var(--modern-bg-primary)',
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
                                    { label: 'All Games', value: 'all' },
                                    { label: 'Verified', value: 'verified' },
                                ]}
                                size="sm"
                                styles={{
                                    root: {
                                        backgroundColor: 'var(--modern-bg-secondary)',
                                    },
                                    label: {
                                        color: 'var(--modern-text-primary)',
                                        '&[data-active]': {
                                            color: 'var(--modern-bg-primary)',
                                        },
                                    },
                                    control: {
                                        '&[data-active]': {
                                            backgroundColor: 'var(--modern-lime)',
                                        },
                                    },
                                }}
                            />
                        </Box>
                        <Tabs.Panel value={'matches'}>
                            <ScrollArea
                                style={{ height: `${scrollAreaHeight}px`, minHeight: '400px' }}
                                type="never"
                                scrollbarSize={2}
                                scrollHideDelay={0}
                            >
                                {filteredLoggedFixtures.length === 0 && !loading ? (
                                    <ModernCard style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--modern-card-bg)' }}>
                                        <ModernH3 style={{ color: 'var(--modern-text-primary)', marginBottom: '1rem' }}>
                                            {loggedFixtures.length === 0 
                                                ? 'No Matches Logged Yet' 
                                                : verificationFilter === 'verified' ? 'No Verified Matches Found' : 'No Matches Found'}
                                        </ModernH3>
                                        <ModernBody style={{ color: 'var(--modern-text-secondary)' }}>
                                            {loggedFixtures.length === 0 
                                                ? 'Start by adding your first match using the form'
                                                : 'Try changing the filter to see more matches'}
                                        </ModernBody>
                                    </ModernCard>
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
                                                homeScore={fixture.homeScore}
                                                awayScore={fixture.awayScore}
                                                date={fixture.date}
                                                competitionName={fixture.competitionName}
                                                leaguePosition={fixture.leaguePosition}
                                                isVerified={fixture.isVerified}
                                                venue={fixture.venue}
                                                userTeam={fixture.userTeam}
                                                stage={fixture.stage}
                                                events={fixture.events}
                                            />
                                        ))}
                                    </SimpleGrid>
                                )}
                            </ScrollArea>
                        </Tabs.Panel>                        <Tabs.Panel value={'stats'}>
                            <ScrollArea
                                style={{ height: `${scrollAreaHeight}px` }}
                                type="never"
                                scrollbarSize={2}
                                scrollHideDelay={0}
                            >
                                {filteredLoggedFixtures.length === 0 && !loading ? (
                                    <ModernCard style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--modern-card-bg)' }}>
                                        <ModernH3 style={{ color: 'var(--modern-text-primary)', marginBottom: '1rem' }}>
                                            {loggedFixtures.length === 0 
                                                ? 'No Matches Logged Yet' 
                                                : verificationFilter === 'verified' ? 'No Verified Matches Found' : 'No Matches Found'}
                                        </ModernH3>
                                        <ModernBody style={{ color: 'var(--modern-text-secondary)' }}>
                                            {loggedFixtures.length === 0 
                                                ? 'Start by adding your first match using the form'
                                                : 'Try changing the filter to see more matches'}
                                        </ModernBody>
                                    </ModernCard>
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
                                    <ModernCard style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--modern-card-bg)' }}>
                                        <ModernBody style={{ color: 'var(--modern-text-secondary)' }}>
                                            Loading your tickets…
                                        </ModernBody>
                                    </ModernCard>
                                ) : myTickets.length === 0 ? (
                                    <ModernCard style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--modern-card-bg)' }}>
                                        <IconTicket size={40} color="var(--modern-text-secondary)" style={{ margin: '0 auto 1rem' }} />
                                        <ModernH3 style={{ color: 'var(--modern-text-primary)', marginBottom: '0.5rem' }}>
                                            No Tickets Yet
                                        </ModernH3>
                                        <ModernBody style={{ color: 'var(--modern-text-secondary)', marginBottom: '1.5rem' }}>
                                            Tickets you purchase will appear here automatically.
                                        </ModernBody>
                                        <ModernButton
                                            variant="primary"
                                            onClick={() => navigateWithTransition('/tickets')}
                                        >
                                            Browse Tickets
                                        </ModernButton>
                                    </ModernCard>
                                ) : (
                                    <SimpleGrid cols={1} style={{ gap: 'var(--mantine-spacing-md)', padding: '0 8px' }}>
                                        {myTickets.map((entry) => (
                                            <Paper
                                                key={entry.id}
                                                p="md"
                                                radius="md"
                                                style={{
                                                    backgroundColor: 'var(--modern-card-bg)',
                                                    border: '1px solid var(--modern-border-color)',
                                                }}
                                            >
                                                <Group justify="space-between" mb="xs">
                                                    <Group gap="sm">
                                                        <IconTicket size={18} color="var(--modern-lime)" />
                                                        <Text fw={600} style={{ color: 'var(--modern-text-primary)' }}>
                                                            {entry.ticket?.category ?? 'Ticket'}
                                                        </Text>
                                                    </Group>
                                                    <Badge
                                                        size="sm"
                                                        style={{
                                                            backgroundColor: 'rgba(0, 255, 136, 0.15)',
                                                            color: 'var(--modern-lime)',
                                                            border: '1px solid rgba(0, 255, 136, 0.3)',
                                                        }}
                                                    >
                                                        In Wallet
                                                    </Badge>
                                                </Group>

                                                <Stack gap={4} mb="md">
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="dimmed">Fixture</Text>
                                                        <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                                            {entry.ticket?.fixtureLabel ??
                                                                `#${entry.ticket?.fixtureId ?? entry.ticketId}`}
                                                        </Text>
                                                    </Group>
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="dimmed">Ticket #</Text>
                                                        <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                                            #{entry.ticketId}
                                                        </Text>
                                                    </Group>
                                                    {entry.ticket?.price != null && (
                                                        <Group justify="space-between">
                                                            <Text size="sm" c="dimmed">Face Value</Text>
                                                            <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                                                {new Intl.NumberFormat('en-GB', {
                                                                    style: 'currency',
                                                                    currency: 'GBP',
                                                                }).format(entry.ticket.price)}
                                                            </Text>
                                                        </Group>
                                                    )}
                                                </Stack>

                                                <Group gap="sm">
                                                    <ModernButton
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
                                                            Sell on Marketplace
                                                        </Group>
                                                    </ModernButton>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </SimpleGrid>
                                )}
                            </ScrollArea>
                        </Tabs.Panel>

                    </Tabs>
                    <ModernButton
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
                        Go to Top
                    </ModernButton>
                </Grid.Col>
            </Grid>

            </Container>
        </Box>
    );
}
