import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Paper,
    Badge,
    Box,
    Text,
    Group,
    Button
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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    if (matchDate < todayStart) {
        return 'past';
    } else if (matchDate >= todayStart && matchDate < tomorrowStart) {
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
            {isPredicted ? (
                <Text color="dimmed" size="sm" mb="xs">
                    Predicted Lineup ({lineup.formation})
                </Text>
            ) : (
                <Text color="dimmed" size="sm" mb="xs">
                    Starting XI ({lineup.formation})
                </Text>
            )}

            <Box mb="md">
                <Group position="center">
                    {arranged.gk.map((player) => (
                        <Badge key={player.id} variant="outline" color="teal">{player.name}</Badge>
                    ))}
                </Group>
            </Box>

            <Box mb="md">
                <Group position="center" spacing="xl">
                    {arranged.defenders.map((player) => (
                        <Badge key={player.id} variant="outline" color="blue">{player.name}</Badge>
                    ))}
                </Group>
            </Box>

            <Box mb="md">
                <Group position="center" spacing="xl">
                    {arranged.midfielders.map((player) => (
                        <Badge key={player.id} variant="outline" color="yellow">{player.name}</Badge>
                    ))}
                </Group>
            </Box>

            <Box mb="md">
                <Group position="center" spacing="xl">
                    {arranged.forwards.map((player) => (
                        <Badge key={player.id} variant="outline" color="red">{player.name}</Badge>
                    ))}
                </Group>
            </Box>
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

    // For demonstration, we store lineups in code.
    const mockHomeLineup: Lineup = {/* ... */} as Lineup;
    const mockAwayLineup: Lineup = {/* ... */} as Lineup;
    const mockHomePredicted: Lineup = {/* ... */} as Lineup;
    const mockAwayPredicted: Lineup = {/* ... */} as Lineup;

    // Aggregated predictions from all users
    const [winPercent, setWinPercent] = useState(40);
    const [drawPercent, setDrawPercent] = useState(30);
    const [losePercent, setLosePercent] = useState(30);
    const [totalVotes, setTotalVotes] = useState(100);

    // Tracks if this user has predicted
    const [hasPredicted, setHasPredicted] = useState(false);

    // Mock match details
    const matchDetails: MatchDetails = location.state || {
        matchId: matchId || 'unknown',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        date: '2023-12-25T18:00:00',
        venue: 'Stadium X',
        homeLineup: mockHomeLineup,
        awayLineup: mockAwayLineup,
        homePredictedLineup: mockHomePredicted,
        awayPredictedLineup: mockAwayPredicted
    };

    const status = getMatchStatus(matchDetails.date);

    // Retrieve last 5 games form for each team
    const homeForm = getTeamForm(matchDetails.homeTeam);
    const awayForm = getTeamForm(matchDetails.awayTeam);

    function handlePrediction(result: 'win' | 'draw' | 'lose') {
        console.log(`User predicted a ${result}`);
        setHasPredicted(true);
        // Fake updating stats
        const newVotes = totalVotes + 1;
        setTotalVotes(newVotes);
        if (result === 'win') setWinPercent(Math.min(winPercent + 5, 100));
        if (result === 'draw') setDrawPercent(Math.min(drawPercent + 5, 100));
        if (result === 'lose') setLosePercent(Math.min(losePercent + 5, 100));
    }

    function handleViewTickets() {
        // Navigate to seat selection or ticket purchase page
        navigate(`/seat-selection/${matchDetails.matchId}`, {
            state: matchDetails, // pass match details if needed
        });
    }

    return (
        <Container size="md" my="xl">
            <Title order={2} mb="lg">
                {matchDetails.homeTeam} vs {matchDetails.awayTeam}
            </Title>
            <Text size="sm">{new Date(matchDetails.date).toLocaleString()}</Text>
            <Text size="sm" mb="lg">Venue: {matchDetails.venue}</Text>

            {/* Display last 5 games form for both teams */}
            <Group mb="lg" spacing="xl">
                <Group spacing="xs">
                    <Text weight={500}>{matchDetails.homeTeam} Form:</Text>
                    {homeForm.map((res, i) => (
                        <Badge
                            key={`${matchDetails.homeTeam}-form-${i}`}
                            color={res === 'W' ? 'green' : res === 'D' ? 'blue' : 'red'}
                            variant="filled"
                        >
                            {res}
                        </Badge>
                    ))}
                </Group>
                <Group spacing="xs">
                    <Text weight={500}>{matchDetails.awayTeam} Form:</Text>
                    {awayForm.map((res, i) => (
                        <Badge
                            key={`${matchDetails.awayTeam}-form-${i}`}
                            color={res === 'W' ? 'green' : res === 'D' ? 'blue' : 'red'}
                            variant="filled"
                        >
                            {res}
                        </Badge>
                    ))}
                </Group>
            </Group>

            {/* Display lineups or predicted lineups */}
            <Group grow align="start" mb="lg">
                <Paper shadow="sm" radius="md" p="md" withBorder>
                    <Title order={4} mb="md">{matchDetails.homeTeam}</Title>
                    {status === 'future' && matchDetails.homePredictedLineup
                        ? <FormationView lineup={matchDetails.homePredictedLineup} isPredicted />
                        : matchDetails.homeLineup && <FormationView lineup={matchDetails.homeLineup} />}
                </Paper>

                <Paper shadow="sm" radius="md" p="md" withBorder>
                    <Title order={4} mb="md">{matchDetails.awayTeam}</Title>
                    {status === 'future' && matchDetails.awayPredictedLineup
                        ? <FormationView lineup={matchDetails.awayPredictedLineup} isPredicted />
                        : matchDetails.awayLineup && <FormationView lineup={matchDetails.awayLineup} />}
                </Paper>
            </Group>

            {status === 'future' && (
                <>
                    <Group spacing="md" mb="md">
                        <Button variant="outline" onClick={handleViewTickets}>
                            View Tickets
                        </Button>
                    </Group>

                    {!hasPredicted ? (
                        // Show prediction buttons
                        <Group spacing="md">
                            <Text weight={500}>Your Prediction:</Text>
                            <Button variant="outline" onClick={() => handlePrediction('win')}>Win</Button>
                            <Button variant="outline" onClick={() => handlePrediction('draw')}>Draw</Button>
                            <Button variant="outline" onClick={() => handlePrediction('lose')}>Lose</Button>
                        </Group>
                    ) : (
                        // User has predicted; show aggregated results
                        <Group spacing="md">
                            <Text weight={500}>Community Predictions:</Text>
                            <Badge color="green" variant="filled">Win: {winPercent}%</Badge>
                            <Badge color="blue" variant="filled">Draw: {drawPercent}%</Badge>
                            <Badge color="red" variant="filled">Lose: {losePercent}%</Badge>
                            <Text size="sm">Total Votes: {totalVotes}</Text>
                        </Group>
                    )}
                </>
            )}
        </Container>
    );
}
