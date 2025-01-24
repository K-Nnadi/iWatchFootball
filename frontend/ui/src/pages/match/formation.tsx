import React from 'react';
import { Avatar, Box, Paper, Text, Grid } from "@mantine/core";
import { Lineup, Player } from "./match.page"; // Verify import path

interface FormationViewProps {
    lineup: Lineup;
    isPredicted?: boolean;
}

function arrangePlayersByFormation(players: Player[], formation: string) {
    const [defenders, midfielders, forwards] = formation.split('-').map(Number);
    const gk = players.filter(p => p.position === 'GK').slice(0, 1);
    const df = players.filter(p => p.position === 'DF').slice(0, defenders);
    const mf = players.filter(p => p.position === 'MF').slice(0, midfielders);
    const fw = players.filter(p => p.position === 'FW').slice(0, forwards);

    return { gk, df, mf, fw };
}

export const FormationView = ({ lineup, isPredicted }: FormationViewProps) => {
    const { gk, df, mf, fw } = arrangePlayersByFormation(lineup.players, lineup.formation);

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
                <Text color="dimmed" size="sm" sx={{ textAlign: 'center', width: '100%', marginBottom: '20px' }}>
                    {isPredicted ? 'Predicted Formation' : 'Formation'}: {lineup.formation}
                </Text>

                <Grid>
                    {renderPlayerGroup(gk, 12)}
                    {renderPlayerGroup(df, 12 / df.length)}
                    {renderPlayerGroup(mf, 12 / mf.length)}
                    {renderPlayerGroup(fw, 12 / fw.length)}
                </Grid>
            </Paper>
        </Box>
    );
};

function renderPlayerGroup(players: Player[], span: number) {
    return players.map(player => (
        <Grid.Col span={Math.floor(span)} key={player.id}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                <Avatar src={`/path/to/player/image/${player.id}.jpg`} alt={player.name} size="lg" />
                <Text size="sm" weight={500} mt="xs">{player.name}</Text>
            </Box>
        </Grid.Col>
    ));
}

export default FormationView;
