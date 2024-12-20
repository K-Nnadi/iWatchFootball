import {useLocation, useParams} from 'react-router-dom';
import {Badge, Box, Container, Group, Paper, Text, Title} from '@mantine/core';

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
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    if (matchDate < todayStart) {
        return 'past';
    } else if (matchDate >= todayStart && matchDate < tomorrowStart) {
        return 'today';
    } else {
        return 'future';
    }
}

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

export function MatchPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const location = useLocation();

    // Fully defined mock lineups
    const mockHomeLineup: Lineup = {
        formation: '4-3-3',
        players: [
            { id: 'h-gk', name: 'Home GK', position: 'GK' },
            { id: 'h-df1', name: 'Home DF1', position: 'DF' },
            { id: 'h-df2', name: 'Home DF2', position: 'DF' },
            { id: 'h-df3', name: 'Home DF3', position: 'DF' },
            { id: 'h-df4', name: 'Home DF4', position: 'DF' },
            { id: 'h-mf1', name: 'Home MF1', position: 'MF' },
            { id: 'h-mf2', name: 'Home MF2', position: 'MF' },
            { id: 'h-mf3', name: 'Home MF3', position: 'MF' },
            { id: 'h-fw1', name: 'Home FW1', position: 'FW' },
            { id: 'h-fw2', name: 'Home FW2', position: 'FW' },
            { id: 'h-fw3', name: 'Home FW3', position: 'FW' },
        ],
    };

    const mockAwayLineup: Lineup = {
        formation: '4-3-3',
        players: [
            { id: 'a-gk', name: 'Away GK', position: 'GK' },
            { id: 'a-df1', name: 'Away DF1', position: 'DF' },
            { id: 'a-df2', name: 'Away DF2', position: 'DF' },
            { id: 'a-df3', name: 'Away DF3', position: 'DF' },
            { id: 'a-df4', name: 'Away DF4', position: 'DF' },
            { id: 'a-mf1', name: 'Away MF1', position: 'MF' },
            { id: 'a-mf2', name: 'Away MF2', position: 'MF' },
            { id: 'a-mf3', name: 'Away MF3', position: 'MF' },
            { id: 'a-fw1', name: 'Away FW1', position: 'FW' },
            { id: 'a-fw2', name: 'Away FW2', position: 'FW' },
            { id: 'a-fw3', name: 'Away FW3', position: 'FW' },
        ],
    };

    const mockHomePredicted: Lineup = {
        formation: '4-3-3',
        players: [
            { id: 'ph-gk', name: 'Pred Home GK', position: 'GK' },
            { id: 'ph-df1', name: 'Pred Home DF1', position: 'DF' },
            { id: 'ph-df2', name: 'Pred Home DF2', position: 'DF' },
            { id: 'ph-df3', name: 'Pred Home DF3', position: 'DF' },
            { id: 'ph-df4', name: 'Pred Home DF4', position: 'DF' },
            { id: 'ph-mf1', name: 'Pred Home MF1', position: 'MF' },
            { id: 'ph-mf2', name: 'Pred Home MF2', position: 'MF' },
            { id: 'ph-mf3', name: 'Pred Home MF3', position: 'MF' },
            { id: 'ph-fw1', name: 'Pred Home FW1', position: 'FW' },
            { id: 'ph-fw2', name: 'Pred Home FW2', position: 'FW' },
            { id: 'ph-fw3', name: 'Pred Home FW3', position: 'FW' },
        ],
    };

    const mockAwayPredicted: Lineup = {
        formation: '4-3-3',
        players: [
            { id: 'pa-gk', name: 'Pred Away GK', position: 'GK' },
            { id: 'pa-df1', name: 'Pred Away DF1', position: 'DF' },
            { id: 'pa-df2', name: 'Pred Away DF2', position: 'DF' },
            { id: 'pa-df3', name: 'Pred Away DF3', position: 'DF' },
            { id: 'pa-df4', name: 'Pred Away DF4', position: 'DF' },
            { id: 'pa-mf1', name: 'Pred Away MF1', position: 'MF' },
            { id: 'pa-mf2', name: 'Pred Away MF2', position: 'MF' },
            { id: 'pa-mf3', name: 'Pred Away MF3', position: 'MF' },
            { id: 'pa-fw1', name: 'Pred Away FW1', position: 'FW' },
            { id: 'pa-fw2', name: 'Pred Away FW2', position: 'FW' },
            { id: 'pa-fw3', name: 'Pred Away FW3', position: 'FW' },
        ],
    };

    // Mock match details with full arrays
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

    console.log('MatchDetails:', matchDetails);
    console.log('Status:', status);

    return (
        <Container size="md" my="xl">
            <Title order={2} mb="lg">
                {matchDetails.homeTeam} vs {matchDetails.awayTeam}
            </Title>
            <Text size="sm">{new Date(matchDetails.date).toLocaleString()}</Text>
            <Text size="sm" mb="lg">Venue: {matchDetails.venue}</Text>

            <Group grow align="start">
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
        </Container>
    );
}
