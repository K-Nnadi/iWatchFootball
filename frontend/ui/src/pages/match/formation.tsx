import React from 'react';
import { Avatar, Box, Card, Group, Paper, Text, Tooltip } from "@mantine/core";
import { Lineup, Player } from "./match.page"; // Ensure this path is correct

interface FormationViewProps {
    lineup: Lineup;
    isPredicted?: boolean;
}

function arrangePlayersByFormation(players: Player[], formation: string) {
    const [defenders, midfielders, forwards] = formation.split('-').map(Number);
    const gk = players.filter(p => p.position === 'GK');
    const df = players.filter(p => p.position === 'DF');
    const mf = players.filter(p => p.position === 'MF');
    const fw = players.filter(p => p.position === 'FW');

    return {
        gk: gk.slice(0, 1),
        defenders: df.slice(0, defenders),
        midfielders: mf.slice(0, midfielders),
        forwards: fw.slice(0, forwards),
    };
}

export const FormationView = ({ lineup, isPredicted }: FormationViewProps) => {
    const arranged = arrangePlayersByFormation(lineup.players, lineup.formation);

    return (
        <Box>
            <Paper
                p="md"
                radius="md"
                sx={(theme) => ({
                    backgroundColor: theme.colorScheme === 'dark' ? theme.fn.rgba(theme.colors.dark[8], 0.5) : theme.fn.rgba(theme.colors.gray[1], 0.7),
                    border: isPredicted ? `1px dashed ${theme.colors.gray[5]}` : undefined,
                })}
            >
                <Group position="apart" mb="md">
                    <Text color="dimmed" size="sm" sx={(theme) => ({ fontFamily: theme.fontFamilyMonospace, letterSpacing: 1 })}>
                        {isPredicted ? 'Predicted Formation' : 'Formation'}: {lineup.formation}
                    </Text>
                    {isPredicted && <Avatar color="yellow" radius="xl">P</Avatar>}
                </Group>

                {Object.keys(arranged).map((group) => (
                    <Group position="center" align="center" spacing="md" mb={20} key={group} grow>
                        {arranged[group].map((player) => (
                            <Tooltip key={player.id} label={player.position} withArrow>
                                <Card shadow="sm" p="lg" radius="md" sx={{ minWidth: 120, textAlign: 'center', flex: 1 }}>
                                    <Avatar src={`/path/to/player/image/${player.id}.jpg`} alt={player.name} size="lg" />
                                    <Text size="sm" weight={500}>{player.name}</Text>
                                </Card>
                            </Tooltip>
                        ))}
                    </Group>
                ))}
            </Paper>
        </Box>
    );
}

export default FormationView;
