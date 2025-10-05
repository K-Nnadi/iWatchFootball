import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Paper,
    Badge,
    Box,
    Text,
    Group,
    Button,
    SimpleGrid
} from '@mantine/core';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import TeamLineups from "./teamLineup";

export interface Player {
    id: string;
    name: string;
    number: number;
    position: string; // 'GK', 'DF', 'MF', 'FW'
}

export interface Lineup {
    formation: string; // e.g. '4-3-3'
    players: Player[]; // 11 players in starting lineup
    substitutes?: Player[];
}

export interface MatchDetails {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    homeLineup?: Lineup;
    awayLineup?: Lineup;
    homePredictedLineup?: Lineup;
    awayPredictedLineup?: Lineup;
}

function getMatchStatus(matchDateStr: string): 'past' | 'today' | 'future' {
    const matchDate = new Date(matchDateStr);
    const now = new Date();

    // Set both dates to start of day for comparison
    const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (matchDay < today) {
        return 'past';
    } else if (matchDay.getTime() === today.getTime()) {
        return 'today';
    } else {
        return 'future';
    }
}

/** Mock function returning last 5 games form for a team. (W, D, L) */
function getTeamForm(teamName: string): ('W'|'D'|'L')[] {
    const outcomes = ['W', 'D', 'L'];
    const form: ('W'|'D'|'L')[] = [];
    for (let i = 0; i < 5; i++) {
        const rand = Math.floor(Math.random() * outcomes.length);
        form.push(outcomes[rand] as 'W'|'D'|'L');
    }
    return form;
}

export function MatchPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // Mock match data
    const mockMatchDetails: MatchDetails = {
        matchId: matchId || '1',
        homeTeam: 'Liverpool',
        awayTeam: 'Manchester City',
        date: '2025-01-24T15:00:00Z', // Set to tomorrow for testing
        venue: 'Anfield',
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
                { id: 'h11', name: 'Diaz', number: 23, position: 'FW' }
            ],
            substitutes: [
                { id: 'hs1', name: 'Kelleher', number: 62, position: 'GK' },
                { id: 'hs2', name: 'Gomez', number: 12, position: 'DF' },
                { id: 'hs3', name: 'Endo', number: 6, position: 'MF' },
                { id: 'hs4', name: 'Elliott', number: 67, position: 'MF' },
                { id: 'hs5', name: 'Gakpo', number: 18, position: 'FW' }
            ]
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
                { id: 'a10', name: 'Grealish', number: 10, position: 'FW' },
                { id: 'a11', name: 'Haaland', number: 9, position: 'FW' }
            ],
            substitutes: [
                { id: 'as1', name: 'Ortega', number: 33, position: 'GK' },
                { id: 'as2', name: 'Akanji', number: 25, position: 'DF' },
                { id: 'as3', name: 'Kovacic', number: 8, position: 'MF' },
                { id: 'as4', name: 'Doku', number: 11, position: 'FW' },
                { id: 'as5', name: 'Alvarez', number: 15, position: 'FW' }
            ]
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
                { id: 'hp11', name: 'Diaz', number: 23, position: 'FW' }
            ]
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
                { id: 'ap10', name: 'Grealish', number: 10, position: 'FW' },
                { id: 'ap11', name: 'Haaland', number: 9, position: 'FW' }
            ]
        }
    };


    const [matchDetails, setMatchDetails] = useState<MatchDetails>(mockMatchDetails);
    const [homeVotes, setHomeVotes] = useState(Math.floor(Math.random() * 100));
    const [awayVotes, setAwayVotes] = useState(Math.floor(Math.random() * 100));
    const [userVote, setUserVote] = useState<'home' | 'away' | null>(null);
    const status = getMatchStatus(matchDetails.date);

    // Retrieve last 5 games form for each team
    const homeForm = getTeamForm(matchDetails.homeTeam);
    const awayForm = getTeamForm(matchDetails.awayTeam);

    function handlePrediction(result: 'win' | 'draw' | 'lose') {
        console.log(`User predicted a ${result}`);
        setUserVote(result === 'win' ? 'home' : result === 'lose' ? 'away' : null);
        // Fake updating stats
        const newHomeVotes = result === 'win' ? homeVotes + 1 : homeVotes;
        const newAwayVotes = result === 'lose' ? awayVotes + 1 : awayVotes;
        setHomeVotes(newHomeVotes);
        setAwayVotes(newAwayVotes);
    }

    function handleViewTickets() {
        // Navigate to seat selection or ticket purchase page
        navigate(`/seat-selection/${matchDetails.matchId}`, {
            state: matchDetails, // pass match details if needed
        });
    }

    return (
        <Container size="xl" py="xl">
            {/* Match Header */}
            <Paper p="xl" radius="lg" withBorder mb="xl">
                <Group position="apart" align="center" noWrap sx={{ width: '100%' }}>
                    {/* Home team */}
                    <Box sx={{ flex: 1, textAlign: 'right' }}>
                        <Title order={2} mb="md">{matchDetails.homeTeam}</Title>
                        <Group position="right" spacing={8}>
                            {homeForm.map((result, i) => (
                                <Badge
                                    key={i}
                                    color={result === 'W' ? 'green' : result === 'D' ? 'yellow' : 'red'}
                                    size="lg"
                                >
                                    {result}
                                </Badge>
                            ))}
                        </Group>
                    </Box>

                    {/* Center VS block */}
                    <Box
                        sx={(theme) => ({
                            textAlign: 'center',
                            padding: '0 24px',
                            minWidth: 200,
                            borderLeft: `2px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                            borderRight: `2px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`
                        })}
                    >
                        <Text size="sm" color="dimmed" mb="xs">
                            {new Date(matchDetails.date).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                        <Text size="xl" weight={700} mb="xs">VS</Text>
                        <Text size="sm" color="dimmed">{matchDetails.venue}</Text>
                        <Button
                            variant="light"
                            color="blue"
                            size="sm"
                            mt="md"
                            onClick={handleViewTickets}
                        >
                            View Tickets
                        </Button>
                    </Box>

                    {/* Away team */}
                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                        <Title order={2} mb="md">{matchDetails.awayTeam}</Title>
                        <Group position="left" spacing={8}>
                            {awayForm.map((result, i) => (
                                <Badge
                                    key={i}
                                    color={result === 'W' ? 'green' : result === 'D' ? 'yellow' : 'red'}
                                    size="lg"
                                >
                                    {result}
                                </Badge>
                            ))}
                        </Group>
                    </Box>
                </Group>
            </Paper>


            {/* Predictions Section */}
            {status !== 'past' && (
                <Paper p="xl" radius="lg" withBorder mb="xl">
                    <Title order={3} size="h4" mb="md" align="center">Match Prediction</Title>
                    <SimpleGrid cols={3} spacing={0}>
                        <Box sx={{ paddingRight: 20, borderRight: '1px solid', borderColor: 'gray.3' }}>
                            <Button
                                fullWidth
                                variant={userVote === 'home' ? 'filled' : 'outline'}
                                size="lg"
                                color="blue"
                                onClick={() => handlePrediction('win')}
                                disabled={userVote !== null}
                            >
                                {matchDetails.homeTeam} Win
                            </Button>
                            <Text align="center" mt="xs" size="sm" color="dimmed">
                                {homeVotes}%
                            </Text>
                        </Box>

                        <Box sx={{ padding: '0 20px' }}>
                            <Button
                                fullWidth
                                variant={userVote === null ? 'filled' : 'outline'}
                                size="lg"
                                color="yellow"
                                onClick={() => handlePrediction('draw')}
                                disabled={userVote !== null}
                            >
                                Draw
                            </Button>
                            <Text align="center" mt="xs" size="sm" color="dimmed">
                                {100 - homeVotes - awayVotes}%
                            </Text>
                        </Box>

                        <Box sx={{ paddingLeft: 20, borderLeft: '1px solid', borderColor: 'gray.3' }}>
                            <Button
                                fullWidth
                                variant={userVote === 'away' ? 'filled' : 'outline'}
                                size="lg"
                                color="red"
                                onClick={() => handlePrediction('lose')}
                                disabled={userVote !== null}
                            >
                                {matchDetails.awayTeam} Win
                            </Button>
                            <Text align="center" mt="xs" size="sm" color="dimmed">
                                {awayVotes}%
                            </Text>
                        </Box>
                    </SimpleGrid>
                    <Text size="sm" color="dimmed" align="center" mt="md">
                        Total Predictions: {homeVotes + awayVotes}
                    </Text>
                </Paper>
            )}

            {/* Team Lineups */}
                <TeamLineups matchDetails={matchDetails} status={status} />
        </Container>
    );
}
