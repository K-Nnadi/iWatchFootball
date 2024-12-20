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
import { ErrorMessage } from '../shared/errorMessage';
import { LoggedFixtureCard } from '../components/cards/fixture.card';

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

export function LogsPage() {
    // States for searching and adding matches
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [filteredFixtures, setFilteredFixtures] = useState<Fixture[]>([]);

    const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

    const [homeTeamFilter, setHomeTeamFilter] = useState('');
    const [awayTeamFilter, setAwayTeamFilter] = useState('');
    const [selectedFixture, setSelectedFixture] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [loggedFixtures, setLoggedFixtures] = useState<UserGame[]>([]);

    useEffect(() => {
        setLoading(true);
        const mockCompetitions = [
            { id: 'comp1', name: 'Premier League' },
            { id: 'comp2', name: 'Champions League' }
        ];
        setCompetitions(mockCompetitions);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (selectedCompetition) {
            setLoading(true);
            const mockSeasons = [
                { id: 'season2023', year: '2023/2024' },
                { id: 'season2022', year: '2022/2023' }
            ];
            setSeasons(mockSeasons);
            setLoading(false);
        }
    }, [selectedCompetition]);

    useEffect(() => {
        if (selectedCompetition && selectedSeason) {
            setLoading(true);
            const mockFixtures: Fixture[] = [
                { id: 'fix1', homeTeam: 'Team A', awayTeam: 'Team B', date: '2023-09-10', competitionId: selectedCompetition, seasonId: selectedSeason, venue: 'Stadium A' },
                { id: 'fix2', homeTeam: 'Team C', awayTeam: 'Team D', date: '2023-09-11', competitionId: selectedCompetition, seasonId: selectedSeason, venue: 'Stadium B' }
            ];
            setFixtures(mockFixtures);
            setLoading(false);
        }
    }, [selectedCompetition, selectedSeason]);

    useEffect(() => {
        let updated = fixtures;
        if (homeTeamFilter) {
            updated = updated.filter((f) => f.homeTeam.toLowerCase().includes(homeTeamFilter.toLowerCase()));
        }
        if (awayTeamFilter) {
            updated = updated.filter((f) => f.awayTeam.toLowerCase().includes(awayTeamFilter.toLowerCase()));
        }
        setFilteredFixtures(updated);
    }, [fixtures, homeTeamFilter, awayTeamFilter]);

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
                    { time: 10, description: 'Goal by Team A striker', team: 'home' },
                    { time: 45, description: 'Yellow card for Team B defender', team: 'away' },
                    { time: 60, description: 'Substitution: Team A midfielder off, new midfielder on', team: 'home' },
                    { time: 75, description: 'Goal by Team B winger', team: 'away' }
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
                    { time: 5, description: 'Kick-off', team: 'home' },
                    { time: 30, description: 'Team D missed penalty', team: 'away' },
                    { time: 90, description: 'Final whistle', team: 'home' }
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
                    { time: 10, description: 'Goal by home team player', team: 'home' },
                    { time: 30, description: 'Yellow card for away team', team: 'away' }
                ]
            };

            setLoggedFixtures((prev) => [...prev, newLog]);
            setLoading(false);
            setSuccessMessage('Match successfully added to your logs!');

            setSelectedCompetition(null);
            setSelectedSeason(null);
            setFixtures([]);
            setFilteredFixtures([]);
            setHomeTeamFilter('');
            setAwayTeamFilter('');
            setSelectedFixture(null);

        } catch (err) {
            setLoading(false);
            setError('Failed to add match. Please try again.');
        }
    };

    return (
        <Container size={600} my={40} pos="relative">
            <LoadingOverlay visible={loading} overlayBlur={2} />
            <Title order={2} mb="lg">
                My Logged Games
            </Title>
            {error && <ErrorMessage message={error} />}
            {successMessage && (
                <Notification title="Success" color="green" onClose={() => setSuccessMessage(null)} mb="lg">
                    {successMessage}
                </Notification>
            )}

            <Paper p="xl" radius="md" shadow="lg" withBorder mb="xl">
                <Title order={3} mb="md">Add New Match to Logs</Title>
                <Text color="dimmed" size="sm" mb="lg">
                    Search for a fixture by choosing a competition, season, and filtering teams. Then add it to your logs.
                </Text>

                <Box mb="md">
                    <Text size="sm" mb="xs">Competition</Text>
                    <Select
                        placeholder="Select competition"
                        data={competitions.map((c) => ({ value: c.id, label: c.name }))}
                        value={selectedCompetition}
                        onChange={(val) => {
                            setSelectedCompetition(val);
                            setSelectedSeason(null);
                            setFixtures([]);
                            setFilteredFixtures([]);
                            setHomeTeamFilter('');
                            setAwayTeamFilter('');
                            setSelectedFixture(null);
                        }}
                    />
                </Box>

                {selectedCompetition && (
                    <Box mb="md">
                        <Text size="sm" mb="xs">Season</Text>
                        <Select
                            placeholder="Select season"
                            data={seasons.map((s) => ({ value: s.id, label: s.year }))}
                            value={selectedSeason}
                            onChange={(val) => {
                                setSelectedSeason(val);
                                setFixtures([]);
                                setFilteredFixtures([]);
                                setHomeTeamFilter('');
                                setAwayTeamFilter('');
                                setSelectedFixture(null);
                            }}
                        />
                    </Box>
                )}

                {selectedSeason && (
                    <>
                        <Box mb="md">
                            <Text size="sm" mb="xs">Home Team Filter</Text>
                            <TextInput
                                placeholder="e.g. Team A"
                                value={homeTeamFilter}
                                onChange={(e) => setHomeTeamFilter(e.currentTarget.value)}
                            />
                        </Box>
                        <Box mb="md">
                            <Text size="sm" mb="xs">Away Team Filter</Text>
                            <TextInput
                                placeholder="e.g. Team B"
                                value={awayTeamFilter}
                                onChange={(e) => setAwayTeamFilter(e.currentTarget.value)}
                            />
                        </Box>
                        {filteredFixtures.length > 0 && (
                            <Box mb="md">
                                <Text size="sm" mb="xs">Select a Fixture</Text>
                                <Select
                                    placeholder="Choose a fixture"
                                    data={filteredFixtures.map((f) => ({
                                        value: f.id,
                                        label: `${f.homeTeam} vs ${f.awayTeam} (${f.date})`
                                    }))}
                                    value={selectedFixture}
                                    onChange={setSelectedFixture}
                                />
                            </Box>
                        )}

                        <Button onClick={handleAddToLog} disabled={!selectedFixture} fullWidth mt="md">
                            Add Match
                        </Button>
                    </>
                )}
            </Paper>

            {loggedFixtures.length === 0 && !loading ? (
                <Notification title="No Logs Found" disallowClose>
                    You have not logged any fixtures yet.
                </Notification>
            ) : (
                <SimpleGrid
                    cols={1}
                    spacing="lg"
                    breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
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
                            events={fixture.events} // Pass events here
                        />
                    ))}
                </SimpleGrid>
            )}
        </Container>
    );
}
