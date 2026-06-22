/** Resolve final scores from fixture columns or synced metadata fallback. */

export interface FixtureScoresInput {
    homeScore?: number;
    awayScore?: number;
    metadata?: { homeScore?: number; awayScore?: number };
}

export function resolveFixtureScores(fix: FixtureScoresInput): { home: number; away: number } | null {
    const meta = fix.metadata;
    const hs = fix.homeScore ?? (typeof meta?.homeScore === 'number' ? meta.homeScore : undefined);
    const as = fix.awayScore ?? (typeof meta?.awayScore === 'number' ? meta.awayScore : undefined);
    if (
        typeof hs === 'number' &&
        typeof as === 'number' &&
        Number.isFinite(hs) &&
        Number.isFinite(as)
    ) {
        return { home: hs, away: as };
    }
    return null;
}

function asNullableScore(v: unknown): number | undefined {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
        const t = v.trim();
        if (t === '') return undefined;
        const n = Number(t);
        return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
}

/** Reads home/away goals from scalar columns first, then common metadata shapes. */
export function scoresFromFixtureRow(f: {
    homeScore?: unknown;
    awayScore?: unknown;
    metadata?: unknown;
}): { homeScore?: number; awayScore?: number } {
    let hs = asNullableScore(f.homeScore);
    let ascr = asNullableScore(f.awayScore);

    const metaRaw = f.metadata;
    const meta =
        metaRaw && typeof metaRaw === 'object' && metaRaw !== null
            ? (metaRaw as Record<string, unknown>)
            : undefined;

    if (meta !== undefined) {
        if (hs === undefined) {
            hs = asNullableScore(meta.homeScore ?? meta.home_score);
        }
        if (ascr === undefined) {
            ascr = asNullableScore(meta.awayScore ?? meta.away_score);
        }
    }

    if (hs === undefined || ascr === undefined) return {};

    return { homeScore: hs, awayScore: ascr };
}
