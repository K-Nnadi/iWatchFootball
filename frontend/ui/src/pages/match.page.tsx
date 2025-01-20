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

interface Player {
    id: string;
    name: string;
    position: string; // 'GK', 'DF', 'MF', 'FW'
}

interface Lineup {
    formation: string; // e.g. '4-3-3'
    players: Player[]; // 11 players in starting lineup
    substitutes?: Player[];
}

interface MatchDetails {
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

/** Helper to arrange players in rows based on formation: e.g. 4-3-3 */
function arrangePlayersByFormation(players: Player[], formation: string) {
    const [defenders, midfielders, forwards] = formation.split('-').map(Number);
    const gk = players.filter((p) => p.position === 'GK');
    const df = players.filter((p) => p.position === 'DF');
    const mf = players.filter((p) => p.position === 'MF');
    const fw = players.filter((p) => p.position === 'FW');

    return {
        gk: gk.slice(0, 1),
        defenders: df.slice(0, defenders),
        midfielders: mf.slice(0, midfielders),
        forwards: fw.slice(0, forwards),
    };
}

/** Displays a formation (GK, DF, MF, FW) in rows */
function FormationView({ lineup, isPredicted }: { lineup: Lineup; isPredicted?: boolean }) {
    const arranged = arrangePlayersByFormation(lineup.players, lineup.formation);

    return (
        <Box>
            <Paper 
                p="md" 
                radius="md" 
                sx={(theme) => ({
                    backgroundColor: theme.colorScheme === 'dark' 
                        ? theme.fn.rgba(theme.colors.dark[8], 0.5) 
                        : theme.fn.rgba(theme.colors.gray[1], 0.7),
                    border: isPredicted ? `1px dashed ${theme.colors.gray[5]}` : undefined
                })}
            >
                <Group position="apart" mb="md">
                    <Text 
                        color="dimmed" 
                        size="sm" 
                        sx={(theme) => ({
                            fontFamily: theme.fontFamilyMonospace,
                            letterSpacing: 1
                        })}
                    >
                        {isPredicted ? 'Predicted Formation' : 'Formation'}: {lineup.formation}
                    </Text>
                    {isPredicted && (
                        <Badge variant="dot" color="yellow">Predicted</Badge>
                    )}
                </Group>

                <Box 
                    sx={(theme) => ({
                        background: theme.fn.linearGradient(180, 
                            theme.colorScheme === 'dark' 
                                ? theme.colors.dark[8] 
                                : theme.colors.gray[1],
                            'transparent'
                        ),
                        borderRadius: theme.radius.sm,
                        padding: theme.spacing.md
                    })}
                >
                    <Box mb={40}>
                        <Group position="center">
                            {arranged.gk.map((player) => (
                                <Badge 
                                    key={player.id} 
                                    variant="filled" 
                                    color="teal"
                                    size="lg"
                                    sx={{ minWidth: 120, textAlign: 'center' }}
                                >
                                    {player.name}
                                </Badge>
                            ))}
                        </Group>
                    </Box>

                    <Box mb={40}>
                        <Group position="center" spacing={20}>
                            {arranged.defenders.map((player) => (
                                <Badge 
                                    key={player.id} 
                                    variant="filled" 
                                    color="blue"
                                    size="lg"
                                    sx={{ minWidth: 120, textAlign: 'center' }}
                                >
                                    {player.name}
                                </Badge>
                            ))}
                        </Group>
                    </Box>

                    <Box mb={40}>
                        <Group position="center" spacing={20}>
                            {arranged.midfielders.map((player) => (
                                <Badge 
                                    key={player.id} 
                                    variant="filled" 
                                    color="violet"
                                    size="lg"
                                    sx={{ minWidth: 120, textAlign: 'center' }}
                                >
                                    {player.name}
                                </Badge>
                            ))}
                        </Group>
                    </Box>

                    <Box>
                        <Group position="center" spacing={20}>
                            {arranged.forwards.map((player) => (
                                <Badge 
                                    key={player.id} 
                                    variant="filled" 
                                    color="red"
                                    size="lg"
                                    sx={{ minWidth: 120, textAlign: 'center' }}
                                >
                                    {player.name}
                                </Badge>
                            ))}
                        </Group>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
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
        date: '2025-01-21T15:00:00Z', // Set to tomorrow for testing
        venue: 'Anfield',
        homeLineup: {
            formation: '4-3-3',
            players: [
                { id: 'h1', name: 'Alisson', position: 'GK' },
                { id: 'h2', name: 'Alexander-Arnold', position: 'DF' },
                { id: 'h3', name: 'Van Dijk', position: 'DF' },
                { id: 'h4', name: 'Konate', position: 'DF' },
                { id: 'h5', name: 'Robertson', position: 'DF' },
                { id: 'h6', name: 'Mac Allister', position: 'MF' },
                { id: 'h7', name: 'Szoboszlai', position: 'MF' },
                { id: 'h8', name: 'Jones', position: 'MF' },
                { id: 'h9', name: 'Salah', position: 'FW' },
                { id: 'h10', name: 'Nunez', position: 'FW' },
                { id: 'h11', name: 'Diaz', position: 'FW' }
            ],
            substitutes: [
                { id: 'hs1', name: 'Kelleher', position: 'GK' },
                { id: 'hs2', name: 'Gomez', position: 'DF' },
                { id: 'hs3', name: 'Endo', position: 'MF' },
                { id: 'hs4', name: 'Elliott', position: 'MF' },
                { id: 'hs5', name: 'Gakpo', position: 'FW' }
            ]
        },
        awayLineup: {
            formation: '4-2-3-1',
            players: [
                { id: 'a1', name: 'Ederson', position: 'GK' },
                { id: 'a2', name: 'Walker', position: 'DF' },
                { id: 'a3', name: 'Dias', position: 'DF' },
                { id: 'a4', name: 'Stones', position: 'DF' },
                { id: 'a5', name: 'Ake', position: 'DF' },
                { id: 'a6', name: 'Rodri', position: 'MF' },
                { id: 'a7', name: 'De Bruyne', position: 'MF' },
                { id: 'a8', name: 'Bernardo', position: 'MF' },
                { id: 'a9', name: 'Foden', position: 'MF' },
                { id: 'a10', name: 'Grealish', position: 'FW' },
                { id: 'a11', name: 'Haaland', position: 'FW' }
            ],
            substitutes: [
                { id: 'as1', name: 'Ortega', position: 'GK' },
                { id: 'as2', name: 'Akanji', position: 'DF' },
                { id: 'as3', name: 'Kovacic', position: 'MF' },
                { id: 'as4', name: 'Doku', position: 'FW' },
                { id: 'as5', name: 'Alvarez', position: 'FW' }
            ]
        },
        homePredictedLineup: {
            formation: '4-3-3',
            players: [
                { id: 'hp1', name: 'Alisson', position: 'GK' },
                { id: 'hp2', name: 'Alexander-Arnold', position: 'DF' },
                { id: 'hp3', name: 'Van Dijk', position: 'DF' },
                { id: 'hp4', name: 'Konate', position: 'DF' },
                { id: 'hp5', name: 'Robertson', position: 'DF' },
                { id: 'hp6', name: 'Mac Allister', position: 'MF' },
                { id: 'hp7', name: 'Szoboszlai', position: 'MF' },
                { id: 'hp8', name: 'Jones', position: 'MF' },
                { id: 'hp9', name: 'Salah', position: 'FW' },
                { id: 'hp10', name: 'Nunez', position: 'FW' },
                { id: 'hp11', name: 'Diaz', position: 'FW' }
            ]
        },
        awayPredictedLineup: {
            formation: '4-2-3-1',
            players: [
                { id: 'ap1', name: 'Ederson', position: 'GK' },
                { id: 'ap2', name: 'Walker', position: 'DF' },
                { id: 'ap3', name: 'Dias', position: 'DF' },
                { id: 'ap4', name: 'Stones', position: 'DF' },
                { id: 'ap5', name: 'Ake', position: 'DF' },
                { id: 'ap6', name: 'Rodri', position: 'MF' },
                { id: 'ap7', name: 'De Bruyne', position: 'MF' },
                { id: 'ap8', name: 'Bernardo', position: 'MF' },
                { id: 'ap9', name: 'Foden', position: 'MF' },
                { id: 'ap10', name: 'Grealish', position: 'FW' },
                { id: 'ap11', name: 'Haaland', position: 'FW' }
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
                <Group position="apart" align="center" spacing={0}>
                    <Box sx={{ flex: 1, textAlign: 'right', paddingRight: 40 }}>
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

                    <Box 
                        sx={(theme) => ({
                            textAlign: 'center',
                            padding: '0 40px',
                            borderLeft: `2px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                            borderRight: `2px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
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

                    <Box sx={{ flex: 1, textAlign: 'left', paddingLeft: 40 }}>
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
            <Paper p="xl" radius="lg" withBorder mb="xl">
                <Title order={3} size="h4" mb="xl" align="center">Team Lineups</Title>
                <Group align="flex-start" spacing={0} noWrap>
                    {/* Home Team */}
                    <Box sx={{ flex: 1, paddingRight: 40 }}>
                        <Title order={4} size="h5" mb="xl" align="center">
                            {matchDetails.homeTeam}
                        </Title>
                        {status === 'future' ? (
                            <>
                                {matchDetails.homePredictedLineup && (
                                    <FormationView 
                                        lineup={matchDetails.homePredictedLineup} 
                                        isPredicted 
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                {matchDetails.homeLineup && (
                                    <FormationView 
                                        lineup={matchDetails.homeLineup}
                                    />
                                )}
                            </>
                        )}
                        {matchDetails.homeLineup?.substitutes && status !== 'future' && (
                            <Box mt="xl">
                                <Text size="sm" weight={500} mb="xs" align="center">Substitutes</Text>
                                <Group position="center" spacing={8}>
                                    {matchDetails.homeLineup.substitutes.map((player) => (
                                        <Badge 
                                            key={player.id} 
                                            variant="dot" 
                                            color="gray"
                                            size="lg"
                                        >
                                            {player.name}
                                        </Badge>
                                    ))}
                                </Group>
                            </Box>
                        )}
                    </Box>

                    {/* Central Divider */}
                    <Box 
                        sx={(theme) => ({
                            width: 2,
                            alignSelf: 'stretch',
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
                            margin: '0 40px'
                        })}
                    />

                    {/* Away Team */}
                    <Box sx={{ flex: 1, paddingLeft: 40 }}>
                        <Title order={4} size="h5" mb="xl" align="center">
                            {matchDetails.awayTeam}
                        </Title>
                        {status === 'future' ? (
                            <>
                                {matchDetails.awayPredictedLineup && (
                                    <FormationView 
                                        lineup={matchDetails.awayPredictedLineup} 
                                        isPredicted 
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                {matchDetails.awayLineup && (
                                    <FormationView 
                                        lineup={matchDetails.awayLineup}
                                    />
                                )}
                            </>
                        )}
                        {matchDetails.awayLineup?.substitutes && status !== 'future' && (
                            <Box mt="xl">
                                <Text size="sm" weight={500} mb="xs" align="center">Substitutes</Text>
                                <Group position="center" spacing={8}>
                                    {matchDetails.awayLineup.substitutes.map((player) => (
                                        <Badge 
                                            key={player.id} 
                                            variant="dot" 
                                            color="gray"
                                            size="lg"
                                        >
                                            {player.name}
                                        </Badge>
                                    ))}
                                </Group>
                            </Box>
                        )}
                    </Box>
                </Group>
            </Paper>
        </Container>
    );
}
