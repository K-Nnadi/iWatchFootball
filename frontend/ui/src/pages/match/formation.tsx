import React from 'react';
import { Avatar, Box, Paper, Text, Grid } from "@mantine/core";
import { Lineup, Player } from "./match.page"; // Verify import path

interface FormationViewProps {
    lineup: Lineup;
    isPredicted?: boolean;
}

function arrangePlayersByFormation(players: Player[], formation: string) {
    const formationParts = formation.split('-').map(Number);
    const defenders = formationParts[0];
    const forwards = formationParts[formationParts.length - 1];
    
    // Get all midfield numbers (everything between first and last number)
    const midfieldRows = formationParts.slice(1, -1);
    
    const gk = players.filter(p => p.position === 'GK').slice(0, 1);
    const df = players.filter(p => p.position === 'DF').slice(0, defenders);
    const fw = players.filter(p => p.position === 'FW').slice(0, forwards);
    
    // Filter midfielders and distribute them according to the formation
    const allMidfielders = players.filter(p => p.position === 'MF');
    const mf: Player[][] = [];
    let currentMfIndex = 0;
    
    midfieldRows.forEach(count => {
        mf.push(allMidfielders.slice(currentMfIndex, currentMfIndex + count));
        currentMfIndex += count;
    });

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
                    {mf.map((row) => renderPlayerGroup(row, 12 / row.length))}
                    {renderPlayerGroup(fw, 12 / fw.length)}
                </Grid>
            </Paper>
        </Box>
    );
};

function renderPlayerGroup(players: Player[], span: number) {
    return players.map(player => (
        <Grid.Col span={Math.floor(span)} key={player.id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                width: '100%',
                maxWidth: '120px',
                textAlign: 'center'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Avatar src={`/path/to/player/image/${player.id}.jpg`} alt={player.name} size="lg" >{player.number}</Avatar>
                    <Text size="sm" weight={500} mt="xs" align="center">{player.name}</Text>
                </Box>

            </Box>
        </Grid.Col>
    ));
}

export default FormationView;
