import { Box, Paper, Text, Title, Group, Stack } from '@mantine/core';
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
        if (!userScorePrediction) {
            setUserScorePrediction(prediction);
            // In a real app, you would make an API call here to save the prediction
        }
    }

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

    return (
        <Paper 
            p={{ base: 'md', sm: 'xl' }} 
            radius="lg" 
            withBorder 
            mb={{ base: 'md', sm: 'xl' }}
            style={{ backgroundColor: 'var(--modern-dark-gray)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
            <Title 
                order={3} 
                mb="lg" 
                ta="center"
                style={{ color: 'var(--modern-white)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
                Who Will Win?
            </Title>
            
            {/* Prediction bar - same for all statuses */}
            <Box>
                <Box
                    style={{
                        width: '100%',
                        height: '60px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '30px',
                        display: 'flex',
                        overflow: 'hidden',
                        position: 'relative',
                        marginBottom: '1rem',
                    }}
                >
                    {homePredictionCount > 0 && (
                        <Box
                            onClick={() => !userScorePrediction && status !== 'past' && handleScorePrediction('home')}
                            style={{
                                width: `${(homePredictionCount / totalPredictions) * 100}%`,
                                backgroundColor: status === 'past' && matchResult?.winner === 'home' 
                                    ? 'rgba(0, 255, 136, 0.3)' 
                                    : userScorePrediction === 'home' 
                                    ? 'rgba(0, 255, 136, 0.3)' 
                                    : 'rgba(34, 139, 230, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRight: '2px solid rgba(255, 255, 255, 0.3)',
                                cursor: userScorePrediction || status === 'past' ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
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
                            {(userScorePrediction || status === 'past') && (
                                <Text size="lg" fw={700} style={{ color: 'var(--modern-white)' }}>
                                    {Math.round((homePredictionCount / totalPredictions) * 100)}%
                                </Text>
                            )}
                        </Box>
                    )}
                    {drawPredictionCount > 0 && (
                        <Box
                            onClick={() => !userScorePrediction && status !== 'past' && handleScorePrediction('draw')}
                            style={{
                                width: `${(drawPredictionCount / totalPredictions) * 100}%`,
                                backgroundColor: status === 'past' && matchResult?.winner === 'draw' 
                                    ? 'rgba(0, 255, 136, 0.3)' 
                                    : userScorePrediction === 'draw' 
                                    ? 'rgba(0, 255, 136, 0.3)' 
                                    : 'rgba(250, 176, 5, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRight: '2px solid rgba(255, 255, 255, 0.3)',
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
                            {(userScorePrediction || status === 'past') && (
                                <Text size="lg" fw={700} style={{ color: 'var(--modern-white)' }}>
                                    {Math.round((drawPredictionCount / totalPredictions) * 100)}%
                                </Text>
                            )}
                        </Box>
                    )}
                    {awayPredictionCount > 0 && (
                        <Box
                            onClick={() => !userScorePrediction && status !== 'past' && handleScorePrediction('away')}
                            style={{
                                width: `${(awayPredictionCount / totalPredictions) * 100}%`,
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
                            {(userScorePrediction || status === 'past') && (
                                <Text size="lg" fw={700} style={{ color: 'var(--modern-white)' }}>
                                    {Math.round((awayPredictionCount / totalPredictions) * 100)}%
                                </Text>
                            )}
                        </Box>
                    )}
                </Box>
                {(userScorePrediction || status === 'past') && (
                    <Text size="sm" c="dimmed" ta="center" mt="md">
                        Based on <Text span fw={700} c="var(--modern-white)">{totalPredictions}</Text> predictions
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

