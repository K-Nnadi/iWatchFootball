import React from 'react';
import {Avatar, Box, Paper, Text, Stack} from "@mantine/core";
import { Lineup, Player } from "./match.page";

/**
 * Formation pitch UI consumes normalized {@link Lineup} (players + buckets + formation string).
 * API payloads use TypeORM wire keys (`__playerLineups__`, `__player__`, …); map them with
 * `buildLineupFromRow` / `attachLineupsToFixtureSides` in `../../components/match/lineupFromApi`.
 * Wire typings: {@link import('../../components/match/lineupFromApi').ApiLineUpWire}.
 */

interface FormationViewProps {
    lineup: Lineup;
    isPredicted?: boolean;
}

function sortByPositionId(a: Player, b: Player): number {
    return (a.positionId ?? 99999) - (b.positionId ?? 99999);
}

function formationDigits(formation: string): number[] {
    return formation.split('-').map((s) => Number(String(s).trim())).filter((n) => Number.isFinite(n));
}

/** True when bands are exactly 4 + 2 + 2 + 2 (classic 4-2-2-2). */
function isFourTwoTwoTwo(formation: string): boolean {
    const p = formationDigits(formation);
    return p.length === 4 && p[0] === 4 && p[1] === 2 && p[2] === 2 && p[3] === 2;
}

/** Widen horizontal gap for the middle pair only (second "2") in 4-2-2-2. */
function midfieldPairRowGap(is4222: boolean, midfieldRowIndex: number): string {
    if (is4222 && midfieldRowIndex === 1) {
        return 'clamp(2.75rem, 20vw, 8rem)';
    }
    return 'clamp(0.5rem, 2vw, 1rem)';
}

/**
 * Lay out starters using **positionId order** for the whole outfield: sort non-GKs by `positionId`,
 * then cut rows using formation digits (e.g. 3-4-2-1 → 3 + 4 + 2 + 1 slots). Any extras stay on the
 * forward band so we never hide starters when DF/MF/FW buckets disagree with the formation label.
 */
function arrangePlayersByFormation(players: Player[], formation: string) {
    let formationParts = formation.split('-').map(Number).filter((n) => Number.isFinite(n));
    if (formationParts.length < 2) {
        formationParts = [4, 4, 2];
    }

    const gkCandidates = players.filter((p) => p.position === 'GK').sort(sortByPositionId);
    const gk: Player[] = gkCandidates.length > 0 ? [gkCandidates[0]] : [];

    const outfield = players.filter((p) => p.position !== 'GK').sort(sortByPositionId);

    let i = 0;
    const df = outfield.slice(i, (i += formationParts[0]));

    const mf: Player[][] = [];
    for (let k = 1; k < formationParts.length - 1; k++) {
        mf.push(outfield.slice(i, (i += formationParts[k])));
    }

    const fwTarget = formationParts[formationParts.length - 1];
    let fw = outfield.slice(i, (i += fwTarget));
    const overflow = outfield.slice(i);
    if (overflow.length > 0) {
        fw = [...fw, ...overflow];
    }

    return {
        gk,
        df,
        mf,
        fw,
    };
}

export const FormationView = ({ lineup, isPredicted }: FormationViewProps) => {
    const { gk, df, mf, fw } = arrangePlayersByFormation(lineup.players, lineup.formation);
    const is4222 = isFourTwoTwoTwo(lineup.formation);

    return (
        <Box>
            <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="md"
                style={{
                    backgroundColor: 'var(--modern-bg-tertiary)',
                    border: isPredicted ? '1px dashed var(--modern-border-color)' : '1px solid var(--modern-border-color)',
                    /** Grow with rows — avoids clipping forwards; page scrolls on small viewports */
                    minHeight: 'clamp(420px, 44vh, 560px)',
                    height: 'auto',
                    overflowX: 'hidden',
                    overflowY: 'visible',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    paddingBottom: 'clamp(1rem, 3vw, 1.75rem)',
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
                
                <Stack gap={6} align="center" style={{ marginBottom: 'clamp(0.65rem, 2vw, 1.25rem)', position: 'relative', zIndex: 1, flexShrink: 0 }}>
                    {lineup.managerName ? (
                        <Text
                            size="sm"
                            fw={600}
                            style={{
                                fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                                color: 'var(--modern-text-primary)',
                                textAlign: 'center',
                            }}
                        >
                            {lineup.managerName}
                        </Text>
                    ) : null}
                    <Text 
                        size="sm"
                        style={{
                            fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', 
                            textAlign: 'center', 
                            width: '100%', 
                            color: 'var(--modern-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600,
                        }}
                    >
                        {isPredicted ? 'Predicted Formation' : 'Formation'}: {lineup.formation}
                    </Text>
                </Stack>

                <Box style={{ 
                    position: 'relative', 
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(0.45rem, 1.75vw, 1rem)',
                    paddingBottom: 'clamp(0.35rem, 1.25vw, 0.65rem)',
                    flexShrink: 0,
                }}>
                    {/* Goalkeeper */}
                    <Box style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        {renderPlayerRow(gk)}
                    </Box>

                    {/* Defenders */}
                    <Box style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flexShrink: 0, flexWrap: 'wrap' }}>
                        {renderPlayerRow(df)}
                    </Box>

                    {/* Midfield rows */}
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.4rem, 1.5vw, 0.85rem)', flexShrink: 0 }}>
                        {mf.map((row, index) => (
                            <Box 
                                key={index} 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                gap: midfieldPairRowGap(is4222, index),
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
                justifyContent: 'flex-start',
                padding: 'clamp(0.25rem, 1.5vw, 0.75rem)',
                minWidth: 'clamp(52px, 14vw, 110px)',
                maxWidth: 'clamp(72px, 18vw, 140px)',
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
                        fontSize: 'clamp(0.55rem, 1.15vw, 0.8rem)', 
                        color: 'var(--modern-text-primary)',
                        width: '100%',
                        maxWidth: 'clamp(68px, 17vw, 132px)',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                        hyphens: 'auto',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        textAlign: 'center',
                    }}
                >
                    {player.name}
                </Text>
            </Stack>
        </Box>
    ));
}

export default FormationView;
