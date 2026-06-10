import React from 'react';
import {Avatar, Box, Paper, Text, Stack, UnstyledButton} from "@mantine/core";
import { useTranslation } from '../../i18n/useTranslation';
import { usePageTransition } from '../../hooks/usePageTransition';
import { isNavigablePlayerId, playerPageTransition } from '../../shared/playerNavigation';
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

function sortByTacticalOrder(a: Player, b: Player): number {
    const slotA = a.lineupSlotIndex;
    const slotB = b.lineupSlotIndex;
    if (slotA !== undefined && slotB !== undefined && slotA !== slotB) {
        return slotA - slotB;
    }
    if (slotA !== undefined && slotB === undefined) return -1;
    if (slotB !== undefined && slotA === undefined) return 1;

    const sbA = a.statsbombPositionId ?? 99999;
    const sbB = b.statsbombPositionId ?? 99999;
    if (sbA !== sbB) return sbA - sbB;

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
 * Lay out starters using StatsBomb tactical order when present (`lineupSlotIndex`, then
 * `statsbombPositionId`), else DB `positionId`. Rows are still sized by the formation label digits.
 */
function arrangePlayersByFormation(players: Player[], formation: string) {
    let formationParts = formation.split('-').map(Number).filter((n) => Number.isFinite(n));
    if (formationParts.length < 2) {
        formationParts = [4, 4, 2];
    }

    const gkCandidates = players.filter((p) => p.position === 'GK').sort(sortByTacticalOrder);
    const gk: Player[] = gkCandidates.length > 0 ? [gkCandidates[0]] : [];

    const outfield = players.filter((p) => p.position !== 'GK').sort(sortByTacticalOrder);

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
    const { t } = useTranslation();
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
                    minHeight: 'clamp(300px, 48vh, 560px)',
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
                        {isPredicted ? t('match.predictedFormation') : t('match.formation')}: {lineup.formation}
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
                    <FormationBand players={gk} />
                    <FormationBand players={df} />

                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.35rem, 1.35vw, 0.82rem)', flexShrink: 0 }}>
                        {mf.map((row, index) => (
                            <FormationBand
                                key={index}
                                players={row}
                                columnGap={midfieldPairRowGap(is4222, index)}
                            />
                        ))}
                    </Box>

                    {fw.length > 0 ? (
                        <FormationBand players={fw} />
                    ) : (
                        <Text size="sm" c="dimmed" style={{ padding: '1rem', textAlign: 'center' }}>
                            No forwards in formation
                        </Text>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

/** Default spacing between adjacent players inside one tactical line */
const FORMATION_BAND_GAP_DEFAULT = 'clamp(4px, 1.4vmin, 11px)';

/**
 * Single horizontal band — `repeat(n, minmax(0, 1fr))` keeps GK + back line + mids + FW visually correct
 * instead of wrapping into vertical columns on narrow screens.
 */
function FormationBand({
    players,
    columnGap,
}: {
    players: Player[];
    columnGap?: string;
}) {
    if (players.length === 0) return null;

    const n = players.length;
    return (
        <Box
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                columnGap: columnGap ?? FORMATION_BAND_GAP_DEFAULT,
                width: '100%',
                justifyItems: 'center',
                alignItems: 'start',
            }}
        >
            {players.map((player) => (
                <Box
                    key={player.id}
                    style={{
                        minWidth: 0,
                        width: '100%',
                        maxWidth: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <FormationChip player={player} />
                </Box>
            ))}
        </Box>
    );
}

/** Jersey circle + nametag — uniform circle size per pitch; grid columns only share width for layout */
function FormationChip({ player }: { player: Player }) {
    const { navigateWithTransition } = usePageTransition();
    const canNavigate = isNavigablePlayerId(player.id);
    const avatarSz = 'clamp(2rem, 8.25vmin, 3.2rem)';
    const jerseyFs = 'clamp(0.68rem, 3.6vmin, 1.02rem)';
    const labelFs = 'clamp(0.44rem, 2.45vmin, 0.78rem)';

    const handleNavigate = () => {
        if (!canNavigate) return;
        navigateWithTransition(`/player/${player.id}`, playerPageTransition);
    };

    const content = (
        <>
            <Avatar
                radius="xl"
                style={{
                    flexShrink: 0,
                    backgroundColor: 'var(--modern-bg-secondary)',
                    border: '2px solid var(--modern-lime)',
                    color: 'var(--modern-text-primary)',
                    fontWeight: 700,
                    fontSize: jerseyFs,
                    width: avatarSz,
                    height: avatarSz,
                }}
            >
                {player.number}
            </Avatar>
            <Text
                size="sm"
                fw={500}
                maw="100%"
                ta="center"
                style={{
                    fontSize: labelFs,
                    color: 'var(--modern-text-primary)',
                    lineHeight: 1.22,
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden',
                }}
            >
                {player.name}
            </Text>
        </>
    );

    if (!canNavigate) {
        return (
            <Stack align="center" gap={4} miw={0} maw="100%" px={4} pb={6} pt={2}>
                {content}
            </Stack>
        );
    }

    return (
        <UnstyledButton
            type="button"
            onClick={handleNavigate}
            aria-label={player.name}
            styles={{
                root: {
                    display: 'block',
                    width: '100%',
                    borderRadius: 8,
                    transition: 'background-color 0.15s ease, transform 0.15s ease',
                    '&:hover': {
                        backgroundColor: 'color-mix(in srgb, var(--modern-lime) 8%, transparent)',
                    },
                },
            }}
        >
            <Stack align="center" gap={4} miw={0} maw="100%" px={4} pb={6} pt={2}>
                {content}
            </Stack>
        </UnstyledButton>
    );
}

export default FormationView;
