import { resolveFixtureScores, type FixtureScoresInput } from './fixtureScores';

export type FixtureDecidedBy = 'regulation' | 'extra_time' | 'penalties';

export interface FixtureResultFields {
    winnerTeamId?: number;
    decidedBy?: FixtureDecidedBy;
    homePenaltyScore?: number;
    awayPenaltyScore?: number;
}

export interface FixtureResultInput extends FixtureScoresInput {
    homeTeamId?: number;
    awayTeamId?: number;
    metadata?: Record<string, unknown> | { homeScore?: number; awayScore?: number };
}

function asFiniteInt(v: unknown): number | undefined {
    if (v === null || v === undefined) return undefined;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

/** Read normalized or legacy provider fields from fixture metadata. */
export function parseFixtureResultFromMetadata(
    metadata: unknown,
    homeTeamId?: number,
    awayTeamId?: number,
): FixtureResultFields {
    const meta =
        metadata && typeof metadata === 'object' && metadata !== null
            ? (metadata as Record<string, unknown>)
            : {};

    let winnerTeamId = asFiniteInt(meta.winnerTeamId);
    let decidedBy = meta.decidedBy as FixtureDecidedBy | undefined;
    let homePenaltyScore = asFiniteInt(meta.homePenaltyScore);
    let awayPenaltyScore = asFiniteInt(meta.awayPenaltyScore);

    if (homePenaltyScore === undefined || awayPenaltyScore === undefined) {
        const score = meta.score as Record<string, unknown> | undefined;
        const pen = score?.penalty as Record<string, unknown> | undefined;
        if (pen) {
            homePenaltyScore = asFiniteInt(pen.home);
            awayPenaltyScore = asFiniteInt(pen.away);
        }
    }

    if (
        winnerTeamId === undefined &&
        homePenaltyScore !== undefined &&
        awayPenaltyScore !== undefined &&
        homePenaltyScore !== awayPenaltyScore &&
        homeTeamId !== undefined &&
        awayTeamId !== undefined
    ) {
        winnerTeamId = homePenaltyScore > awayPenaltyScore ? homeTeamId : awayTeamId;
        decidedBy = 'penalties';
    }

    if (winnerTeamId !== undefined && decidedBy === undefined && homePenaltyScore !== undefined) {
        decidedBy = 'penalties';
    }

    return { winnerTeamId, decidedBy, homePenaltyScore, awayPenaltyScore };
}

/** Match outcome for a club — uses shootout winner when FT scores are level. */
export function resolveFixtureOutcome(
    fix: FixtureResultInput,
    clubTeamId: number,
): 'win' | 'draw' | 'loss' | null {
    const result = parseFixtureResultFromMetadata(fix.metadata, fix.homeTeamId, fix.awayTeamId);
    if (result.winnerTeamId !== undefined) {
        return result.winnerTeamId === clubTeamId ? 'win' : 'loss';
    }

    const scores = resolveFixtureScores(fix);
    if (!scores || fix.homeTeamId === undefined || fix.awayTeamId === undefined) return null;

    if (scores.home === scores.away) return 'draw';
    const clubIsHome = fix.homeTeamId === clubTeamId;
    const ours = clubIsHome ? scores.home : scores.away;
    const theirs = clubIsHome ? scores.away : scores.home;
    if (ours > theirs) return 'win';
    if (ours < theirs) return 'loss';
    return 'draw';
}

export function isPenaltyDecided(result: FixtureResultFields): boolean {
    return result.decidedBy === 'penalties';
}
