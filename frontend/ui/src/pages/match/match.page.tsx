import { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Title,
    Paper,
    Badge,
    Box,
    Text,
    Group,
    Button,
    SimpleGrid,
    Stack,
    Image,
} from '@mantine/core';
import { useLocation, useParams } from 'react-router-dom';
import { usePageTransition } from '../../hooks/usePageTransition';
import { ModernButton } from '../../components/modern';
import { ScorePredictionCard } from '../../components/predictions';
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
    competition?: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
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
    const { navigateWithTransition } = usePageTransition();

    // Mock match data
    const mockMatchDetails: MatchDetails = {
        matchId: matchId || '1',
        homeTeam: 'Liverpool',
        awayTeam: 'Manchester City',
        date: '2025-01-24T15:00:00Z', // Set to tomorrow for testing
        venue: 'Anfield',
        competition: 'Premier League',
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
                { id: 'a10', name: 'Grealish', number: 10, position: 'MF' },
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
                { id: 'ap10', name: 'Grealish', number: 10, position: 'MF' },
                { id: 'ap11', name: 'Haaland', number: 9, position: 'FW' }
            ]
        }
    };


    const [matchDetails, setMatchDetails] = useState<MatchDetails>(mockMatchDetails);
    const status = getMatchStatus(matchDetails.date);

    // Retrieve last 5 games form for each team
    const homeForm = useMemo(() => getTeamForm(matchDetails.homeTeam), [matchDetails.homeTeam]);
    const awayForm = useMemo(() => getTeamForm(matchDetails.awayTeam), [matchDetails.awayTeam]);



    function handleViewTickets() {
        // Navigate to seat selection or ticket purchase page
        navigateWithTransition(`/seat-selection/${matchDetails.matchId}`, { 
            transitionType: 'loading', 
            duration: 1200,
            state: {
                homeTeam: matchDetails.homeTeam,
                awayTeam: matchDetails.awayTeam,
                homeTeamLogo: matchDetails.homeTeamLogo,
                awayTeamLogo: matchDetails.awayTeamLogo,
                date: matchDetails.date,
                venue: matchDetails.venue,
                competition: matchDetails.competition,
            }
        });
    }

    return (
        <Container size="xl" py={{ base: 'md', sm: 'xl' }} px={{ base: 'xs', sm: 'md' }}>
            {/* Match Header */}
            <Paper 
                p={{ base: 'md', sm: 'xl' }}
                mb={{ base: 'md', sm: 'xl' }}
                style={{ 
                    backgroundColor: 'var(--modern-dark-gray)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background decorative elements */}
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '200px',
                        height: '200px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
                        borderRadius: '0 0 100% 0',
                    }}
                />
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '200px',
                        height: '200px',
                        background: 'linear-gradient(225deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
                        borderRadius: '0 0 0 100%',
                    }}
                />

                <Stack spacing={{ base: 'md', sm: 'lg' }} align="center" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Competition/Event Badge */}
                    <Badge
                        size={{ base: 'md', sm: 'lg' }}
                        variant="outline"
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            backgroundColor: 'transparent',
                            color: 'var(--modern-white)',
                            padding: '0.5rem 1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600,
                        }}
                    >
                        {matchDetails.competition || 'Match'}
                    </Badge>

                    {/* Date and Time */}
                    <Stack spacing={4} align="center">
                        <Text
                            size="xl"
                            weight={900}
                            style={{
                                color: 'var(--modern-white)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                            }}
                        >
                            {new Date(matchDetails.date).toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                            }).toUpperCase()}
                        </Text>
                        <Text
                            size="md"
                            weight={600}
                            style={{
                                color: 'var(--modern-white)',
                                fontSize: '1.25rem',
                            }}
                        >
                            {new Date(matchDetails.date).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })}
                        </Text>
                    </Stack>

                    {/* Teams */}
                    <Group 
                        position="apart" 
                        style={{ width: '100%', maxWidth: '700px' }} 
                        align="flex-end"
                        wrap="nowrap"
                        gap={{ base: 'xs', sm: 'md' }}
                    >
                        {/* Home Team */}
                        <Stack spacing="sm" align="center" style={{ flex: 1, minWidth: 0 }}>
                            <Box
                                style={{
                                    width: 'clamp(50px, 12vw, 80px)',
                                    height: 'clamp(50px, 12vw, 80px)',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--modern-black)',
                                }}
                            >
                                <Image
                                    src={matchDetails.homeTeamLogo || 'https://via.placeholder.com/70'}
                                    width="clamp(40px, 10vw, 70px)"
                                    height="clamp(40px, 10vw, 70px)"
                                    fit="contain"
                                    style={{ borderRadius: '50%' }}
                                />
                            </Box>
                            <Text
                                size={{ base: 'xs', sm: 'md' }}
                                fw={700}
                                style={{
                                    color: 'var(--modern-white)',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {matchDetails.homeTeam}
                            </Text>
                            <Group spacing={4} gap={4}>
                                {homeForm.map((result, i) => (
                                    <Badge
                                        key={i}
                                        size="xs"
                                        style={{
                                            backgroundColor:
                                                result === 'W'
                                                    ? '#00ff88'
                                                    : result === 'D'
                                                    ? '#ffaa00'
                                                    : '#ff4444',
                                            color: 'var(--modern-black)',
                                            fontWeight: 700,
                                            minWidth: '20px',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        {result}
                                    </Badge>
                                ))}
                            </Group>
                        </Stack>

                        {/* Center VS block */}
                        <Stack spacing="xs" align="center" style={{ padding: '0 clamp(0.5rem, 2vw, 1.5rem)' }}>
                            <Text
                                size={{ base: 'md', sm: 'xl' }}
                                fw={900}
                                style={{
                                    color: 'var(--modern-lime)',
                                }}
                            >
                                VS
                            </Text>
                            <ModernButton
                                variant="primary"
                                size={{ base: 'xs', sm: 'sm' }}
                                onClick={handleViewTickets}
                            >
                                View Tickets
                            </ModernButton>
                        </Stack>

                        {/* Away Team */}
                        <Stack spacing="sm" align="center" style={{ flex: 1, minWidth: 0 }}>
                            <Box
                                style={{
                                    width: 'clamp(50px, 12vw, 80px)',
                                    height: 'clamp(50px, 12vw, 80px)',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--modern-black)',
                                }}
                            >
                                <Image
                                    src={matchDetails.awayTeamLogo || 'https://via.placeholder.com/70'}
                                    width="clamp(40px, 10vw, 70px)"
                                    height="clamp(40px, 10vw, 70px)"
                                    fit="contain"
                                    style={{ borderRadius: '50%' }}
                                />
                            </Box>
                            <Text
                                size={{ base: 'xs', sm: 'md' }}
                                fw={700}
                                style={{
                                    color: 'var(--modern-white)',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {matchDetails.awayTeam}
                            </Text>
                            <Group spacing={4} gap={4}>
                                {awayForm.map((result, i) => (
                                    <Badge
                                        key={i}
                                        size="xs"
                                        style={{
                                            backgroundColor:
                                                result === 'W'
                                                    ? '#00ff88'
                                                    : result === 'D'
                                                    ? '#ffaa00'
                                                    : '#ff4444',
                                            color: 'var(--modern-black)',
                                            fontWeight: 700,
                                            minWidth: '20px',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        {result}
                                    </Badge>
                                ))}
                            </Group>
                        </Stack>
                    </Group>

                    {/* Venue */}
                    <Text
                        size="sm"
                        style={{
                            color: 'var(--modern-gray)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        {matchDetails.venue}
                    </Text>
                </Stack>
            </Paper>


            {/* Score Prediction Section */}
            <ScorePredictionCard
                homeTeam={matchDetails.homeTeam}
                awayTeam={matchDetails.awayTeam}
                date={matchDetails.date}
            />

            {/* Team Lineups */}
                <TeamLineups matchDetails={matchDetails} status={status} />
        </Container>
    );
}
