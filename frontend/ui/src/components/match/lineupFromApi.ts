import type { Lineup, Player } from './types';

/** Shape returned by GET /lineUp/query with relations (serialized; lazy fields become plain objects). */
export type ApiPlayerLineUpBundle = {
    playerId: number;
    isStarting: boolean;
    positionId?: number;
    metadata?: Record<string, unknown>;
    player?: { id: number; name: string; kitNumber?: number };
};

export type ApiLineUpBundle = {
    id: number;
    fixtureId: number;
    teamId: number;
    formation?: string;
    manager?: { name?: string; nickname?: string };
    playerLineups?: ApiPlayerLineUpBundle[];
};

/**
 * Wire JSON from `GET /lineUp/query` when TypeORM lazy relations hydrate — relation arrays/objects appear under `__name__`.
 * Match UI reads normalized {@link Lineup} via {@link buildLineupFromRow} / {@link attachLineupsToFixtureSides}.
 */
export type ApiLineUpWire = ApiLineUpBundle & {
    __playerLineups__?: unknown;
    __manager__?: { name?: string; nickname?: string };
};

/** Nested rows inside {@link ApiLineUpWire.__playerLineups__}. */
export type ApiPlayerLineUpWire = ApiPlayerLineUpBundle & {
    __player__?: { id?: number; name?: string; kitNumber?: number };
};

function readPlayerLineupsRaw(row: ApiLineUpBundle): unknown {
    const r = row as unknown as Record<string, unknown>;
    /** Canonical keys first; TypeORM lazy JSON uses `__playerLineups__` (double underscores). */
    return (
        r.playerLineups ??
        r.player_lineups ??
        r.__playerLineups__ ??
        r._playerLineups_
    );
}

/** Relations may serialize as a map or under snake_case; normalize to an array of rows. */
function normalizePlayerLineupsArray(raw: unknown): unknown[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw as object);
    return [];
}

function coercePlayerLineUp(pl: unknown): ApiPlayerLineUpBundle {
    if (!pl || typeof pl !== 'object') {
        return { playerId: 0, isStarting: false };
    }
    const p = pl as Record<string, unknown>;
    const meta =
        p.metadata && typeof p.metadata === 'object'
            ? (p.metadata as Record<string, unknown>)
            : undefined;
    const playerRaw = (p.player ?? p.Player ?? p.__player__ ?? p._player_) as Record<string, unknown> | undefined;
    const player =
        playerRaw && typeof playerRaw === 'object'
            ? {
                  id: Number(playerRaw.id),
                  name: String(playerRaw.name ?? ''),
                  kitNumber:
                      playerRaw.kitNumber != null ? Number(playerRaw.kitNumber as number) : undefined,
              }
            : undefined;

    return {
        playerId: Number(p.playerId ?? p.player_id ?? 0),
        isStarting: Boolean(p.isStarting ?? p.is_starting),
        positionId:
            p.positionId != null
                ? Number(p.positionId)
                : p.position_id != null
                  ? Number(p.position_id)
                  : undefined,
        metadata: meta as Record<string, unknown> | undefined,
        player: player?.id ? player : undefined,
    };
}

function lineupTeamId(row: ApiLineUpBundle): number {
    const r = row as unknown as Record<string, unknown>;
    return Number(r.teamId ?? r.team_id ?? NaN);
}

function coercedPlayerLineupsFromRow(row: ApiLineUpBundle): ApiPlayerLineUpBundle[] {
    return normalizePlayerLineupsArray(readPlayerLineupsRaw(row)).map(coercePlayerLineUp);
}

/** Axios/client may return wrapped or single-entity payloads instead of LineUp[]. */
export function normalizeLineUpQueryResult(raw: unknown): ApiLineUpBundle[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw as ApiLineUpBundle[];
    if (typeof raw === 'object' && raw !== null && 'data' in raw) {
        return normalizeLineUpQueryResult((raw as { data: unknown }).data);
    }
    if (typeof raw === 'object' && raw !== null && 'fixtureId' in raw && 'teamId' in raw) {
        return [raw as ApiLineUpBundle];
    }
    return [];
}

export function normalizePositionQueryResult(raw: unknown): { id: number; type: string }[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw as { id: number; type: string }[];
    if (typeof raw === 'object' && raw !== null && 'data' in raw) {
        return normalizePositionQueryResult((raw as { data: unknown }).data);
    }
    return [];
}

export function positionTypeToBucket(t: string): Player['position'] {
    switch (t) {
        case 'Goalkeeper':
            return 'GK';
        case 'Defender':
            return 'DF';
        case 'Midfielder':
            return 'MF';
        case 'Forward':
            return 'FW';
        default:
            return 'MF';
    }
}

export function collectPositionIds(lineUps: unknown): number[] {
    const s = new Set<number>();
    for (const lu of normalizeLineUpQueryResult(lineUps)) {
        for (const pl of coercedPlayerLineupsFromRow(lu)) {
            if (pl.positionId != null) s.add(pl.positionId);
        }
    }
    return Array.from(s);
}

function normalizeFormation(raw?: string): string {
    if (!raw || !String(raw).trim()) return '4-4-2';
    const s = String(raw).trim();
    if (s.includes('-')) return s;
    const digits = s.replace(/\D/g, '');
    return digits.length ? digits.split('').join('-') : '4-4-2';
}

export function buildLineupFromRow(
    row: ApiLineUpBundle,
    positionsById: Map<number, { type: string }>,
): Lineup | null {
    const pls = coercedPlayerLineupsFromRow(row);
    if (!pls.length) return null;

    const mapPl = (pl: ApiPlayerLineUpBundle): Player | null => {
        const posId = pl.positionId;
        const bucket =
            posId != null && positionsById.has(posId)
                ? positionTypeToBucket(positionsById.get(posId)!.type)
                : 'MF';
        const meta = pl.metadata ?? {};
        const jerseyRaw = meta.jerseyNumber;
        const jersey =
            typeof jerseyRaw === 'number'
                ? jerseyRaw
                : typeof jerseyRaw === 'string'
                  ? Number(jerseyRaw) || 0
                  : pl.player?.kitNumber != null
                    ? Number(pl.player.kitNumber)
                    : 0;

        if (pl.player?.id) {
            return {
                id: String(pl.player.id),
                name: pl.player.name,
                number: jersey,
                position: bucket,
                ...(posId != null ? { positionId: posId } : {}),
            };
        }
        if (pl.playerId > 0) {
            return {
                id: String(pl.playerId),
                name: jersey ? `#${jersey}` : `Player ${pl.playerId}`,
                number: jersey,
                position: bucket,
                ...(posId != null ? { positionId: posId } : {}),
            };
        }
        return null;
    };

    const starters = pls.filter((p) => p.isStarting).map(mapPl).filter(Boolean) as Player[];
    const bench = pls.filter((p) => !p.isStarting).map(mapPl).filter(Boolean) as Player[];

    const formation = normalizeFormation(row.formation);
    const r = row as unknown as Record<string, unknown>;
    const mgrRaw = (r.manager ?? r.__manager__ ?? r._manager_) as Record<string, unknown> | undefined;
    const managerName =
        (mgrRaw && typeof mgrRaw === 'object'
            ? mgrRaw.name != null
                ? String(mgrRaw.name)
                : mgrRaw.nickname != null
                  ? String(mgrRaw.nickname)
                  : undefined
            : undefined) ??
        row.manager?.name ??
        row.manager?.nickname;

    if (!starters.length) return null;

    return {
        formation,
        players: starters,
        substitutes: bench.length ? bench : undefined,
        managerName,
    };
}

export function attachLineupsToFixtureSides(
    lineUps: unknown,
    homeTeamId: number | undefined,
    awayTeamId: number | undefined,
    positionsById: Map<number, { type: string }>,
): { home?: Lineup; away?: Lineup } {
    const rows = normalizeLineUpQueryResult(lineUps);
    const homeRow =
        homeTeamId != null ? rows.find((l) => lineupTeamId(l) === Number(homeTeamId)) : undefined;
    const awayRow =
        awayTeamId != null ? rows.find((l) => lineupTeamId(l) === Number(awayTeamId)) : undefined;
    const home = homeRow ? buildLineupFromRow(homeRow, positionsById) ?? undefined : undefined;
    const away = awayRow ? buildLineupFromRow(awayRow, positionsById) ?? undefined : undefined;
    return { home, away };
}
