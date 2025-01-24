import React from 'react';
import { Box, Group, Paper, Title, Badge, Text } from '@mantine/core';
import {FormationView} from "./formation";

function TeamLineups({ matchDetails, status }) {
    return (
        <Paper p="xl" radius="lg" withBorder mb="xl">
            <Title order={3} size="h4" mb="xl" align="center">Team Lineups</Title>
            <Group align="flex-start" spacing={0} noWrap>
                {/* Home Team */}
                <Box sx={{ flex: 1, paddingRight: 40 }}>
                    <Title order={4} size="h5" mb="xl" align="center">
                        {matchDetails.homeTeam}
                    </Title>
                    {status === 'future' ? (
                        <>
                            {matchDetails.homePredictedLineup && (
                                <FormationView
                                    lineup={matchDetails.homePredictedLineup}
                                    isPredicted
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {matchDetails.homeLineup && (
                                <FormationView
                                    lineup={matchDetails.homeLineup}
                                />
                            )}
                        </>
                    )}
                    {matchDetails.homeLineup?.substitutes && status !== 'future' && (
                        <Box mt="xl">
                            <Text size="sm" weight={500} mb="xs" align="center">Substitutes</Text>
                            <Group position="center" spacing={8}>
                                {matchDetails.homeLineup.substitutes.map((player) => (
                                    <Badge
                                        key={player.id}
                                        variant="dot"
                                        color="gray"
                                        size="lg"
                                    >
                                        {player.name}
                                    </Badge>
                                ))}
                            </Group>
                        </Box>
                    )}
                </Box>

                {/* Central Divider */}
                <Box
                    sx={(theme) => ({
                        width: 2,
                        alignSelf: 'stretch',
                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
                        margin: '0 40px'
                    })}
                />

                {/* Away Team */}
                <Box sx={{ flex: 1, paddingLeft: 40 }}>
                    <Title order={4} size="h5" mb="xl" align="center">
                        {matchDetails.awayTeam}
                    </Title>
                    {status === 'future' ? (
                        <>
                            {matchDetails.awayPredictedLineup && (
                                <FormationView
                                    lineup={matchDetails.awayPredictedLineup}
                                    isPredicted
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {matchDetails.awayLineup && (
                                <FormationView
                                    lineup={matchDetails.awayLineup}
                                />
                            )}
                        </>
                    )}
                    {matchDetails.awayLineup?.substitutes && status !== 'future' && (
                        <Box mt="xl">
                            <Text size="sm" weight={500} mb="xs" align="center">Substitutes</Text>
                            <Group position="center" spacing={8}>
                                {matchDetails.awayLineup.substitutes.map((player) => (
                                    <Badge
                                        key={player.id}
                                        variant="dot"
                                        color="gray"
                                        size="lg"
                                    >
                                        {player.name}
                                    </Badge>
                                ))}
                            </Group>
                        </Box>
                    )}
                </Box>
            </Group>
        </Paper>
    );
}

export default TeamLineups;
