import React from 'react';
import { Box, Paper, Title, Tabs, Text, SimpleGrid } from '@mantine/core';
import { useTranslation } from '../../i18n/useTranslation';
import { FormationView } from "./formation";
import { Lineup, MatchDetails, Player } from "./match.page";  // Verify import paths

/**
 * Tabs delegate to {@link FormationView}, which expects normalized {@link Lineup} on `matchDetails`.
 * Lineup rows arrive from the API as {@link import('../../components/match/lineupFromApi').ApiLineUpWire}
 * and are merged on the match page via `attachLineupsToFixtureSides`.
 */

interface TeamLineupsProps {
    matchDetails: MatchDetails;
    status: 'past' | 'today' | 'future';
}

export const TeamLineups: React.FC<TeamLineupsProps> = ({ matchDetails, status }) => {
    const { t } = useTranslation();
    const isFuture = status === 'future';


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
                mb={{ base: 'md', sm: 'xl' }} 
                ta="center" 
                style={{ color: 'var(--modern-text-primary)' }}
            >
                {t('match.teamLineups')}
            </Title>
            <Tabs 
                defaultValue={matchDetails.homeTeam}
                styles={{
                    list: {
                        flexWrap: 'nowrap',
                        width: '100%',
                        justifyContent: 'stretch',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    },
                    tab: {
                        flex: '1 1 0',
                        minWidth: 0,
                        maxWidth: '100%',
                        borderBottom: '2px solid transparent',
                        transition: 'all 0.2s ease',
                        paddingLeft: 'clamp(0.25rem, 2vw, 1rem)',
                        paddingRight: 'clamp(0.25rem, 2vw, 1rem)',
                    },
                    tabLabel: {
                        color: 'var(--modern-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 'clamp(0.7rem, 2.8vw, 0.875rem)',
                        lineHeight: 1.35,
                        fontWeight: 500,
                    }
                }}
            >
                <Tabs.List>
                    <Tabs.Tab 
                        value={matchDetails.homeTeam}
                        styles={{
                            tab: {
                                borderBottom: '2px solid transparent',
                                '&[data-active]': {
                                    borderBottomColor: 'var(--modern-lime)',
                                }
                            },
                            tabLabel: {
                                color: 'var(--modern-text-primary)',
                                '&[data-active]': {
                                    color: 'var(--modern-lime)',
                                }
                            }
                        }}
                    >
                        {matchDetails.homeTeam}
                    </Tabs.Tab>
                    <Tabs.Tab 
                        value={matchDetails.awayTeam}
                        styles={{
                            tab: {
                                borderBottom: '2px solid transparent',
                                '&[data-active]': {
                                    borderBottomColor: 'var(--modern-lime)',
                                }
                            },
                            tabLabel: {
                                color: 'var(--modern-text-primary)',
                                '&[data-active]': {
                                    color: 'var(--modern-lime)',
                                }
                            }
                        }}
                    >
                        {matchDetails.awayTeam}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value={matchDetails.homeTeam} pt={{ base: 'md', sm: 'xl' }}>
                    <Box p={{ base: 'xs', sm: 'md' }}>
                        {isFuture && matchDetails.homePredictedLineup ? (
                            <FormationView
                                lineup={matchDetails.homePredictedLineup}
                                isPredicted={true}
                            />
                        ) : (
                            matchDetails.homeLineup && (
                                <FormationView
                                    lineup={matchDetails.homeLineup}
                                />
                            )
                        )}
                        {!isFuture &&
                            !matchDetails.homeLineup &&
                            !matchDetails.homePredictedLineup && (
                                <Text size="sm" ta="center" c="dimmed">
                                    {t('match.lineupUnavailable')}
                                </Text>
                            )}
                        {matchDetails.homeLineup?.substitutes && !isFuture && (
                            <SubstitutesList substitutes={matchDetails.homeLineup.substitutes}/>
                        )}
                    </Box>
                </Tabs.Panel>

                <Tabs.Panel value={matchDetails.awayTeam} pt={{ base: 'md', sm: 'xl' }}>
                    <Box p={{ base: 'xs', sm: 'md' }}>
                        {isFuture && matchDetails.awayPredictedLineup ? (
                            <FormationView
                                lineup={matchDetails.awayPredictedLineup}
                                isPredicted={true}
                            />
                        ) : (
                            matchDetails.awayLineup && (
                                <FormationView
                                    lineup={matchDetails.awayLineup}
                                />
                            )
                        )}
                        {!isFuture &&
                            !matchDetails.awayLineup &&
                            !matchDetails.awayPredictedLineup && (
                                <Text size="sm" ta="center" c="dimmed">
                                    {t('match.lineupUnavailable')}
                                </Text>
                            )}
                        {matchDetails.awayLineup?.substitutes && !isFuture && (
                            <SubstitutesList substitutes={matchDetails.awayLineup.substitutes}/>
                        )}
                    </Box>
                </Tabs.Panel>
            </Tabs>
        </Paper>
    );
}

interface SubstitutesListProps {
    substitutes?: Player[];
}

function SubstitutesList({ substitutes }: SubstitutesListProps) {
    const { t } = useTranslation();
    return (
        <Box mt="xl" mx="auto" maw={{ base: '100%', sm: 920 }}>
            <Title size="sm" fw={500} mb="md" ta="center" style={{ color: 'var(--modern-text-primary)' }}>{t('match.substitutes')}</Title>
            {substitutes?.length ? (
                <SimpleGrid
                    cols={{ base: 1, xs: 2, sm: 3 }}
                    spacing={{ base: 'xs', xs: 'sm' }}
                    verticalSpacing={{ base: 'xs', xs: 'sm' }}
                >
                    {substitutes.map((substitute) => (
                        <Text
                            key={substitute.id}
                            fz="sm"
                            lh={1.45}
                            ta={{ base: 'left', xs: 'center' }}
                            style={{
                                color: 'var(--modern-text-secondary)',
                                padding: '0.45rem 0.65rem',
                                borderRadius: 8,
                                backgroundColor: 'color-mix(in srgb, var(--modern-border-color) 55%, transparent)',
                                border: '1px solid var(--modern-border-color)',
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word',
                            }}
                        >
                            {substitute.name}
                        </Text>
                    ))}
                </SimpleGrid>
            ) : (
                <Text size="sm" ta="center" style={{ color: 'var(--modern-text-secondary)' }}>{t('match.noSubstitutes')}</Text>
            )}
        </Box>
    );
}

export default TeamLineups;
