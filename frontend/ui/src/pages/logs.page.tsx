import React, {FormEvent, useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    Container,
    Grid,
    LoadingOverlay,
    Paper,
    ScrollArea,
    Select,
    SimpleGrid,
    Tabs,
    Text,
    Title
} from '@mantine/core';
import { ModernButton, ModernCard, ModernH1, ModernH2, ModernH3, ModernBody, ModernCaption } from '../components/modern';

import {LoggedFixtureCard} from '../components/cards/fixture.card';
import StatsTab from "../tabs/stats.tab";
import NewStatsTab from "../tabs/newStats.tab";

interface Competition {
    id: string;
    name: string;
}

interface Season {
    id: string;
    year: string;
}

interface Fixture {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    competitionId: string;
    seasonId: string;
    venue: string;
}

export interface MatchEvent {
    time: number;
    description: string;
    team: 'home' | 'away';
    type: 'goal' | 'card' | 'substitution' | 'other' | 'penalty';
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

interface Team {
    id: string;
    name: string;
}

export function LogsPage() {
    // States for searching and adding matches
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [filteredFixtures, setFilteredFixtures] = useState<Fixture[]>([]);

    const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedHomeTeam, setSelectedHomeTeam] = useState<string | null>(null);
    const [selectedAwayTeam, setSelectedAwayTeam] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [loggedFixtures, setLoggedFixtures] = useState<UserGame[]>([]);

    useEffect(() => {
        setLoading(true);
        const mockCompetitions = [
            {id: 'comp1', name: 'Premier League'},
            {id: 'comp2', name: 'Champions League'}
        ];
        setCompetitions(mockCompetitions);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (selectedCompetition) {
            setLoading(true);
            const mockSeasons = [
                {id: 'season2023', year: '2023/2024'},
                {id: 'season2022', year: '2022/2023'}
            ];
            setSeasons(mockSeasons);
            setLoading(false);
        }
    }, [selectedCompetition]);

    useEffect(() => {
        setLoading(true);
        const mockTeams = [
            { id: 'team1', name: 'Arsenal' },
            { id: 'team2', name: 'Chelsea' },
            { id: 'team3', name: 'Liverpool' },
            { id: 'team4', name: 'Manchester City' },
            { id: 'team5', name: 'Manchester United' },
            { id: 'team6', name: 'Tottenham' },
            { id: 'team7', name: 'Newcastle' },
            { id: 'team8', name: 'Brighton' },
        ];
        setTeams(mockTeams);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (selectedCompetition && selectedSeason && selectedHomeTeam && selectedAwayTeam) {
            setLoading(true);
            const homeTeamName = teams.find(t => t.id === selectedHomeTeam)?.name;
            const awayTeamName = teams.find(t => t.id === selectedAwayTeam)?.name;

            const mockFixtures: Fixture[] = [
                {
                    id: 'fix1',
                    homeTeam: homeTeamName || '',
                    awayTeam: awayTeamName || '',
                    date: '2023-09-10',
                    competitionId: selectedCompetition,
                    seasonId: selectedSeason,
                    venue: 'Home Stadium'
                },
                {
                    id: 'fix2',
                    homeTeam: homeTeamName || '',
                    awayTeam: awayTeamName || '',
                    date: '2024-01-15',
                    competitionId: selectedCompetition,
                    seasonId: selectedSeason,
                    venue: 'Away Stadium'
                }
            ];
            setFixtures(mockFixtures);
            setLoading(false);
        }
    }, [selectedCompetition, selectedSeason, selectedHomeTeam, selectedAwayTeam, teams]);

    useEffect(() => {
        let updated = fixtures;
        if (selectedHomeTeam && selectedAwayTeam) {
            // Only show fixtures where the selected teams played against each other
            updated = updated.filter((f) =>
                teams.find(t => t.id === selectedHomeTeam)?.name === f.homeTeam &&
                teams.find(t => t.id === selectedAwayTeam)?.name === f.awayTeam
            );
        }
        setFilteredFixtures(updated);
        setSelectedFixture(null);
    }, [fixtures, selectedHomeTeam, selectedAwayTeam, teams]);

    useEffect(() => {
        setLoading(true);
        // Mock logged fixtures with detailed events including type
        const mockLoggedFixtures: UserGame[] = [
            {
                fixtureId: 'fix1',
                homeTeam: 'Team A',
                awayTeam: 'Team B',
                homeScore: 2,
                awayScore: 1,
                date: '2023-09-10',
                competitionName: 'Premier League',
                leaguePosition: 3,
                isVerified: true,
                venue: 'Stadium A',
                userTeam: 'home',
                stage: 'League Game',
                events: [
                    { time: 10, description: 'Goal by Team A striker', team: 'home', type: 'goal' },
                    { time: 45, description: 'Yellow card for Team B defender', team: 'away', type: 'card' },
                    { time: 60, description: 'Substitution: Team A midfielder off, new midfielder on', team: 'home', type: 'substitution' },
                    { time: 75, description: 'Goal by Team B winger', team: 'away', type: 'goal' }
                ]
            },
            {
                fixtureId: 'fix2',
                homeTeam: 'Team C',
                awayTeam: 'Team D',
                homeScore: 0,
                awayScore: 0,
                date: '2023-09-11',
                competitionName: 'Champions League',
                leaguePosition: 1,
                isVerified: false,
                venue: 'Stadium B',
                userTeam: 'away',
                stage: 'Semi-Finals',
                events: [
                    { time: 5, description: 'Kick-off', team: 'home', type: 'other' },
                    { time: 30, description: 'Team D missed penalty', team: 'away', type: 'penalty' },
                    { time: 90, description: 'Final whistle', team: 'home', type: 'other' }
                ]
            }
        ];
        setTimeout(() => {
            setLoggedFixtures(mockLoggedFixtures);
            setLoading(false);
        }, 1000);
    }, []);

    const handleAddToLog = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!selectedFixture) {
            setError('No fixture selected');
            return;
        }

        setLoading(true);

        try {
            const addedFixture = fixtures.find((f) => f.id === selectedFixture);
            if (!addedFixture) {
                throw new Error('Fixture not found');
            }

            // Creating a new log with detailed events including the type
            const newLog: UserGame = {
                fixtureId: addedFixture.id,
                homeTeam: addedFixture.homeTeam,
                awayTeam: addedFixture.awayTeam,
                homeScore: 2, // Mock score, consider making this dynamic if necessary
                awayScore: 1, // Mock score
                date: addedFixture.date,
                competitionName: competitions.find((c) => c.id === addedFixture.competitionId)?.name || 'Unknown',
                leaguePosition: Math.floor(Math.random() * 10) + 1,
                isVerified: false,
                venue: addedFixture.venue,
                userTeam: 'home',
                stage: 'League Game',
                events: [
                    {time: 10, description: 'Goal by home team player', team: 'home', type: 'goal'},
                    {time: 30, description: 'Yellow card for away team', team: 'away', type: 'card'},
                    {time: 45, description: 'Substitution: Home team midfielder off, new midfielder on', team: 'home', type: 'substitution'}
                ]
            };

            setLoggedFixtures((prev) => [...prev, newLog]);
            setLoading(false);
            setSuccessMessage('Match successfully added to your logs!');

            // Reset all selection fields after successfully logging a game
            setSelectedCompetition(null);
            setSelectedSeason(null);
            setFixtures([]);
            setFilteredFixtures([]);
            setSelectedHomeTeam(null);
            setSelectedAwayTeam(null);
            setSelectedFixture(null);

        } catch (err) {
            setLoading(false);
            setError('Failed to add match. Please try again.');
        }
    };

    const [selectedFixture, setSelectedFixture] = useState<string | null>(null);

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

    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
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
    return (
        <Box className="dark-theme" style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--modern-black)',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            marginTop: '-1rem'
        }}>
            <Container>
                <Grid my={10}>
                    <LoadingOverlay visible={loading} />
                    <Grid.Col span={columnSpan}>

                        <Box mb={10}>
                            <ModernH2 style={{ color: 'var(--modern-white)', marginBottom: '0.5rem' }}>
                                My Logged Games
                            </ModernH2>
                            <ModernBody style={{ color: 'var(--modern-light-gray)' }}>
                                Track and manage your match history across different competitions
                            </ModernBody>
                        </Box>

                    <Box style={{ position: 'sticky', top:20, width: '100%', maxWidth: 'none', marginBottom: '2rem' }}>
                        <ModernCard style={{ padding: '1.5rem', paddingBottom: '2rem', backgroundColor: 'var(--modern-dark-gray)' }}>
                            <ModernH3 style={{ color: 'var(--modern-white)', marginBottom: '1rem' }}>
                                Add New Match
                            </ModernH3>

                            <ModernBody style={{ color: 'var(--modern-light-gray)', marginBottom: '1.5rem' }}>
                                Search for a fixture by selecting competition, season, and filtering teams
                            </ModernBody>

                            <Box mb="sm">
                                <ModernCaption style={{ color: 'var(--modern-white)', marginBottom: '0.5rem' }}>Competition</ModernCaption>
                                <Select
                                    placeholder="Select competition"
                                    data={competitions.map((c) => ({value: c.id, label: c.name}))}
                                    value={selectedCompetition}
                                    onChange={(val) => {
                                        setSelectedCompetition(val);
                                        setSelectedSeason(null);
                                        setFixtures([]);
                                        setFilteredFixtures([]);
                                        setSelectedHomeTeam(null);
                                        setSelectedAwayTeam(null);
                                        setSelectedFixture(null);
                                    }}
                                    searchable
                                    clearable
                                    style={{width: '100%'}}
                                />
                            </Box>

                            {selectedCompetition && (
                                <Box mb="sm">
                                    <ModernCaption style={{ color: 'var(--modern-white)', marginBottom: '0.5rem' }}>Season</ModernCaption>
                                    <Select
                                        placeholder="Select season"
                                        data={seasons.map((s) => ({value: s.id, label: s.year}))}
                                        value={selectedSeason}
                                        onChange={(val) => {
                                            setSelectedSeason(val);
                                            setFixtures([]);
                                            setFilteredFixtures([]);
                                            setSelectedHomeTeam(null);
                                            setSelectedAwayTeam(null);
                                            setSelectedFixture(null);
                                        }}
                                        searchable
                                        clearable
                                        style={{width: '100%'}}
                                    />
                                </Box>
                            )}

                            {selectedSeason && (
                                <>
                                    <SimpleGrid cols={2} style={{ gap: 'var(--mantine-spacing-sm)' }} mb="sm">
                                        <Box>
                                            <ModernCaption style={{ color: 'var(--modern-white)', marginBottom: '0.5rem' }}>Home Team</ModernCaption>
                                            <Select
                                                placeholder="Select home team"
                                                data={teams
                                                    .filter(team => team.id !== selectedAwayTeam)
                                                    .map((team) => ({
                                                        value: team.id,
                                                        label: team.name
                                                    }))}
                                                value={selectedHomeTeam}
                                                onChange={(value) => {
                                                    setSelectedHomeTeam(value);
                                                    setSelectedFixture(null);
                                                }}
                                                searchable
                                                clearable
                                                style={{width: '100%'}}
                                            />
                                        </Box>
                                        <Box>
                                            <ModernCaption style={{ color: 'var(--modern-white)', marginBottom: '0.5rem' }}>Away Team</ModernCaption>
                                            <Select
                                                placeholder="Select away team"
                                                data={teams
                                                    .filter(team => team.id !== selectedHomeTeam)
                                                    .map((team) => ({
                                                        value: team.id,
                                                        label: team.name
                                                    }))}
                                                value={selectedAwayTeam}
                                                onChange={(value) => {
                                                    setSelectedAwayTeam(value);
                                                    setSelectedFixture(null);
                                                }}
                                                searchable
                                                clearable
                                                style={{width: '100%'}}
                                            />
                                        </Box>
                                    </SimpleGrid>

                                    {selectedHomeTeam && selectedAwayTeam && filteredFixtures.length > 0 && (
                                        <Box mb="md">
                                            <ModernCaption style={{ color: 'var(--modern-white)', marginBottom: '0.5rem' }}>Select Fixture</ModernCaption>
                                            <Select
                                                placeholder="Choose a fixture"
                                                data={filteredFixtures.map((f) => ({
                                                    value: f.id,
                                                    label: `${f.homeTeam} vs ${f.awayTeam} (${new Date(f.date).toLocaleDateString()})`
                                                }))}
                                                value={selectedFixture}
                                                onChange={setSelectedFixture}
                                                searchable
                                                clearable
                                                style={{width: '100%'}}
                                            />
                                            <ModernCaption style={{ color: 'var(--modern-light-gray)', marginTop: '0.5rem' }}>
                                                {filteredFixtures.length} {filteredFixtures.length === 1 ? 'match' : 'matches'} found
                                            </ModernCaption>
                                        </Box>
                                    )}

                                    {selectedHomeTeam && selectedAwayTeam && filteredFixtures.length === 0 && (
                                        <ModernBody style={{ color: 'var(--modern-light-gray)', marginBottom: '1rem', textAlign: 'center' }}>
                                            No matches found between these teams
                                        </ModernBody>
                                    )}

                                    {selectedHomeTeam && selectedAwayTeam && (
                                        <ModernButton
                                            onClick={handleAddToLog}
                                            disabled={!selectedFixture}
                                            fullWidth
                                            size="md"
                                            variant="primary"
                                        >
                                            Add Match to Logs
                                        </ModernButton>
                                    )}
                                </>
                            )}
                        </ModernCard>
                    </Box>

                </Grid.Col>
                <Grid.Col span={columnSpan}>
                    <Tabs defaultValue={'matches'} style={{
                        tab: {
                            flex: 1,
                            '&:first-of-type': {
                                marginLeft: 0,
                            },
                            '&:last-of-type': {
                                marginRight: 0,
                            },
                        },
                        tabsList: {
                            display: 'flex',
                            width: '100%',
                        }
                    }}>
                        <Tabs.List>
                            <Tabs.Tab value={'matches'}> Matches</Tabs.Tab>
                            <Tabs.Tab value={'stats'}>Stats</Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value={'matches'}>
                            <ScrollArea
                                style={{ height: `${scrollAreaHeight}px`, minHeight: '400px' }}
                                type="never"
                                scrollbarSize={2}
                                scrollHideDelay={0}
                            >
                                {loggedFixtures.length === 0 && !loading ? (
                                    <ModernCard style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--modern-dark-gray)' }}>
                                        <ModernH3 style={{ color: 'var(--modern-white)', marginBottom: '1rem' }}>No Matches Logged Yet</ModernH3>
                                        <ModernBody style={{ color: 'var(--modern-light-gray)' }}>
                                            Start by adding your first match using the form
                                        </ModernBody>
                                    </ModernCard>
                                ) : (
                                    <SimpleGrid
                                        cols={1}
                                        style={{ gap: 'var(--mantine-spacing-lg)', maxHeight: '80vh', overflowY: 'auto', padding: '0 8px' }}
                                    >
                                        {loggedFixtures.map((fixture) => (
                                            <LoggedFixtureCard
                                                key={fixture.fixtureId}
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
                                {loggedFixtures.length === 0 && !loading ? (
                                    <ModernCard style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--modern-dark-gray)' }}>
                                        <ModernH3 style={{ color: 'var(--modern-white)', marginBottom: '1rem' }}>No Matches Logged Yet</ModernH3>
                                        <ModernBody style={{ color: 'var(--modern-light-gray)' }}>
                                            Start by adding your first match using the form
                                        </ModernBody>
                                    </ModernCard>
                                ) : (
                                    // <StatsTab loggedFixtures={loggedFixtures}/>
                                    <NewStatsTab />
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
