export type FixtureDecidedBy = 'regulation' | 'extra_time' | 'penalties';

export interface FixtureResultFields {
  winnerTeamId?: number;
  decidedBy?: FixtureDecidedBy;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
}

function asFiniteInt(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

/** Normalized shootout / winner fields stored on fixture metadata. */
export function extractApiSportsFixtureResult(
  row: Record<string, unknown> | null | undefined,
  homeTeamId: number,
  awayTeamId: number,
): FixtureResultFields {
  const score = row?.score as Record<string, unknown> | undefined;
  const pen = score?.penalty as Record<string, unknown> | undefined;
  const teams = row?.teams as Record<string, unknown> | undefined;
  const homeTeam = teams?.home as Record<string, unknown> | undefined;
  const awayTeam = teams?.away as Record<string, unknown> | undefined;

  let homePenaltyScore = asFiniteInt(pen?.home);
  let awayPenaltyScore = asFiniteInt(pen?.away);

  let winnerTeamId: number | undefined;
  if (homeTeam?.winner === true) winnerTeamId = homeTeamId;
  else if (awayTeam?.winner === true) winnerTeamId = awayTeamId;
  else if (
    homePenaltyScore !== undefined &&
    awayPenaltyScore !== undefined &&
    homePenaltyScore !== awayPenaltyScore
  ) {
    winnerTeamId = homePenaltyScore > awayPenaltyScore ? homeTeamId : awayTeamId;
  }

  let decidedBy: FixtureDecidedBy | undefined;
  if (winnerTeamId !== undefined && homePenaltyScore !== undefined && awayPenaltyScore !== undefined) {
    decidedBy = 'penalties';
  } else if (winnerTeamId !== undefined) {
    decidedBy = 'regulation';
  }

  return { winnerTeamId, decidedBy, homePenaltyScore, awayPenaltyScore };
}

/** Derive penalty-shootout tally from StatsBomb period-5 scored penalties. */
export function deriveStatsBombPenaltyShootout(
  events: Array<{ period?: number; type?: { name?: string }; shot?: { outcome?: { name?: string } }; team?: { id?: number } }>,
  homeStatsBombTeamId: number,
  awayStatsBombTeamId: number,
  homeTeamId: number,
  awayTeamId: number,
): FixtureResultFields {
  const shootoutGoals = events.filter(
    (e) =>
      e.period === 5 &&
      e.type?.name === 'Shot' &&
      e.shot?.outcome?.name === 'Goal',
  );
  if (shootoutGoals.length === 0) return {};

  let homePenaltyScore = 0;
  let awayPenaltyScore = 0;
  for (const e of shootoutGoals) {
    const tid = e.team?.id;
    if (tid === homeStatsBombTeamId) homePenaltyScore += 1;
    else if (tid === awayStatsBombTeamId) awayPenaltyScore += 1;
  }

  if (homePenaltyScore === awayPenaltyScore) return { homePenaltyScore, awayPenaltyScore };

  const winnerTeamId = homePenaltyScore > awayPenaltyScore ? homeTeamId : awayTeamId;
  return {
    winnerTeamId,
    decidedBy: 'penalties',
    homePenaltyScore,
    awayPenaltyScore,
  };
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
