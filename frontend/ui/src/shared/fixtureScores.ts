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
