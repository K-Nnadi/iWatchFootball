import {useState, useMemo} from 'react';
import {
    Container,
    Title,
    Paper,
    Badge,
    Box,
    Text,
    Group,
    SimpleGrid,
    Stack,
    Image,
    useMantineTheme,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {useParams} from 'react-router-dom';
import {usePageTransition} from '../../hooks/usePageTransition';
import {ModernButton} from '../../components/modern';
import {ScorePredictionCard} from '../../components/predictions';
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
    homeTeamId?: number;
    awayTeamId?: number;
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
function getTeamForm(): ('W' | 'D' | 'L')[] {
    const outcomes = ['W', 'D', 'L'];
    const form: ('W' | 'D' | 'L')[] = [];
    for (let i = 0; i < 5; i++) {
        const rand = Math.floor(Math.random() * outcomes.length);
        form.push(outcomes[rand] as 'W' | 'D' | 'L');
    }
    return form;
}

export function MatchPage() {
    const {matchId} = useParams<{ matchId: string }>();
    const {navigateWithTransition} = usePageTransition();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

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


    function handleViewTickets() {
        // Navigate to seat selection or ticket purchase page
        navigateWithTransition(`/seat-selection/${matchDetails.matchId}`, {
            transitionType: 'loading',
            duration: 1200,
            state: {
                homeTeam: matchDetails.homeTeam,
                awayTeam: matchDetails.awayTeam,
                homeTeamId: matchDetails.homeTeamId,
                awayTeamId: matchDetails.awayTeamId,
                homeTeamLogo: matchDetails.homeTeamLogo,
                awayTeamLogo: matchDetails.awayTeamLogo,
                date: matchDetails.date,
                venue: matchDetails.venue,
                competition: matchDetails.competition,
            }
        });
    }

    return (
        <>
            {/* Match Header Section */}
            <Box
                py={{ base: '3rem', md: '6rem' }}
                style={{
                    backgroundColor: 'var(--modern-bg-primary)',
                    color: 'var(--modern-text-primary)',
                    position: 'relative',
                    overflowX: 'hidden',
                    ...(!isMobile && {
                        width: '100vw',
                        marginLeft: 'calc(50% - 50vw)',
                        marginRight: 'calc(50% - 50vw)',
                    }),
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
                    <Paper
                        p={{base: 'md', sm: 'xl'}}
                        style={{
                            backgroundColor: 'var(--modern-card-bg)',
                            border: '1px solid var(--modern-border-color)',
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

                        <Stack gap="lg" align="center" style={{position: 'relative', zIndex: 1}}>
                    {/* Competition/Event Badge */}
                    <Badge
                        size="lg"
                        variant="outline"
                        style={{
                            borderColor: 'var(--modern-border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--modern-text-primary)',
                            padding: '0.5rem 1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600,
                        }}
                    >
                        {matchDetails.competition || 'Match'}
                    </Badge>

                    {/* Date and Time */}
                    <Stack gap={4} align="center">
                        <Text
                            size="xl"
                            fw={900}
                            style={{
                                color: 'var(--modern-text-primary)',
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
                            fw={600}
                            style={{
                                color: 'var(--modern-text-primary)',
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
                        justify="space-between"
                        style={{width: '100%', maxWidth: '700px'}}
                        align="flex-end"
                        wrap={isMobile ? 'wrap' : 'nowrap'}
                        gap="md"
                    >
                        {/* Home Team */}
                        <Stack 
                            gap="sm" 
                            align="center" 
                            style={{
                                flex: isMobile ? '0 0 100%' : 1,
                                minWidth: 0,
                                width: isMobile ? '100%' : 'auto',
                                order: 1,
                            }}
                        >
                            <Box
                                onClick={() => matchDetails.homeTeamId && navigateWithTransition(`/team/${matchDetails.homeTeamId}`)}
                                style={{
                                    width: 'clamp(60px, 15vw, 80px)',
                                    height: 'clamp(60px, 15vw, 80px)',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid var(--modern-border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--modern-bg-secondary)',
                                    cursor: matchDetails.homeTeamId ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (matchDetails.homeTeamId) {
                                        e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (matchDetails.homeTeamId) {
                                        e.currentTarget.style.borderColor = 'var(--modern-border-color)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }
                                }}
                            >
                                <Image
                                    src={matchDetails.homeTeamLogo || 'https://via.placeholder.com/70'}
                                    width="clamp(50px, 12vw, 70px)"
                                    height="clamp(50px, 12vw, 70px)"
                                    fit="contain"
                                    style={{borderRadius: '50%'}}
                                />
                            </Box>
                            <Text
                                size="md"
                                fw={700}
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                                }}
                            >
                                {matchDetails.homeTeam}
                            </Text>

                        </Stack>

                        {/* Center VS block */}
                        <Stack 
                            gap="xs" 
                            align="center" 
                            style={{
                                padding: '0 clamp(0.5rem, 2vw, 1.5rem)',
                                width: isMobile ? '100%' : 'auto',
                                order: isMobile ? 3 : 2,
                            }}
                        >
                            <Text
                                size="xl"
                                fw={900}
                                style={{
                                    color: 'var(--modern-lime)',
                                    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
                                }}
                            >
                                VS
                            </Text>
                            <ModernButton
                                variant="primary"
                                size={isMobile ? 'md' : 'sm'}
                                onClick={handleViewTickets}
                                style={{
                                    width: isMobile ? '100%' : 'auto',
                                    maxWidth: isMobile ? '300px' : 'none',
                                }}
                            >
                                View Tickets
                            </ModernButton>
                        </Stack>

                        {/* Away Team */}
                        <Stack 
                            gap="sm" 
                            align="center" 
                            style={{
                                flex: isMobile ? '0 0 100%' : 1,
                                minWidth: 0,
                                width: isMobile ? '100%' : 'auto',
                                order: isMobile ? 2 : 3,
                            }}
                        >
                            <Box
                                onClick={() => matchDetails.awayTeamId && navigateWithTransition(`/team/${matchDetails.awayTeamId}`)}
                                style={{
                                    width: 'clamp(60px, 15vw, 80px)',
                                    height: 'clamp(60px, 15vw, 80px)',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid var(--modern-border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--modern-bg-secondary)',
                                    cursor: matchDetails.awayTeamId ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (matchDetails.awayTeamId) {
                                        e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (matchDetails.awayTeamId) {
                                        e.currentTarget.style.borderColor = 'var(--modern-border-color)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }
                                }}
                            >
                                <Image
                                    src={matchDetails.awayTeamLogo || 'https://via.placeholder.com/70'}
                                    width="clamp(50px, 12vw, 70px)"
                                    height="clamp(50px, 12vw, 70px)"
                                    fit="contain"
                                    style={{borderRadius: '50%'}}
                                />
                            </Box>
                            <Text
                                size="md"
                                fw={700}
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                                }}
                            >
                                {matchDetails.awayTeam}
                            </Text>

                        </Stack>
                    </Group>

                    {/* Venue */}
                    <Text
                        size="sm"
                        style={{
                            color: 'var(--modern-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        {matchDetails.venue}
                    </Text>
                </Stack>
                    </Paper>
                </Container>
            </Box>

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
                        <Paper
                            p={{ base: 'md', sm: 'xl' }}
                            radius="lg"
                            withBorder
                            style={{ backgroundColor: 'var(--modern-card-bg)', border: '1px solid var(--modern-border-color)' }}
                        >
                            <Title
                                order={3}
                                mb="xl"
                                ta="center"
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                                }}
                            >
                                Form
                            </Title>
                            
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                {/* Home Team Form */}
                                <Stack gap="md" align="center">
                                    <Group gap="sm" align="center" justify="center" wrap="nowrap">
                                        {matchDetails.homeTeamLogo && (
                                            <Image
                                                src={matchDetails.homeTeamLogo}
                                                width={24}
                                                height={24}
                                                fit="contain"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        )}
                                        <Text
                                            size="sm"
                                            fw={600}
                                            style={{
                                                color: 'var(--modern-text-primary)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {matchDetails.homeTeam}
                                        </Text>
                                    </Group>
                                    <Group gap={6} justify="center" wrap="nowrap">
                                        {homeForm.map((result, i) => (
                                            <Box
                                                key={i}
                                                style={{
                                                    width: 'clamp(32px, 6vw, 40px)',
                                                    height: 'clamp(32px, 6vw, 40px)',
                                                    borderRadius: '50%',
                                                    backgroundColor:
                                                        result === 'W'
                                                            ? '#00ff88'
                                                            : result === 'D'
                                                                ? '#ffaa00'
                                                                : '#ff4444',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px solid var(--modern-border-color)',
                                                    boxShadow: '0 2px 8px var(--modern-shadow-color)',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px var(--modern-shadow-color)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px var(--modern-shadow-color)';
                                                }}
                                            >
                                                <Text
                                                    fw={900}
                                                    style={{
                                                        color: 'var(--modern-bg-primary)',
                                                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {result}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Group>
                                </Stack>

                                {/* Away Team Form */}
                                <Stack gap="md" align="center">
                                    <Group gap="sm" align="center" justify="center" wrap="nowrap">
                                        {matchDetails.awayTeamLogo && (
                                            <Image
                                                src={matchDetails.awayTeamLogo}
                                                width={24}
                                                height={24}
                                                fit="contain"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        )}
                                        <Text
                                            size="sm"
                                            fw={600}
                                            style={{
                                                color: 'var(--modern-text-primary)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {matchDetails.awayTeam}
                                        </Text>
                                    </Group>
                                    <Group gap={6} justify="center" wrap="nowrap">
                                        {awayForm.map((result, i) => (
                                            <Box
                                                key={i}
                                                style={{
                                                    width: 'clamp(32px, 6vw, 40px)',
                                                    height: 'clamp(32px, 6vw, 40px)',
                                                    borderRadius: '50%',
                                                    backgroundColor:
                                                        result === 'W'
                                                            ? '#00ff88'
                                                            : result === 'D'
                                                                ? '#ffaa00'
                                                                : '#ff4444',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px solid var(--modern-border-color)',
                                                    boxShadow: '0 2px 8px var(--modern-shadow-color)',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px var(--modern-shadow-color)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px var(--modern-shadow-color)';
                                                }}
                                            >
                                                <Text
                                                    fw={900}
                                                    style={{
                                                        color: 'var(--modern-bg-primary)',
                                                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {result}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Group>
                                </Stack>
                            </SimpleGrid>
                        </Paper>

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
