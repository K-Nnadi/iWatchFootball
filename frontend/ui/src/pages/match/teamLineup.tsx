import React, { useState } from 'react';
import { Box, Paper, Title, Tabs, Text } from '@mantine/core';
import { FormationView } from "./formation";
import { Lineup, MatchDetails, Player } from "./match.page";  // Verify import paths

interface TeamLineupsProps {
    matchDetails: MatchDetails;
    status: 'past' | 'today' | 'future';
}

export const TeamLineups: React.FC<TeamLineupsProps> = ({ matchDetails, status }) => {
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
                Team Lineups
            </Title>
            <Tabs 
                defaultValue={matchDetails.homeTeam}
                styles={{
                    tab: {
                        flex: '1 1 auto',
                        minWidth: '120px',
                        borderBottom: '2px solid transparent',
                        transition: 'all 0.2s ease',
                    },
                    tabLabel: {
                        color: 'var(--modern-text-primary)',
                    }
                }}
            >
                <Tabs.List style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
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
                        <Text size="sm" style={{ wordBreak: 'break-word', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                            {matchDetails.homeTeam}
                        </Text>
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
                        <Text size="sm" style={{ wordBreak: 'break-word', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                            {matchDetails.awayTeam}
                        </Text>
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
    return (
        <Box mt="xl">
            <Title size="sm" fw={500} mb="md" ta="center" style={{ color: 'var(--modern-text-primary)' }}>Substitutes</Title>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {substitutes ? substitutes.map(substitute => (
                    <Text key={substitute.id} size="sm" style={{ color: 'var(--modern-text-secondary)', margin: '0.25rem' }}>
                        {substitute.name}
                    </Text>
                )) : (
                    <Text size="sm" style={{ color: 'var(--modern-text-secondary)' }}>No substitutes listed.</Text>
                )}
            </Box>
        </Box>
    );
};

export default TeamLineups;
