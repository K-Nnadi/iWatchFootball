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
        <Paper p="xl" radius="lg" withBorder mb="xl">
            <Title order={3} size="h4" mb="xl" align="center">Team Lineups</Title>
            <Tabs defaultValue={matchDetails.homeTeam}>
                <Tabs.List>
                    <Tabs.Tab value={matchDetails.homeTeam} name={matchDetails.homeTeam} >
                        {matchDetails.homeTeam}
                    </Tabs.Tab>
                    <Tabs.Tab value={matchDetails.awayTeam} name={matchDetails.awayTeam} >
                        {matchDetails.awayTeam}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value={matchDetails.homeTeam} pt="xs">
                    <Box p="md">
                        <Title order={4} size="h5" mb="xl" align="center">
                            {matchDetails.homeTeam}
                        </Title>
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

                <Tabs.Panel value={matchDetails.awayTeam} pt="xs">
                    <Box p="md">
                        <Title order={4} size="h5" mb="xl" align="center">
                            {matchDetails.awayTeam}
                        </Title>
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
            <Title size="sm" weight={500} mb="xs" align="center">Substitutes</Title>
            {substitutes ? substitutes.map(substitute => (
                <Text key={substitute.id} size="sm" style={{ margin: '4px' }}>
                    {substitute.name}
                </Text>
            )) : (
                <Text size="sm" style={{ margin: '4px' }}>No substitutes listed.</Text>
            )}
        </Box>
    );
};

export default TeamLineups;
