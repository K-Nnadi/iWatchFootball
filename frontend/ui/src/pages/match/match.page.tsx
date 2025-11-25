import {useState, useMemo} from 'react';
import {
    Container,
    Box,
    Stack,
} from '@mantine/core';
import {useParams} from 'react-router-dom';
import {ScorePredictionCard} from '../../components/predictions';
import {MatchHeader, TeamFormSection, type MatchDetails} from '../../components/match';
import TeamLineups from "./teamLineup";

// Re-export types for backward compatibility
export type { MatchDetails, Player, Lineup } from '../../components/match';

/** Mock function returning last 5 games form for a team. (W, D, L) */
function getTeamForm(): ('W' | 'D' | 'L')[] {
    const outcomes = ['W', 'D', 'L'];
    const form: ('W' | 'D' | 'L')[] = [];
    for (let i = 0; i < 5; i++) {
        const rand = Math.floor(Math.random() * outcomes.length);
        form.push(outcomes[rand] as 'W' | 'D' | 'L');
    }
    return form;
}

export function getMatchStatus(matchDateStr: string): 'past' | 'today' | 'future' {
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

export function MatchPage() {
    const {matchId} = useParams<{ matchId: string }>();

    // Mock match data
    const mockMatchDetails: MatchDetails = {
        matchId: matchId || '1',
        homeTeam: 'Liverpool',
        awayTeam: 'Manchester City',
        homeTeamId: 1,
        awayTeamId: 2,
        date: '2025-01-24T15:00:00Z', // Set to tomorrow for testing
        venue: 'Anfield',
        competition: 'Premier League',
        homeTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
        awayTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
        homeLineup: {
            formation: '4-3-3',
            players: [
                {id: 'h1', name: 'Alisson', number: 1, position: 'GK'},
                {id: 'h2', name: 'Alexander-Arnold', number: 66, position: 'DF'},
                {id: 'h3', name: 'Van Dijk', number: 4, position: 'DF'},
                {id: 'h4', name: 'Konate', number: 5, position: 'DF'},
                {id: 'h5', name: 'Robertson', number: 26, position: 'DF'},
                {id: 'h6', name: 'Mac Allister', number: 7, position: 'MF'},
                {id: 'h7', name: 'Szoboszlai', number: 8, position: 'MF'},
                {id: 'h8', name: 'Jones', number: 17, position: 'MF'},
                {id: 'h9', name: 'Salah', number: 11, position: 'FW'},
                {id: 'h10', name: 'Nunez', number: 27, position: 'FW'},
                {id: 'h11', name: 'Diaz', number: 23, position: 'FW'}
            ],
            substitutes: [
                {id: 'hs1', name: 'Kelleher', number: 62, position: 'GK'},
                {id: 'hs2', name: 'Gomez', number: 12, position: 'DF'},
                {id: 'hs3', name: 'Endo', number: 6, position: 'MF'},
                {id: 'hs4', name: 'Elliott', number: 67, position: 'MF'},
                {id: 'hs5', name: 'Gakpo', number: 18, position: 'FW'}
            ]
        },
        awayLineup: {
            formation: '4-2-3-1',
            players: [
                {id: 'a1', name: 'Ederson', number: 31, position: 'GK'},
                {id: 'a2', name: 'Walker', number: 2, position: 'DF'},
                {id: 'a3', name: 'Dias', number: 3, position: 'DF'},
                {id: 'a4', name: 'Stones', number: 5, position: 'DF'},
                {id: 'a5', name: 'Ake', number: 6, position: 'DF'},
                {id: 'a6', name: 'Rodri', number: 16, position: 'MF'},
                {id: 'a7', name: 'De Bruyne', number: 17, position: 'MF'},
                {id: 'a8', name: 'Bernardo', number: 20, position: 'MF'},
                {id: 'a9', name: 'Foden', number: 47, position: 'MF'},
                {id: 'a10', name: 'Grealish', number: 10, position: 'MF'},
                {id: 'a11', name: 'Haaland', number: 9, position: 'FW'}
            ],
            substitutes: [
                {id: 'as1', name: 'Ortega', number: 33, position: 'GK'},
                {id: 'as2', name: 'Akanji', number: 25, position: 'DF'},
                {id: 'as3', name: 'Kovacic', number: 8, position: 'MF'},
                {id: 'as4', name: 'Doku', number: 11, position: 'FW'},
                {id: 'as5', name: 'Alvarez', number: 15, position: 'FW'}
            ]
        },
        homePredictedLineup: {
            formation: '4-3-3',
            players: [
                {id: 'hp1', name: 'Alisson', number: 1, position: 'GK'},
                {id: 'hp2', name: 'Alexander-Arnold', number: 66, position: 'DF'},
                {id: 'hp3', name: 'Van Dijk', number: 4, position: 'DF'},
                {id: 'hp4', name: 'Konate', number: 5, position: 'DF'},
                {id: 'hp5', name: 'Robertson', number: 26, position: 'DF'},
                {id: 'hp6', name: 'Mac Allister', number: 7, position: 'MF'},
                {id: 'hp7', name: 'Szoboszlai', number: 8, position: 'MF'},
                {id: 'hp8', name: 'Jones', number: 17, position: 'MF'},
                {id: 'hp9', name: 'Salah', number: 11, position: 'FW'},
                {id: 'hp10', name: 'Nunez', number: 27, position: 'FW'},
                {id: 'hp11', name: 'Diaz', number: 23, position: 'FW'}
            ]
        },
        awayPredictedLineup: {
            formation: '4-2-3-1',
            players: [
                {id: 'ap1', name: 'Ederson', number: 31, position: 'GK'},
                {id: 'ap2', name: 'Walker', number: 2, position: 'DF'},
                {id: 'ap3', name: 'Dias', number: 3, position: 'DF'},
                {id: 'ap4', name: 'Stones', number: 5, position: 'DF'},
                {id: 'ap5', name: 'Ake', number: 6, position: 'DF'},
                {id: 'ap6', name: 'Rodri', number: 16, position: 'MF'},
                {id: 'ap7', name: 'De Bruyne', number: 17, position: 'MF'},
                {id: 'ap8', name: 'Bernardo', number: 20, position: 'MF'},
                {id: 'ap9', name: 'Foden', number: 47, position: 'MF'},
                {id: 'ap10', name: 'Grealish', number: 10, position: 'MF'},
                {id: 'ap11', name: 'Haaland', number: 9, position: 'FW'}
            ]
        }
    };


    const [matchDetails] = useState<MatchDetails>(mockMatchDetails);
    const status = getMatchStatus(matchDetails.date);

    // Retrieve last 5 games form for each team
    const homeForm = useMemo(() => getTeamForm(), []);
    const awayForm = useMemo(() => getTeamForm(), []);

    return (
        <>
            {/* Match Header Section */}
            <MatchHeader 
                matchDetails={matchDetails} 
                showViewTicketsButton={true}
                variant="full-width"
            />

            {/* Form & Prediction Section */}
            <Box
                py={{ base: '3rem', md: '6rem' }}
                px={{ base: 'md', md: 0 }}
                style={{
                    backgroundColor: 'var(--modern-bg-secondary)',
                    color: 'var(--modern-text-primary)',
                    borderTop: '1px solid var(--modern-section-divider)',
                    borderBottom: '1px solid var(--modern-section-divider)',
                    position: 'relative',
                    overflowX: 'hidden',
                }}
            >
                {/* Subtle Background Pattern */}
                <Box
                    className="section-background-pattern"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
                    <Stack gap="xl">
                        {/* Form Section */}
                        <TeamFormSection homeForm={homeForm} awayForm={awayForm} />

                        {/* Score Prediction Section */}
                        <ScorePredictionCard
                            homeTeam={matchDetails.homeTeam}
                            awayTeam={matchDetails.awayTeam}
                            date={matchDetails.date}
                        />
                    </Stack>
                </Container>
            </Box>

            {/* Team Lineups Section */}
            <Box
                py={{ base: '3rem', md: '6rem' }}
                px={{ base: 'md', md: 0 }}
                style={{
                    backgroundColor: 'var(--modern-bg-secondary)',
                    color: 'var(--modern-text-primary)',
                    borderTop: '1px solid var(--modern-section-divider)',
                    position: 'relative',
                    overflowX: 'hidden',
                }}
            >
                {/* Subtle Background Pattern */}
                <Box
                    className="section-background-pattern"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
                    <TeamLineups matchDetails={matchDetails} status={status}/>
                </Container>
            </Box>
        </>
    );
}
