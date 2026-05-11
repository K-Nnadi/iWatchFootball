import type { Card, Goal } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';

/** Aligns with `MatchEvent` on the logs flow — built from `/fixture/:id/events`. */
export interface LogFixtureTimelineEvent {
    time: number;
    description: string;
    team: 'home' | 'away';
    type: 'goal' | 'card' | 'substitution' | 'other' | 'penalty';
    /** Set for `type: 'card'` so stats can split yellow vs red without parsing copy. */
    cardKind?: 'yellow' | 'red';
    playerId?: string;
    assistPlayerId?: string;
}

export interface FixtureEventsForLogPayload {
    goals: Goal[];
    cards: Card[];
    substitutions?: unknown[];
    players?: { id: number; name: string }[];
}

function teamSide(teamId: number | undefined, homeTeamId?: number, awayTeamId?: number): 'home' | 'away' {
    if (typeof teamId !== 'number') return 'home';
    if (typeof homeTeamId === 'number' && teamId === homeTeamId) return 'home';
    if (typeof awayTeamId === 'number' && teamId === awayTeamId) return 'away';
    return 'home';
}

function normalizeCardLabel(apiType: string): string {
    const k = apiType.toLowerCase();
    if (k.includes('yellow')) return 'Yellow card';
    if (k.includes('red')) return 'Red card';
    return apiType.trim() || 'Card';
}

/**
 * Builds leaderboards-compatible events from the match API (same endpoint as MatchEventsSection).
 */
export function buildLogFixtureTimelineEvents(
    payload: FixtureEventsForLogPayload,
    homeTeamId?: number,
    awayTeamId?: number,
): LogFixtureTimelineEvent[] {
    const names = new Map<number, string>();
    for (const p of payload.players ?? []) {
        if (typeof p.id === 'number' && p.name?.trim()) names.set(p.id, p.name.trim());
    }

    const resolve = (id: number) => names.get(id) ?? `#${id}`;

    const out: LogFixtureTimelineEvent[] = [];

    for (const g of payload.goals) {
        const minute = typeof g.minute === 'number' ? g.minute : 0;
        const scorer = resolve(g.scorerId);
        const assist =
            typeof g.assistantId === 'number' ? ` (assist: ${resolve(g.assistantId)})` : '';

        const tagBits = [
            g.penalty ? 'Penalty' : '',
            g.ownGoal ? 'Own goal' : '',
        ].filter(Boolean);
        const tagSuffix = tagBits.length ? ` (${tagBits.join(' · ')})` : '';

        out.push({
            time: minute,
            description: `Goal by ${scorer}${tagSuffix}${assist}`,
            team: teamSide(g.teamId, homeTeamId, awayTeamId),
            type: 'goal',
            playerId: String(g.scorerId),
            ...(typeof g.assistantId === 'number' ? { assistPlayerId: String(g.assistantId) } : {}),
        });
    }

    for (const c of payload.cards) {
        const label = normalizeCardLabel(c.type);
        const player = resolve(c.playerId);
        const t = `${c.type}`.toLowerCase();
        let cardKind: 'yellow' | 'red' | undefined;
        if (t.includes('red')) cardKind = 'red';
        else if (t.includes('yellow')) cardKind = 'yellow';

        out.push({
            time: typeof c.minute === 'number' ? c.minute : 0,
            description: `${label} · ${player}`,
            team: typeof c.teamId === 'number' ? teamSide(c.teamId, homeTeamId, awayTeamId) : 'home',
            type: 'card',
            ...(cardKind ? { cardKind } : {}),
            playerId: String(c.playerId),
        });
    }

    return out.sort((a, b) => a.time - b.time || a.description.localeCompare(b.description));
}
