import { Box, Container, Paper, Badge, Text, Group, Stack, Image, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { usePageTransition } from '../../hooks/usePageTransition';
import { ModernButton } from '../modern';
import { type MatchDetails } from './types';

export interface MatchHeaderProps {
    matchDetails: MatchDetails;
    showViewTicketsButton?: boolean;
    onViewTickets?: () => void;
    variant?: 'full-width' | 'compact';
}

export function MatchHeader({ 
    matchDetails, 
    showViewTicketsButton = false, 
    onViewTickets,
    variant = 'full-width'
}: MatchHeaderProps) {
    const { navigateWithTransition } = usePageTransition();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

    const handleViewTickets = () => {
        if (onViewTickets) {
            onViewTickets();
        } else {
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
    };

    const content = (
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
            <Paper
                p={{ base: 'md', sm: 'xl' }}
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

                <Stack gap="lg" align="center" style={{ position: 'relative', zIndex: 1 }}>
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
                        style={{ width: '100%', maxWidth: '700px' }}
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
                                    style={{ borderRadius: '50%' }}
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
                            {showViewTicketsButton && (
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
                            )}
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
                                    style={{ borderRadius: '50%' }}
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
    );

    if (variant === 'full-width') {
        return (
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
                {content}
            </Box>
        );
    }

    return content;
}

