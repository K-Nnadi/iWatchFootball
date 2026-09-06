import { Box, Center, Loader, Paper, Text, Title } from '@mantine/core';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clientInstance } from '@iWatchFootball/clients/client-instance';
import { useCreatePrediction } from '@iWatchFootball/clients/controllers/prediction';
import { useAuthStore } from '../../shared/stores/auth.store';
import { notify } from '../../shared/notify';
import { useTranslation } from '../../i18n/useTranslation';
import { isKickoffUpcoming } from '../match/matchCalendarStatus';

export interface ScorePredictionCardProps {
    homeTeam: string;
    awayTeam: string;
    date: string;
    /** When set, poll totals load from `GET /prediction/fixture/:id/tally`. */
    fixtureId?: number;
}

type PredictionSide = 'home' | 'draw' | 'away';

type MatchStatus = 'past' | 'today' | 'future';

function getMatchStatus(matchDateStr: string): MatchStatus {
    const matchDate = new Date(matchDateStr);
    const now = new Date();

    const matchDateOnly = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (matchDateOnly < todayOnly) return 'past';
    if (matchDateOnly.getTime() === todayOnly.getTime()) {
        return matchDate < now ? 'past' : 'today';
    }
    return 'future';
}

type FixturePredictionTally = { home: number; draw: number; away: number; total: number };

function toApiPredicted(side: PredictionSide): string {
    switch (side) {
        case 'home':
            return 'Home';
        case 'draw':
            return 'Draw';
        case 'away':
            return 'Away';
    }
}

export function ScorePredictionCard({
    homeTeam,
    awayTeam,
    date,
    fixtureId,
}: ScorePredictionCardProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { isLoggedIn, user } = useAuthStore();

    const useFixturePoll =
        typeof fixtureId === 'number' && Number.isFinite(fixtureId);

    const [userScorePrediction, setUserScorePrediction] = useState<PredictionSide | null>(null);
    const [demoPredictions] = useState<
        Array<{ userId: string; username: string; prediction: PredictionSide }>
    >(() =>
        useFixturePoll
            ? []
            : [
                  { userId: '1', username: 'JohnDoe', prediction: 'home' as const },
                  { userId: '2', username: 'JaneSmith', prediction: 'draw' as const },
                  { userId: '3', username: 'MikeJohnson', prediction: 'away' as const },
                  { userId: '4', username: 'SarahWilliams', prediction: 'home' as const },
                  { userId: '5', username: 'TomBrown', prediction: 'home' as const },
                  { userId: '6', username: 'EmmaDavis', prediction: 'draw' as const },
                  { userId: '7', username: 'ChrisWilson', prediction: 'away' as const },
              ],
    );
    const [matchResult, setMatchResult] = useState<{
        homeScore: number;
        awayScore: number;
        winner: PredictionSide;
    } | null>(null);

    const status = useMemo(() => getMatchStatus(date), [date]);
    const votingOpen = useMemo(() => isKickoffUpcoming(date), [date]);

    const tallyQueryKey = ['/prediction/fixture', fixtureId, 'tally'] as const;

    const { data: tally, isLoading: tallyLoading } = useQuery({
        queryKey: tallyQueryKey,
        queryFn: () =>
            clientInstance<FixturePredictionTally>({
                url: `/prediction/fixture/${fixtureId}/tally`,
                method: 'GET',
            }),
        enabled: useFixturePoll,
    });

    const createPredictionMut = useCreatePrediction({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: tallyQueryKey });
            },
            onError: () => {
                notify.error(t('match.couldNotSavePrediction'), t('match.tryAgain'));
            },
        },
    });

    useEffect(() => {
        if (useFixturePoll || status !== 'past') return;
        setMatchResult({
            homeScore: 2,
            awayScore: 1,
            winner: 'home',
        });
    }, [status, useFixturePoll]);

    function handleScorePrediction(prediction: PredictionSide) {
        if (userScorePrediction || !votingOpen) return;

        if (useFixturePoll) {
            if (!isLoggedIn || !user?.id) {
                notify.warning(t('match.signInRequired'), t('match.signInToPredict'));
                return;
            }
            createPredictionMut.mutate(
                {
                    data: {
                        fixtureId: fixtureId!,
                        userId: user.id,
                        predicted: toApiPredicted(prediction),
                    },
                },
                {
                    onSuccess: () => setUserScorePrediction(prediction),
                }
            );
            return;
        }

        setUserScorePrediction(prediction);
    }

    const demoPredictionsWithUser =
        userScorePrediction && !useFixturePoll
            ? [
                  ...demoPredictions,
                  { userId: 'current-user', username: t('match.you'), prediction: userScorePrediction },
              ]
            : demoPredictions;

    const demoPredictionCounts = demoPredictionsWithUser.reduce(
        (acc, pred) => {
            acc[pred.prediction] = (acc[pred.prediction] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const homePredictionCount = useFixturePoll ? (tally?.home ?? 0) : demoPredictionCounts['home'] || 0;
    const drawPredictionCount = useFixturePoll ? (tally?.draw ?? 0) : demoPredictionCounts['draw'] || 0;
    const awayPredictionCount = useFixturePoll ? (tally?.away ?? 0) : demoPredictionCounts['away'] || 0;

    const totalPredictions = homePredictionCount + drawPredictionCount + awayPredictionCount;

    const showEqualSections =
        votingOpen &&
        !userScorePrediction &&
        ((!useFixturePoll && demoPredictions.length === 0) ||
            (useFixturePoll && tallyLoading) ||
            (useFixturePoll && !tallyLoading && totalPredictions === 0));

    const homePercentage = showEqualSections
        ? 33.33
        : totalPredictions > 0
          ? (homePredictionCount / totalPredictions) * 100
          : 0;
    const drawPercentage = showEqualSections
        ? 33.33
        : totalPredictions > 0
          ? (drawPredictionCount / totalPredictions) * 100
          : 0;
    const awayPercentage = showEqualSections
        ? 33.34
        : totalPredictions > 0
          ? (awayPredictionCount / totalPredictions) * 100
          : 0;

    const pollLocked =
        !votingOpen ||
        !!userScorePrediction ||
        createPredictionMut.isPending ||
        (useFixturePoll && tallyLoading);

    const showPredictionTotalFooter =
        totalPredictions > 0 && (!showEqualSections || userScorePrediction);

    const pollHeading = votingOpen ? t('match.whoWillWin') : t('match.pregamePredictions');

    const pastFixturePollAwaitingData =
        !votingOpen && useFixturePoll && tallyLoading;
    const pastFixturePollNothingToShow =
        !votingOpen && useFixturePoll && !tallyLoading && totalPredictions === 0;

    if (pastFixturePollNothingToShow) {
        return null;
    }

    return (
        <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="lg"
            withBorder
            mb={{ base: 'md', sm: 'xl' }}
            style={{
                backgroundColor: 'var(--modern-card-bg)',
                border: '1px solid var(--modern-border-color)',
            }}
        >
            <Title
                order={3}
                mb={votingOpen && !userScorePrediction ? 'xs' : 'lg'}
                ta="center"
                style={{
                    color: 'var(--modern-text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }}
            >
                {pollHeading}
            </Title>

            {votingOpen && !userScorePrediction ? (
                <Text size="sm" c="dimmed" ta="center" mb="md">
                    {t('match.tapToVote')}
                </Text>
            ) : null}

            <Box>
                {pastFixturePollAwaitingData ? (
                    <Center py="xl" style={{ minHeight: 60 }}>
                        <Loader size="sm" color="var(--modern-text-secondary)" />
                    </Center>
                ) : null}
                <Box
                    style={{
                        width: '100%',
                        height: '60px',
                        border: '2px solid var(--modern-border-color)',
                        borderRadius: '30px',
                        display: pastFixturePollAwaitingData ? 'none' : 'flex',
                        overflow: 'hidden',
                        position: 'relative',
                        marginBottom: '1rem',
                    }}
                >
                    <Box
                        onClick={() => {
                            if (!pollLocked) handleScorePrediction('home');
                        }}
                        role={pollLocked ? undefined : 'button'}
                        aria-label={homeTeam}
                        style={{
                            width: `${homePercentage}%`,
                            minWidth: pollLocked ? undefined : '4.5rem',
                            backgroundColor:
                                status === 'past' && matchResult?.winner === 'home'
                                    ? 'rgba(0, 255, 136, 0.3)'
                                    : userScorePrediction === 'home'
                                      ? 'rgba(0, 255, 136, 0.3)'
                                      : 'rgba(34, 139, 230, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '2px solid var(--modern-border-color)',
                            cursor: pollLocked ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            borderRadius: '30px 0 0 30px',
                            opacity: useFixturePoll && tallyLoading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!pollLocked) {
                                e.currentTarget.style.backgroundColor = 'rgba(34, 139, 230, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!pollLocked) {
                                e.currentTarget.style.backgroundColor = 'rgba(34, 139, 230, 0.3)';
                            }
                        }}
                    >
                        {showEqualSections ? (
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
                        ) : homePercentage >= 8 ? (
                            <Text size="lg" fw={700} style={{ color: 'var(--modern-text-primary)' }}>
                                {Math.round(homePercentage)}%
                            </Text>
                        ) : null}
                    </Box>

                    <Box
                        onClick={() => {
                            if (!pollLocked) handleScorePrediction('draw');
                        }}
                        role={pollLocked ? undefined : 'button'}
                        aria-label={t('match.draw')}
                        style={{
                            width: `${drawPercentage}%`,
                            minWidth: pollLocked ? undefined : '4.5rem',
                            backgroundColor:
                                status === 'past' && matchResult?.winner === 'draw'
                                    ? 'rgba(0, 255, 136, 0.3)'
                                    : userScorePrediction === 'draw'
                                      ? 'rgba(0, 255, 136, 0.3)'
                                      : 'rgba(250, 176, 5, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '2px solid var(--modern-border-color)',
                            cursor: pollLocked ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: useFixturePoll && tallyLoading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!pollLocked) {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 176, 5, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!pollLocked) {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 176, 5, 0.3)';
                            }
                        }}
                    >
                        {showEqualSections ? (
                            <Text
                                size="sm"
                                fw={700}
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    textAlign: 'center',
                                    padding: '0 8px',
                                }}
                            >
                                {t('match.draw')}
                            </Text>
                        ) : drawPercentage >= 8 ? (
                            <Text size="lg" fw={700} style={{ color: 'var(--modern-text-primary)' }}>
                                {Math.round(drawPercentage)}%
                            </Text>
                        ) : null}
                    </Box>

                    <Box
                        onClick={() => {
                            if (!pollLocked) handleScorePrediction('away');
                        }}
                        role={pollLocked ? undefined : 'button'}
                        aria-label={awayTeam}
                        style={{
                            width: `${awayPercentage}%`,
                            minWidth: pollLocked ? undefined : '4.5rem',
                            backgroundColor:
                                status === 'past' && matchResult?.winner === 'away'
                                    ? 'rgba(0, 255, 136, 0.3)'
                                    : userScorePrediction === 'away'
                                      ? 'rgba(0, 255, 136, 0.3)'
                                      : 'rgba(250, 82, 82, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: pollLocked ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '0 30px 30px 0',
                            opacity: useFixturePoll && tallyLoading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!pollLocked) {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 82, 82, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!pollLocked) {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 82, 82, 0.3)';
                            }
                        }}
                    >
                        {showEqualSections ? (
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
                        ) : awayPercentage >= 8 ? (
                            <Text size="lg" fw={700} style={{ color: 'var(--modern-text-primary)' }}>
                                {Math.round(awayPercentage)}%
                            </Text>
                        ) : null}
                    </Box>
                </Box>

                {showPredictionTotalFooter && (
                    <Text size="sm" c="dimmed" ta="center" mt="md">
                        {t('match.basedOnPredictions', { count: totalPredictions })}
                    </Text>
                )}

                {userScorePrediction && votingOpen && (
                    <Text size="sm" c="var(--modern-lime)" ta="center" mt="md" fw={600}>
                        {t('match.yourPrediction')}{' '}
                        {userScorePrediction === 'home'
                            ? homeTeam
                            : userScorePrediction === 'away'
                              ? awayTeam
                              : t('match.draw')}
                    </Text>
                )}
            </Box>
        </Paper>
    );
}
