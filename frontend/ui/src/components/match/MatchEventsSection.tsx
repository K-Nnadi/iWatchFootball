import { useMemo } from 'react';
import { Box, Group, Loader, Paper, Stack, Text, UnstyledButton, VisuallyHidden } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { Card, Goal } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { clientInstance } from '@iWatchFootball/clients/client-instance';
import { usePageTransition } from '../../hooks/usePageTransition';
import { playerPageTransition } from '../../shared/playerNavigation';

export interface MatchEventsSectionProps {
    fixtureId: number;
    homeTeamId?: number;
    awayTeamId?: number;
    homeTeamName: string;
    awayTeamName: string;
}

interface FixtureEventsPayload {
    goals: Goal[];
    cards: Card[];
    substitutions: unknown[];
    players?: { id: number; name: string }[];
}

type TimelineKind = 'goal' | 'yellow_card' | 'red_card' | 'substitution';

type RowSide = 'home' | 'away' | 'unknown';

interface TimelineRow {
    reactKey: string;
    kind: TimelineKind;
    minuteSort: number;
    minuteLabel: string;
    primaryLine: string;
    primaryPlayerId?: number;
    primarySuffix?: string;
    subtitle?: string;
    assistPlayerId?: number;
    playerOutId?: number;
    playerInId?: number;
    accentColor?: string;
    side: RowSide;
    teamLabel?: string;
}

/** Fixed gutter for the center minute + spine (matches header spacer). */
const CENTER_SPINE_WIDTH = 52;

function formatMinute(minute?: number): string {
    if (typeof minute !== 'number' || !Number.isFinite(minute)) return '—';
    return `${minute}'`;
}

function resolveRowSide(teamId: number | undefined, homeTeamId?: number, awayTeamId?: number): RowSide {
    if (typeof teamId !== 'number') return 'unknown';
    if (typeof homeTeamId === 'number' && teamId === homeTeamId) return 'home';
    if (typeof awayTeamId === 'number' && teamId === awayTeamId) return 'away';
    return 'unknown';
}

function parseSubstitution(raw: unknown): {
    id: number;
    minute?: number;
    teamId: number;
    playerInId?: number;
    playerOutId?: number;
} | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    if (typeof o.id !== 'number' || typeof o.teamId !== 'number') return null;
    return {
        id: o.id,
        teamId: o.teamId,
        minute: typeof o.minute === 'number' ? o.minute : undefined,
        playerInId: typeof o.playerInId === 'number' ? o.playerInId : undefined,
        playerOutId: typeof o.playerOutId === 'number' ? o.playerOutId : undefined,
    };
}

function cardKind(type: string): TimelineKind | null {
    const t = type.toLowerCase();
    if (t.includes('yellow')) return 'yellow_card';
    if (t.includes('red')) return 'red_card';
    return null;
}

function kindOrder(kind: TimelineKind): number {
    switch (kind) {
        case 'goal':
            return 0;
        case 'yellow_card':
        case 'red_card':
            return 1;
        case 'substitution':
            return 2;
        default:
            return 9;
    }
}

function sortRows(list: TimelineRow[]): TimelineRow[] {
    return [...list].sort((a, b) => {
        if (a.minuteSort !== b.minuteSort) return a.minuteSort - b.minuteSort;
        const ko = kindOrder(a.kind) - kindOrder(b.kind);
        if (ko !== 0) return ko;
        return a.reactKey.localeCompare(b.reactKey);
    });
}

function groupRowsByMinute(sortedRows: TimelineRow[]): TimelineRow[][] {
    const buckets: TimelineRow[][] = [];
    let bucket: TimelineRow[] = [];
    let lastKey: number | null = null;

    for (const row of sortedRows) {
        if (lastKey !== row.minuteSort) {
            if (bucket.length) buckets.push(bucket);
            bucket = [row];
            lastKey = row.minuteSort;
        } else {
            bucket.push(row);
        }
    }
    if (bucket.length) buckets.push(bucket);
    return buckets;
}

function sideLabel(
    teamId: number,
    homeTeamId: number | undefined,
    awayTeamId: number | undefined,
    homeTeamName: string,
    awayTeamName: string,
): string {
    if (typeof homeTeamId === 'number' && teamId === homeTeamId) return homeTeamName;
    if (typeof awayTeamId === 'number' && teamId === awayTeamId) return awayTeamName;
    return '';
}

function ariaKind(kind: TimelineKind): string {
    switch (kind) {
        case 'goal':
            return 'Goal';
        case 'yellow_card':
            return 'Yellow card';
        case 'red_card':
            return 'Red card';
        case 'substitution':
            return 'Substitution';
        default:
            return 'Event';
    }
}

function EventKindGlyph({ kind, accentColor }: { kind: TimelineKind; accentColor?: string }) {
    const disc = {
        width: 10,
        height: 10,
        borderRadius: '50%',
        flexShrink: 0,
        marginTop: 5,
    } as const;

    switch (kind) {
        case 'goal':
            return <Box style={{ ...disc, backgroundColor: accentColor ?? '#00c853' }} aria-hidden />;
        case 'yellow_card':
            return <Box style={{ ...disc, backgroundColor: accentColor ?? '#fbc02d' }} aria-hidden />;
        case 'red_card':
            return <Box style={{ ...disc, backgroundColor: accentColor ?? '#e53935' }} aria-hidden />;
        case 'substitution':
            return (
                <Text
                    component="span"
                    fw={900}
                    size="sm"
                    c="dimmed"
                    style={{ lineHeight: 1, marginTop: 4, flexShrink: 0 }}
                    aria-hidden
                >
                    ⇄
                </Text>
            );
        default:
            return null;
    }
}

function PlayerEventLink({
    playerId,
    label,
    alignEnd,
}: {
    playerId: number;
    label: string;
    alignEnd?: boolean;
}) {
    const { navigateWithTransition } = usePageTransition();

    return (
        <UnstyledButton
            type="button"
            onClick={() => navigateWithTransition(`/player/${playerId}`, playerPageTransition)}
            styles={{
                root: {
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    color: 'var(--modern-text-primary)',
                    fontWeight: 700,
                    fontSize: 'var(--mantine-font-size-sm)',
                    lineHeight: 1.35,
                    textAlign: alignEnd ? 'right' : 'left',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    '&:hover': {
                        color: 'var(--modern-lime)',
                    },
                },
            }}
        >
            {label}
        </UnstyledButton>
    );
}

function EventPrimaryLine({ row, alignEnd }: { row: TimelineRow; alignEnd?: boolean }) {
    if (row.kind === 'substitution' && (row.playerOutId != null || row.playerInId != null)) {
        const parts = row.primaryLine.split('→').map((s) => s.trim());
        const offName = parts[0] ?? '—';
        const onName = parts[1] ?? '—';

        return (
            <Text
                fw={700}
                size="sm"
                ta={alignEnd ? 'right' : 'left'}
                style={{
                    color: 'var(--modern-text-primary)',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                }}
            >
                {row.playerOutId != null ? (
                    <PlayerEventLink playerId={row.playerOutId} label={offName} alignEnd={alignEnd} />
                ) : (
                    offName
                )}
                {' → '}
                {row.playerInId != null ? (
                    <PlayerEventLink playerId={row.playerInId} label={onName} alignEnd={alignEnd} />
                ) : (
                    onName
                )}
            </Text>
        );
    }

    if (row.primaryPlayerId != null) {
        const suffix = row.primarySuffix ?? '';
        return (
            <Text
                fw={700}
                size="sm"
                ta={alignEnd ? 'right' : 'left'}
                lineClamp={4}
                style={{
                    color: 'var(--modern-text-primary)',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                }}
            >
                <PlayerEventLink
                    playerId={row.primaryPlayerId}
                    label={row.primaryLine}
                    alignEnd={alignEnd}
                />
                {suffix}
            </Text>
        );
    }

    return (
        <Text
            fw={700}
            size="sm"
            ta={alignEnd ? 'right' : 'left'}
            lineClamp={4}
            style={{
                color: 'var(--modern-text-primary)',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
            }}
        >
            {row.primaryLine}
        </Text>
    );
}

function EventSubtitle({ row, alignEnd }: { row: TimelineRow; alignEnd?: boolean }) {
    if (!row.subtitle) return null;

    if (row.assistPlayerId != null && row.subtitle.startsWith('↳ ')) {
        const assistName = row.subtitle.slice(2);
        return (
            <Text size="xs" c="dimmed" ta={alignEnd ? 'right' : 'left'}>
                ↳{' '}
                <PlayerEventLink playerId={row.assistPlayerId} label={assistName} alignEnd={alignEnd} />
            </Text>
        );
    }

    return (
        <Text size="xs" c="dimmed" ta={alignEnd ? 'right' : 'left'}>
            {row.subtitle}
        </Text>
    );
}

function EventSegment({
    row,
    showTeamLabel,
    alignEnd,
}: {
    row: TimelineRow;
    showTeamLabel?: boolean;
    alignEnd?: boolean;
}) {
    const stack = (
        <Stack gap={2} style={{ minWidth: 0 }} align={alignEnd ? 'flex-end' : 'stretch'}>
            {showTeamLabel && row.teamLabel ? (
                <Text size="xs" c="dimmed" lh={1.2} ta={alignEnd ? 'right' : 'left'}>
                    {row.teamLabel}
                </Text>
            ) : null}
            <EventPrimaryLine row={row} alignEnd={alignEnd} />
            <EventSubtitle row={row} alignEnd={alignEnd} />
        </Stack>
    );

    const glyph = <EventKindGlyph kind={row.kind} accentColor={row.accentColor} />;

    return (
        <Group gap={8} wrap="nowrap" align="flex-start">
            <VisuallyHidden>
                {ariaKind(row.kind)}
                {showTeamLabel && row.teamLabel ? `, ${row.teamLabel}` : ''}: {row.primaryLine}
                {row.subtitle ? `. ${row.subtitle}` : ''}
            </VisuallyHidden>
            {alignEnd ? (
                <>
                    {stack}
                    {glyph}
                </>
            ) : (
                <>
                    {glyph}
                    {stack}
                </>
            )}
        </Group>
    );
}

function TeamColumnHeaders({ homeTeamName, awayTeamName }: { homeTeamName: string; awayTeamName: string }) {
    const gridCols = `minmax(0, 1fr) ${CENTER_SPINE_WIDTH}px minmax(0, 1fr)`;
    return (
        <Box
            style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                alignItems: 'center',
                columnGap: 0,
                paddingBottom: 10,
                borderBottom: '1px solid var(--modern-border-color)',
                marginBottom: 4,
            }}
        >
            <Box style={{ minWidth: 0, paddingRight: 10 }}>
                <Text fw={800} size="xs" tt="uppercase" truncate ta="right" style={{ color: 'var(--modern-text-secondary)', letterSpacing: '0.04em' }}>
                    {homeTeamName}
                </Text>
            </Box>
            <Box style={{ width: CENTER_SPINE_WIDTH }} />
            <Box style={{ minWidth: 0, paddingLeft: 10 }}>
                <Text fw={800} size="xs" tt="uppercase" truncate ta="left" style={{ color: 'var(--modern-text-secondary)', letterSpacing: '0.04em' }}>
                    {awayTeamName}
                </Text>
            </Box>
        </Box>
    );
}

/** Same-minute events stack vertically so long substitution lines do not collide (no middot separators). */
function SegmentsColumn({
    rows,
    variant,
    showTeamLabel,
}: {
    rows: TimelineRow[];
    variant: 'home' | 'away' | 'center';
    showTeamLabel?: boolean;
}) {
    const alignItems =
        variant === 'home' ? 'flex-end' : variant === 'away' ? 'flex-start' : 'center';
    const alignEnd = variant === 'away';

    return (
        <Stack gap={10} align={alignItems} style={{ minWidth: 0, width: '100%' }}>
            {rows.map((row) => (
                <Box
                    key={row.reactKey}
                    px={10}
                    py={8}
                    style={{
                        maxWidth: '100%',
                        borderRadius: 10,
                        backgroundColor: 'color-mix(in srgb, var(--modern-border-color) 14%, var(--modern-card-bg))',
                        border: '1px solid var(--modern-border-color)',
                        boxSizing: 'border-box',
                    }}
                >
                    <EventSegment row={row} alignEnd={alignEnd} showTeamLabel={showTeamLabel} />
                </Box>
            ))}
        </Stack>
    );
}

/** Minute chip on the center axis (continuous line drawn by parent timeline wrapper). */
function CenterMinuteChip({ label }: { label: string }) {
    return (
        <Box
            style={{
                width: CENTER_SPINE_WIDTH,
                flexShrink: 0,
                alignSelf: 'stretch',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 6,
                position: 'relative',
                zIndex: 2,
            }}
        >
            <Box
                style={{
                    backgroundColor: 'var(--modern-card-bg)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: '1px solid var(--modern-border-color)',
                    boxShadow: '0 1px 8px color-mix(in srgb, var(--modern-text-primary) 8%, transparent)',
                }}
            >
                <Text fw={800} size="sm" ta="center" style={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>
                    {label}
                </Text>
            </Box>
        </Box>
    );
}

/** One chronological row: home | center chip | away — grid keeps the spine geometrically centered. */
function CombinedMinuteRow({ group }: { group: TimelineRow[] }) {
    const minuteLabel = group[0]?.minuteLabel ?? '—';
    const ordered = sortRows(group);
    const home = ordered.filter((r) => r.side === 'home');
    const away = ordered.filter((r) => r.side === 'away');
    const unknown = ordered.filter((r) => r.side === 'unknown');

    const gridCols = `minmax(0, 1fr) ${CENTER_SPINE_WIDTH}px minmax(0, 1fr)`;

    const onlyUnknown = home.length === 0 && away.length === 0 && unknown.length > 0;

    if (onlyUnknown) {
        return (
            <Stack gap={10} pb="md">
                <Box
                    style={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        alignItems: 'center',
                        columnGap: 0,
                    }}
                >
                    <Box />
                    <CenterMinuteChip label={minuteLabel} />
                    <Box />
                </Box>
                <Box style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <SegmentsColumn rows={unknown} variant="center" showTeamLabel />
                </Box>
            </Stack>
        );
    }

    return (
        <Stack gap={10} pb="md">
            <Box
                style={{
                    display: 'grid',
                    gridTemplateColumns: gridCols,
                    alignItems: 'center',
                    columnGap: 0,
                }}
            >
                <Box style={{ minWidth: 0, paddingRight: 10 }}>
                    {home.length === 0 ? <Box aria-hidden style={{ minHeight: 1 }} /> : <SegmentsColumn rows={home} variant="home" />}
                </Box>
                <CenterMinuteChip label={minuteLabel} />
                <Box style={{ minWidth: 0, paddingLeft: 10 }}>
                    {away.length === 0 ? <Box aria-hidden style={{ minHeight: 1 }} /> : <SegmentsColumn rows={away} variant="away" />}
                </Box>
            </Box>
            {unknown.length > 0 ? (
                <Box style={{ paddingLeft: 24, paddingRight: 24 }}>
                    <SegmentsColumn rows={unknown} variant="center" showTeamLabel />
                </Box>
            ) : null}
        </Stack>
    );
}

export function MatchEventsSection({
    fixtureId,
    homeTeamId,
    awayTeamId,
    homeTeamName,
    awayTeamName,
}: MatchEventsSectionProps) {
    const eventsQuery = useQuery({
        queryKey: ['/fixture', fixtureId, 'events'],
        queryFn: async ({ signal }) =>
            clientInstance<FixtureEventsPayload>({
                url: `/fixture/${fixtureId}/events`,
                method: 'GET',
                signal,
            }),
        enabled: Number.isFinite(fixtureId) && fixtureId > 0,
    });

    const nameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const p of eventsQuery.data?.players ?? []) {
            if (typeof p.id === 'number' && p.name?.trim()) map.set(p.id, p.name.trim());
        }
        return map;
    }, [eventsQuery.data]);

    const combinedBuckets = useMemo(() => {
        const payload = eventsQuery.data;
        const collected: TimelineRow[] = [];

        if (!payload) return [];

        const resolve = (id: number) => nameById.get(id) ?? `Player #${id}`;

        for (const g of payload.goals) {
            const side = resolveRowSide(typeof g.teamId === 'number' ? g.teamId : undefined, homeTeamId, awayTeamId);
            const team =
                typeof g.teamId === 'number'
                    ? sideLabel(g.teamId, homeTeamId, awayTeamId, homeTeamName, awayTeamName)
                    : '';
            const tagBits = [g.penalty && 'Penalty', g.ownGoal && 'Own goal'].filter(Boolean) as string[];
            const tagSuffix = tagBits.length ? ` (${tagBits.join(' · ')})` : '';
            const subtitle =
                typeof g.assistantId === 'number' ? `↳ ${resolve(g.assistantId)}` : undefined;
            collected.push({
                reactKey: `goal-${g.id}`,
                kind: 'goal',
                minuteSort: typeof g.minute === 'number' ? g.minute : 10_000,
                minuteLabel: formatMinute(g.minute),
                primaryLine: resolve(g.scorerId),
                primaryPlayerId: typeof g.scorerId === 'number' ? g.scorerId : undefined,
                primarySuffix: tagSuffix,
                subtitle,
                assistPlayerId: typeof g.assistantId === 'number' ? g.assistantId : undefined,
                accentColor: '#00c853',
                side,
                teamLabel: side === 'unknown' && team ? team : undefined,
            });
        }

        for (const c of payload.cards) {
            const k = cardKind(c.type);
            if (!k) continue;
            const tid = typeof c.teamId === 'number' ? c.teamId : undefined;
            const side = resolveRowSide(tid, homeTeamId, awayTeamId);
            const teamName =
                typeof c.teamId === 'number'
                    ? sideLabel(c.teamId, homeTeamId, awayTeamId, homeTeamName, awayTeamName)
                    : '';
            collected.push({
                reactKey: `card-${c.id}`,
                kind: k,
                minuteSort: typeof c.minute === 'number' ? c.minute : 10_000,
                minuteLabel: formatMinute(c.minute),
                primaryLine: resolve(c.playerId),
                primaryPlayerId: typeof c.playerId === 'number' ? c.playerId : undefined,
                accentColor: k === 'red_card' ? '#e53935' : '#fbc02d',
                side,
                teamLabel: side === 'unknown' && teamName ? teamName : undefined,
            });
        }

        for (const raw of payload.substitutions) {
            const s = parseSubstitution(raw);
            if (!s) continue;
            const side = resolveRowSide(s.teamId, homeTeamId, awayTeamId);
            const team = sideLabel(s.teamId, homeTeamId, awayTeamId, homeTeamName, awayTeamName);
            const offId = s.playerOutId;
            const onId = s.playerInId;
            const offName = typeof offId === 'number' ? resolve(offId) : '—';
            const onName = typeof onId === 'number' ? resolve(onId) : '—';
            collected.push({
                reactKey: `sub-${s.id}`,
                kind: 'substitution',
                minuteSort: typeof s.minute === 'number' ? s.minute : 10_000,
                minuteLabel: formatMinute(s.minute),
                primaryLine: `${offName} → ${onName}`,
                playerOutId: offId,
                playerInId: onId,
                accentColor: 'var(--modern-text-secondary)',
                side,
                teamLabel: side === 'unknown' && team ? team : undefined,
            });
        }

        return groupRowsByMinute(sortRows(collected));
    }, [eventsQuery.data, homeTeamId, awayTeamId, homeTeamName, awayTeamName, nameById]);

    const loading = eventsQuery.isLoading;
    const hasRows = combinedBuckets.length > 0;

    return (
        <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="lg"
            withBorder
            style={{ backgroundColor: 'var(--modern-card-bg)', border: '1px solid var(--modern-border-color)' }}
        >
            <Stack gap="md">
                <Text fw={800} size="lg" style={{ color: 'var(--modern-text-primary)' }}>
                    Match events
                </Text>
                <Text size="sm" c="dimmed">
                    Events are grouped by minute on a fixed center axis; several events at the same time stack so lines stay
                    readable. ⇄ is a substitution.
                </Text>

                {loading && (
                    <Group justify="center" py="lg">
                        <Loader size="sm" />
                    </Group>
                )}

                {!loading && eventsQuery.isError && (
                    <Text size="sm" c="dimmed">
                        Could not load match events.
                    </Text>
                )}

                {!loading && eventsQuery.isSuccess && !hasRows && (
                    <Text size="sm" c="dimmed">
                        No recorded events for this match yet.
                    </Text>
                )}

                {!loading && hasRows && (
                    <Box style={{ position: 'relative' }}>
                        <Box
                            aria-hidden
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: 6,
                                bottom: 10,
                                width: 2,
                                transform: 'translateX(-50%)',
                                borderRadius: 2,
                                backgroundColor: 'color-mix(in srgb, var(--modern-border-color) 45%, transparent)',
                                zIndex: 0,
                                pointerEvents: 'none',
                            }}
                        />
                        <Stack gap={0} style={{ position: 'relative', zIndex: 1 }}>
                            <TeamColumnHeaders homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
                            <Stack gap={0}>
                                {combinedBuckets.map((group) => (
                                    <CombinedMinuteRow key={group.map((r) => r.reactKey).join('|')} group={group} />
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
}
