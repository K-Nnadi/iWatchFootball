import React from 'react';
import { Box, Paper, Stack, Group, Text, Badge, Image, useMantineColorScheme } from '@mantine/core';
import { usePageTransition } from '../../hooks/usePageTransition';

export interface MatchDetails {
    homeTeam: string;
    awayTeam: string;
    homeTeamId?: number;
    awayTeamId?: number;
    homeTeamLogo: string;
    awayTeamLogo: string;
    date: string;
    venue: string;
    competition?: string;
    stadiumId?: number;
    stadiumMetadata?: unknown;
}

interface MatchHeaderProps {
    matchDetails: MatchDetails;
}

export function MatchHeader({ matchDetails }: MatchHeaderProps) {
    const { navigateWithTransition } = usePageTransition();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).toUpperCase();
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const handleTeamClick = (teamId?: number) => {
        if (teamId) {
            navigateWithTransition(`/team/${teamId}`);
        }
    };

    return (
        <Paper
            p="xl"
            mb="lg"
            style={{
                backgroundColor: isDark ? 'var(--modern-dark-gray)' : 'var(--modern-card-bg)',
                border: isDark 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid var(--modern-border-color)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
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
                    background: isDark 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)'
                        : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, transparent 100%)',
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
                    background: isDark 
                        ? 'linear-gradient(225deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)'
                        : 'linear-gradient(225deg, rgba(0, 0, 0, 0.02) 0%, transparent 100%)',
                    borderRadius: '0 0 0 100%',
                }}
            />

            <Stack gap="lg" align="center" style={{ position: 'relative', zIndex: 1 }}>
                {/* Competition/Event Badge */}
                {matchDetails.competition && (
                    <Badge
                        size="lg"
                        variant="outline"
                        style={{
                            borderColor: isDark 
                                ? 'rgba(255, 255, 255, 0.3)' 
                                : 'var(--modern-border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--modern-text-primary)',
                            padding: '0.5rem 1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600,
                        }}
                    >
                        {matchDetails.competition}
                    </Badge>
                )}

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
                        {formatDate(matchDetails.date)}
                    </Text>
                    <Text
                        size="md"
                        fw={600}
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    fontSize: '1.25rem',
                                }}
                    >
                        {formatTime(matchDetails.date)}
                    </Text>
                </Stack>

                {/* Teams */}
                <Group justify="space-between" style={{ width: '100%', maxWidth: '600px' }} align="flex-end">
                    {/* Home Team */}
                    <Stack gap="sm" align="center" style={{ flex: 1 }}>
                        <Box
                            onClick={() => handleTeamClick(matchDetails.homeTeamId)}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: isDark 
                                            ? '2px solid rgba(255, 255, 255, 0.2)' 
                                            : '2px solid var(--modern-border-color)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isDark ? 'var(--modern-black)' : 'var(--modern-bg-secondary)',
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
                                            e.currentTarget.style.borderColor = isDark 
                                                ? 'rgba(255, 255, 255, 0.2)' 
                                                : 'var(--modern-border-color)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                        >
                            <Image
                                src={matchDetails.homeTeamLogo}
                                width={70}
                                height={70}
                                fit="contain"
                                style={{ borderRadius: '50%' }}
                                alt={matchDetails.homeTeam}
                            />
                        </Box>
                        <Text
                            size="md"
                            fw={700}
                                    style={{
                                        color: 'var(--modern-text-primary)',
                                        textAlign: 'center',
                                    }}
                        >
                            {matchDetails.homeTeam}
                        </Text>
                    </Stack>

                    {/* VS Divider */}
                    <Text
                        size="xl"
                        fw={900}
                        style={{
                            color: 'var(--modern-lime)',
                            marginBottom: '1rem',
                        }}
                    >
                        VS
                    </Text>

                    {/* Away Team */}
                    <Stack gap="sm" align="center" style={{ flex: 1 }}>
                        <Box
                            onClick={() => handleTeamClick(matchDetails.awayTeamId)}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: isDark 
                                            ? '2px solid rgba(255, 255, 255, 0.2)' 
                                            : '2px solid var(--modern-border-color)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isDark ? 'var(--modern-black)' : 'var(--modern-bg-secondary)',
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
                                            e.currentTarget.style.borderColor = isDark 
                                                ? 'rgba(255, 255, 255, 0.2)' 
                                                : 'var(--modern-border-color)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                        >
                            <Image
                                src={matchDetails.awayTeamLogo}
                                width={70}
                                height={70}
                                fit="contain"
                                style={{ borderRadius: '50%' }}
                                alt={matchDetails.awayTeam}
                            />
                        </Box>
                        <Text
                            size="md"
                            fw={700}
                                    style={{
                                        color: 'var(--modern-text-primary)',
                                        textAlign: 'center',
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
    );
}

