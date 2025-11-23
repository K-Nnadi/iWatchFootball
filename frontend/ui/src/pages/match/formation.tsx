import React from 'react';
import {Avatar, Box, Paper, Text, Stack} from "@mantine/core";
import { Lineup, Player } from "./match.page";

interface FormationViewProps {
    lineup: Lineup;
    isPredicted?: boolean;
}

function arrangePlayersByFormation(players: Player[], formation: string) {
    const formationParts = formation.split('-').map(Number);
    
    // Separate players by position for easier access
    const gk = players.filter(p => p.position === 'GK');
    const df = players.filter(p => p.position === 'DF');
    const mf = players.filter(p => p.position === 'MF');
    const fw = players.filter(p => p.position === 'FW');
    
    // Build formation structure based on formation string
    // Format: "4-2-3-1" means: 4 defenders, 2 midfielders, 3 midfielders, 1 forward
    const rows: Player[][] = [];
    
    // Goalkeeper (always first, always 1)
    if (gk.length > 0) {
        rows.push([gk[0]]);
    } else {
        rows.push([]);
    }
    
    // Defenders (first number in formation)
    const defendersCount = formationParts[0];
    rows.push(df.slice(0, defendersCount));
    
    // Midfield rows (all numbers between first and last)
    const midfieldRows = formationParts.slice(1, -1);
    let mfIndex = 0;
    midfieldRows.forEach(count => {
        const row = mf.slice(mfIndex, mfIndex + count);
        rows.push(row);
        mfIndex += count;
    });
    
    // Forwards (last number in formation)
    const forwardsCount = formationParts[formationParts.length - 1];
    rows.push(fw.slice(0, forwardsCount));
    
    // Return structured data
    const result = {
        gk: rows[0] || [],
        df: rows[1] || [],
        mf: rows.slice(2, -1).filter(row => row.length > 0), // All rows except first (GK), second (DF), and last (FW)
        fw: rows[rows.length - 1] || []
    };
    
    // Debug log
    console.log('Formation arrangement:', {
        formation,
        totalPlayers: players.length,
        arranged: result.gk.length + result.df.length + result.mf.reduce((sum, row) => sum + row.length, 0) + result.fw.length,
        breakdown: {
            gk: result.gk.length,
            df: result.df.length,
            mf: result.mf.map(r => r.length),
            fw: result.fw.length
        }
    });
    
    return result;
}

export const FormationView = ({ lineup, isPredicted }: FormationViewProps) => {
    const { gk, df, mf, fw } = arrangePlayersByFormation(lineup.players, lineup.formation);
    
    // Debug: Log to ensure all players are accounted for
    const totalPlayers = gk.length + df.length + mf.reduce((sum, row) => sum + row.length, 0) + fw.length;
    const expectedPlayers = 11;
    
    if (totalPlayers !== expectedPlayers) {
        console.warn(`Formation mismatch: Expected ${expectedPlayers} players, got ${totalPlayers}`, {
            gk: gk.length,
            df: df.length,
            mf: mf.map(row => row.length),
            fw: fw.length,
            formation: lineup.formation
        });
    }

    return (
        <Box>
            <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="md"
                style={{
                    backgroundColor: 'var(--modern-bg-tertiary)',
                    border: isPredicted ? '1px dashed var(--modern-border-color)' : '1px solid var(--modern-border-color)',
                    height: 'clamp(500px, 60vh, 600px)',
                    minHeight: 'clamp(500px, 60vh, 600px)',
                    maxHeight: 'clamp(500px, 60vh, 600px)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Pitch background effect */}
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 50%, rgba(0, 255, 136, 0.05) 100%)',
                        pointerEvents: 'none',
                    }}
                />
                
                <Text 
                    size="sm"
                    style={{
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', 
                        textAlign: 'center', 
                        width: '100%', 
                        marginBottom: 'clamp(1rem, 3vw, 2rem)',
                        color: 'var(--modern-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {isPredicted ? 'Predicted Formation' : 'Formation'}: {lineup.formation}
                </Text>

                <Box style={{ 
                    position: 'relative', 
                    zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    {/* Goalkeeper */}
                    <Box style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        {renderPlayerRow(gk)}
                    </Box>

                    {/* Defenders */}
                    <Box style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flexShrink: 0, flexWrap: 'wrap' }}>
                        {renderPlayerRow(df)}
                    </Box>

                    {/* Midfield rows - flex grow to fill space */}
                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
                        {mf.map((row, index) => (
                            <Box 
                                key={index} 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    gap: 'clamp(0.5rem, 2vw, 1rem)',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {renderPlayerRow(row)}
                            </Box>
                        ))}
                    </Box>

                    {/* Forwards */}
                    <Box style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flexShrink: 0, flexWrap: 'wrap' }}>
                        {fw.length > 0 ? renderPlayerRow(fw) : (
                            <Text size="sm" c="dimmed" style={{ padding: '1rem' }}>
                                No forwards in formation
                            </Text>
                        )}
                    </Box>
                    
                    {/* Debug info - remove in production */}
                    {totalPlayers !== expectedPlayers && (
                        <Text size="xs" c="red" ta="center" mt="md">
                            Warning: {totalPlayers} players displayed (expected {expectedPlayers})
                        </Text>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

function renderPlayerRow(players: Player[]) {
    return players.map(player => (
        <Box
            key={player.id}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(0.25rem, 1.5vw, 0.75rem)',
                minWidth: 'clamp(50px, 12vw, 100px)',
                maxWidth: 'clamp(60px, 18vw, 120px)',
                textAlign: 'center',
            }}
        >
            <Stack align="center" gap={4}>
                <Avatar
                    size="lg"
                    radius="xl"
                    style={{
                        backgroundColor: 'var(--modern-bg-secondary)',
                        border: '2px solid var(--modern-lime)',
                        color: 'var(--modern-text-primary)',
                        fontWeight: 700,
                        fontSize: 'clamp(0.65rem, 1.5vw, 1.1rem)',
                        width: 'clamp(2.5rem, 5vw, 3.5rem)',
                        height: 'clamp(2.5rem, 5vw, 3.5rem)',
                    }}
                >
                    {player.number}
                </Avatar>
                <Text 
                    size="sm"
                    fw={500}
                    style={{
                        fontSize: 'clamp(0.6rem, 1.2vw, 0.875rem)', 
                        color: 'var(--modern-text-primary)',
                        maxWidth: 'clamp(50px, 12vw, 100px)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                    }}
                >
                    {player.name}
                </Text>
            </Stack>
        </Box>
    ));
}

export default FormationView;
