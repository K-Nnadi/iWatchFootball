import { Box, Paper, Text, Title } from '@mantine/core';
import { useState, useMemo, useEffect } from 'react';

interface ScorePredictionCardProps {
    homeTeam: string;
    awayTeam: string;
    date: string; // ISO date string
}

type MatchStatus = 'past' | 'today' | 'future';

function getMatchStatus(matchDateStr: string): MatchStatus {
    const matchDate = new Date(matchDateStr);
    const now = new Date();
    
    // Reset time to compare dates only
    const matchDateOnly = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (matchDateOnly < todayOnly) return 'past';
    if (matchDateOnly.getTime() === todayOnly.getTime()) {
        // If today, check if match time has passed
        return matchDate < now ? 'past' : 'today';
    }
    return 'future';
}

export function ScorePredictionCard({
    homeTeam,
    awayTeam,
    date,
}: ScorePredictionCardProps) {
    const [userScorePrediction, setUserScorePrediction] = useState<'home' | 'draw' | 'away' | null>(null);
    const [allPredictions, setAllPredictions] = useState<Array<{
        userId: string;
        username: string;
        prediction: 'home' | 'draw' | 'away';
    }>>([]);
    const [matchResult, setMatchResult] = useState<{
        homeScore: number;
        awayScore: number;
        winner: 'home' | 'draw' | 'away';
    } | null>(null);

    const status = useMemo(() => getMatchStatus(date), [date]);

    // Log when user prediction changes
    useEffect(() => {
        if (userScorePrediction) {
            console.log('User has selected:', userScorePrediction);
        } else {
            console.log('User has not selected a prediction yet');
        }
    }, [userScorePrediction]);

    // Fetch predictions and match result
    useEffect(() => {
        // Mock API call - replace with actual API call
        setTimeout(() => {
            const mockPredictions = [
                { userId: '1', username: 'JohnDoe', prediction: 'home' as const },
                { userId: '2', username: 'JaneSmith', prediction: 'draw' as const },
                { userId: '3', username: 'MikeJohnson', prediction: 'away' as const },
                { userId: '4', username: 'SarahWilliams', prediction: 'home' as const },
                { userId: '5', username: 'TomBrown', prediction: 'home' as const },
                { userId: '6', username: 'EmmaDavis', prediction: 'draw' as const },
                { userId: '7', username: 'ChrisWilson', prediction: 'away' as const },
            ];
            setAllPredictions(mockPredictions);

            // If match is past, set mock result
            if (status === 'past') {
                setMatchResult({
                    homeScore: 2,
                    awayScore: 1,
                    winner: 'home',
                });
            }
        }, 100);
    }, [status]);

    function handleScorePrediction(prediction: 'home' | 'draw' | 'away') {
        if (!userScorePrediction && status !== 'past') {
            console.log('User selected prediction:', prediction);
            setUserScorePrediction(prediction);
            // In a real app, you would make an API call here to save the prediction
        }
    }

    // Percentages should only show after user selects a prediction
    // Removed handleShowPercentages - percentages only show after selection

    const allPredictionsWithUser = userScorePrediction 
        ? [...allPredictions, { userId: 'current-user', username: 'You', prediction: userScorePrediction }]
        : allPredictions;
    
    // Count predictions for display (use allPredictions for initial percentages, allPredictionsWithUser after selection)
    const predictionsForCount = userScorePrediction ? allPredictionsWithUser : allPredictions;
    const predictionCounts = predictionsForCount.reduce((acc, pred) => {
        acc[pred.prediction] = (acc[pred.prediction] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const homePredictionCount = predictionCounts['home'] || 0;
    const drawPredictionCount = predictionCounts['draw'] || 0;
    const awayPredictionCount = predictionCounts['away'] || 0;
    const totalPredictions = predictionsForCount.length;

    // Determine if we should show equal sections (future match, no user prediction)
    // Percentages only show after user selects a prediction
    const shouldShowEqualSections = status === 'future' && !userScorePrediction;
    
    // Calculate percentages - show equal sections if needed, otherwise show actual percentages
    const homePercentage = shouldShowEqualSections 
        ? 33.33 
        : totalPredictions > 0 
            ? (homePredictionCount / totalPredictions) * 100 
            : 0;
    const drawPercentage = shouldShowEqualSections 
        ? 33.33 
        : totalPredictions > 0 
            ? (drawPredictionCount / totalPredictions) * 100 
            : 0;
    const awayPercentage = shouldShowEqualSections 
        ? 33.34 
        : totalPredictions > 0 
            ? (awayPredictionCount / totalPredictions) * 100 
            : 0;

    return (
        <Paper 
            p={{ base: 'md', sm: 'xl' }} 
            radius="lg" 
            withBorder 
            mb={{ base: 'md', sm: 'xl' }}
            style={{ backgroundColor: 'var(--modern-card-bg)', border: '1px solid var(--modern-border-color)' }}
        >
            <Title 
                order={3} 
                mb="lg" 
                ta="center"
                style={{ 
                    color: 'var(--modern-text-primary)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                }}
            >
                Who Will Win?
            </Title>
            
            {/* Prediction bar - same for all statuses */}
            <Box>
                <Box
                    style={{
                        width: '100%',
                        height: '60px',
                        border: '2px solid var(--modern-border-color)',
                        borderRadius: '30px',
                        display: 'flex',
                        overflow: 'hidden',
                        position: 'relative',
                        marginBottom: '1rem',
                    }}
                >
                    {/* Home Team Section */}
                    <Box
                        onClick={() => {
                            if (!userScorePrediction && status !== 'past') {
                                handleScorePrediction('home');
                            }
                        }}
                        style={{
                            width: `${homePercentage}%`,
                            backgroundColor: status === 'past' && matchResult?.winner === 'home' 
                                ? 'rgba(0, 255, 136, 0.3)' 
                                : userScorePrediction === 'home' 
                                ? 'rgba(0, 255, 136, 0.3)' 
                                : 'rgba(34, 139, 230, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '2px solid var(--modern-border-color)',
                            cursor: userScorePrediction || status === 'past' ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            borderRadius: '30px 0 0 30px',
                        }}
                        onMouseEnter={(e) => {
                            if (!userScorePrediction && status !== 'past') {
                                e.currentTarget.style.backgroundColor = 'rgba(34, 139, 230, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!userScorePrediction && status !== 'past') {
                                e.currentTarget.style.backgroundColor = 'rgba(34, 139, 230, 0.3)';
                            }
                        }}
                    >
                        {shouldShowEqualSections ? (
                            <Text 
                                size="sm" 
                                fw={700} 
                                style={{ 
                                    color: 'var(--modern-text-primary)', 
                                    textAlign: 'center', 
                                    padding: '0 8px',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {homeTeam}
                            </Text>
                        ) : (
                            <Text size="lg" fw={700} style={{ color: 'var(--modern-text-primary)' }}>
                                {Math.round(homePercentage)}%
                            </Text>
                        )}
                    </Box>
                    
                    {/* Draw Section */}
                    <Box
                        onClick={() => {
                            if (!userScorePrediction && status !== 'past') {
                                handleScorePrediction('draw');
                            }
                        }}
                        style={{
                            width: `${drawPercentage}%`,
                            backgroundColor: status === 'past' && matchResult?.winner === 'draw' 
                                ? 'rgba(0, 255, 136, 0.3)' 
                                : userScorePrediction === 'draw' 
                                ? 'rgba(0, 255, 136, 0.3)' 
                                : 'rgba(250, 176, 5, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '2px solid var(--modern-border-color)',
                            cursor: userScorePrediction || status === 'past' ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!userScorePrediction && status !== 'past') {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 176, 5, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!userScorePrediction && status !== 'past') {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 176, 5, 0.3)';
                            }
                        }}
                    >
                        {shouldShowEqualSections ? (
                            <Text 
                                size="sm" 
                                fw={700} 
                                style={{ 
                                    color: 'var(--modern-text-primary)', 
                                    textAlign: 'center', 
                                    padding: '0 8px' 
                                }}
                            >
                                Draw
                            </Text>
                        ) : (
                            <Text size="lg" fw={700} style={{ color: 'var(--modern-text-primary)' }}>
                                {Math.round(drawPercentage)}%
                            </Text>
                        )}
                    </Box>
                    
                    {/* Away Team Section */}
                    <Box
                        onClick={() => {
                            if (!userScorePrediction && status !== 'past') {
                                handleScorePrediction('away');
                            }
                        }}
                        style={{
                            width: `${awayPercentage}%`,
                            backgroundColor: status === 'past' && matchResult?.winner === 'away' 
                                ? 'rgba(0, 255, 136, 0.3)' 
                                : userScorePrediction === 'away' 
                                ? 'rgba(0, 255, 136, 0.3)' 
                                : 'rgba(250, 82, 82, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: userScorePrediction || status === 'past' ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '0 30px 30px 0',
                        }}
                        onMouseEnter={(e) => {
                            if (!userScorePrediction && status !== 'past') {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 82, 82, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!userScorePrediction && status !== 'past') {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 82, 82, 0.3)';
                            }
                        }}
                    >
                        {shouldShowEqualSections ? (
                            <Text 
                                size="sm" 
                                fw={700} 
                                style={{ 
                                    color: 'var(--modern-text-primary)', 
                                    textAlign: 'center', 
                                    padding: '0 8px',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {awayTeam}
                            </Text>
                        ) : (
                            <Text size="lg" fw={700} style={{ color: 'var(--modern-text-primary)' }}>
                                {Math.round(awayPercentage)}%
                            </Text>
                        )}
                    </Box>
                </Box>
                {userScorePrediction && (
                    <Text size="sm" c="dimmed" ta="center" mt="md">
                        Based on <Text span fw={700} style={{ color: 'var(--modern-text-primary)' }}>{totalPredictions}</Text> predictions
                    </Text>
                )}
                
                {userScorePrediction && status !== 'past' && (
                    <Text size="sm" c="var(--modern-lime)" ta="center" mt="md" fw={600}>
                        Your prediction: {userScorePrediction === 'home' ? homeTeam : 
                         userScorePrediction === 'away' ? awayTeam : 'Draw'}
                    </Text>
                )}
            </Box>
        </Paper>
    );
}

