export const LIVE_FIXTURE_POLL_MS = 20_000;
export const LIVE_MATCH_DETAIL_POLL_MS = 15_000;

export type LiveClockMeta = {
    elapsed?: number;
    extra?: number;
    short?: string;
    description?: string;
    label?: string;
};

export function readLiveClock(metadata: unknown): LiveClockMeta | undefined {
    if (!metadata || typeof metadata !== 'object') return undefined;
    const clock = (metadata as Record<string, unknown>).liveClock;
    if (!clock || typeof clock !== 'object') return undefined;
    const c = clock as Record<string, unknown>;
    return {
        elapsed: typeof c.elapsed === 'number' && Number.isFinite(c.elapsed) ? c.elapsed : undefined,
        extra: typeof c.extra === 'number' && Number.isFinite(c.extra) ? c.extra : undefined,
        short: typeof c.short === 'string' ? c.short : undefined,
        description: typeof c.description === 'string' ? c.description : undefined,
        label: typeof c.label === 'string' ? c.label : undefined,
    };
}

export function formatKickoffTime(iso?: string): string {
    if (!iso) return '–';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '–';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** Match-list / header clock: 67', HT, ET, FT, LIVE, or kickoff time. */
export function formatLiveClockLabel(opts: {
    status?: string;
    metadata?: unknown;
    kickoffIso?: string;
}): string {
    const clock = readLiveClock(opts.metadata);
    if (clock?.label?.trim()) return clock.label.trim();

    const short = String(clock?.short ?? '').toUpperCase();
    if (short === 'HT') return 'HT';
    if (short === 'BT') return 'BT';
    if (short === 'P' || short === 'PEN') return 'PEN';
    if (short === 'ET') {
        if (typeof clock?.elapsed === 'number') return `${clock.elapsed}'`;
        return 'ET';
    }
    if (['FT', 'AET'].includes(short) || opts.status === 'Completed') return 'FT';

    if (typeof clock?.elapsed === 'number') {
        if (typeof clock.extra === 'number' && clock.extra > 0) {
            return `${clock.elapsed}+${clock.extra}'`;
        }
        return `${clock.elapsed}'`;
    }

    if (clock?.description?.trim()) return clock.description.trim();
    if (opts.status === 'Live') return 'LIVE';
    return formatKickoffTime(opts.kickoffIso);
}

export function isLiveFixtureStatus(status?: string): boolean {
    return status === 'Live';
}
