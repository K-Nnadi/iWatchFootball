import {
    useState,
    useEffect,
    FormEvent
} from 'react';
import {
    Box,
    Button,
    Container,
    Title,
    Text,
    Paper,
    Select,
    TextInput,
    LoadingOverlay,
    Notification,
    SimpleGrid
} from '@mantine/core';
import {ErrorMessage} from '../shared/errorMessage';
import {LoggedFixtureCard} from '../components/cards/fixture.card';

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

interface MatchEvent {
    time: number;
    description: string;
    team: 'home' | 'away';
}

interface UserGame {
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
        // Mock logged fixtures with events
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
                    {time: 10, description: 'Goal by Team A striker', team: 'home'},
                    {time: 45, description: 'Yellow card for Team B defender', team: 'away'},
                    {time: 60, description: 'Substitution: Team A midfielder off, new midfielder on', team: 'home'},
                    {time: 75, description: 'Goal by Team B winger', team: 'away'}
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
                    {time: 5, description: 'Kick-off', team: 'home'},
                    {time: 30, description: 'Team D missed penalty', team: 'away'},
                    {time: 90, description: 'Final whistle', team: 'home'}
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

            const newLog: UserGame = {
                fixtureId: addedFixture.id,
                homeTeam: addedFixture.homeTeam,
                awayTeam: addedFixture.awayTeam,
                homeScore: 2,
                awayScore: 1,
                date: addedFixture.date,
                competitionName: competitions.find((c) => c.id === addedFixture.competitionId)?.name || 'Unknown',
                leaguePosition: Math.floor(Math.random() * 10) + 1,
                isVerified: false,
                venue: addedFixture.venue,
                userTeam: 'home',
                stage: 'League Game',
                events: [
                    {time: 10, description: 'Goal by home team player', team: 'home'},
                    {time: 30, description: 'Yellow card for away team', team: 'away'}
                ]
            };

            setLoggedFixtures((prev) => [...prev, newLog]);
            setLoading(false);
            setSuccessMessage('Match successfully added to your logs!');

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

    return (
        <Container size="xl" my={40}>
            <LoadingOverlay visible={loading} overlayBlur={2}/>

            <Box mb={40}>
                <Title order={2} mb="xs" sx={(theme) => ({
                    color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[8],
                    fontSize: '2rem',
                    fontWeight: 600
                })}>
                    My Logged Games
                </Title>
                <Text color="dimmed" size="sm">
                    Track and manage your match history across different competitions
                </Text>
            </Box>

            {error && (
                <Notification title="Error" color="red" onClose={() => setError(null)} mb="lg" sx={{borderRadius: 8}}>
                    {error}
                </Notification>
            )}

            {successMessage && (
                <Notification
                    title="Success"
                    color="green"
                    onClose={() => setSuccessMessage(null)}
                    mb="lg"
                    sx={{borderRadius: 8}}
                >
                    {successMessage}
                </Notification>
            )}

            <SimpleGrid cols={2} spacing="xl" breakpoints={[{maxWidth: 'md', cols: 1}]}>
                <Box sx={{ position: 'fixed', width: 'calc(50% - 40px)', maxWidth: '600px' }}>
                    <Paper p="xl" radius="lg" shadow="md" withBorder sx={(theme) => ({
                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows.lg
                        }
                    })}>
                        <Title order={3} mb="md" sx={(theme) => ({
                            color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[8],
                            fontSize: '1.5rem',
                            fontWeight: 600
                        })}>Add New Match</Title>

                        <Text color="dimmed" size="sm" mb="xl">
                            Search for a fixture by selecting competition, season, and filtering teams
                        </Text>

                        <Box mb="md">
                            <Text weight={500} size="sm" mb="xs">Competition</Text>
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
                                sx={{width: '100%'}}
                            />
                        </Box>

                        {selectedCompetition && (
                            <Box mb="md">
                                <Text weight={500} size="sm" mb="xs">Season</Text>
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
                                    sx={{width: '100%'}}
                                />
                            </Box>
                        )}

                        {selectedSeason && (
                            <>
                                <SimpleGrid cols={2} spacing="md" mb="md">
                                    <Box>
                                        <Text weight={500} size="sm" mb="xs">Home Team</Text>
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
                                            sx={{width: '100%'}}
                                        />
                                    </Box>
                                    <Box>
                                        <Text weight={500} size="sm" mb="xs">Away Team</Text>
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
                                            sx={{width: '100%'}}
                                        />
                                    </Box>
                                </SimpleGrid>

                                {selectedHomeTeam && selectedAwayTeam && filteredFixtures.length > 0 && (
                                    <Box mb="xl">
                                        <Text weight={500} size="sm" mb="xs">Select Fixture</Text>
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
                                            sx={{width: '100%'}}
                                        />
                                        <Text color="dimmed" size="xs" mt="xs">
                                            {filteredFixtures.length} {filteredFixtures.length === 1 ? 'match' : 'matches'} found
                                        </Text>
                                    </Box>
                                )}

                                {selectedHomeTeam && selectedAwayTeam && filteredFixtures.length === 0 && (
                                    <Text color="dimmed" size="sm" mb="xl" align="center">
                                        No matches found between these teams
                                    </Text>
                                )}

                                <Button
                                    onClick={handleAddToLog}
                                    disabled={!selectedFixture}
                                    fullWidth
                                    size="md"
                                    sx={(theme) => ({
                                        backgroundColor: theme.colors.blue[6],
                                        '&:hover': {
                                            backgroundColor: theme.colors.blue[7],
                                        }
                                    })}
                                >
                                    Add Match to Logs
                                </Button>
                            </>
                        )}
                    </Paper>
                </Box>

                <Box sx={{ marginLeft: 'auto', width: '50%', '@media (max-width: 992px)': { width: '100%', marginLeft: 0 } }}>
                    {loggedFixtures.length === 0 && !loading ? (
                        <Paper p="xl" radius="lg" withBorder sx={(theme) => ({
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
                            textAlign: 'center'
                        })}>
                            <Text size="lg" weight={500} mb="md">No Matches Logged Yet</Text>
                            <Text color="dimmed" size="sm">
                                Start by adding your first match using the form on the left
                            </Text>
                        </Paper>
                    ) : (
                        <SimpleGrid
                            cols={1}
                            spacing="lg"
                            sx={{maxHeight: '80vh', overflowY: 'auto', padding: '0 8px'}}
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
                </Box>
            </SimpleGrid>
        </Container>
    );
}
