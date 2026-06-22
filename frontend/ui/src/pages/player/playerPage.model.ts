import type { PlayerMatchRow, PlayerSeasonSummary } from '../../shared/api/playerMatches.api';

export interface PlayerTrait {
    label: string;
    pct: number;
}

export interface TransferPoint {
    year: number;
    valueM: number;
}

export interface CareerRow {
    club: string;
    crest?: string;
    teamId?: number;
    from: string;
    to: string;
    apps: number;
    goals: number;
}

export interface SeasonSummary {
    competition: string;
    goals: number;
    assists: number;
    started: number;
    matches: number;
    minutes: number;
    rating: number;
    yellowCards: number;
    redCards: number;
}

export interface StatRow {
    label: string;
    total: number | string;
    per90?: number | string;
}

export interface StatCategory {
    title: string;
    rows: StatRow[];
}

export interface RecentMatch {
    date: string;
    gameweek?: string;
    opponent: string;
    opponentCode?: string;
    home: boolean;
    result: 'W' | 'D' | 'L';
    score: string;
    goals: number;
    assists: number;
    minutes: number;
    rating: number;
    fixtureId?: number;
}

export interface UpcomingFixture {
    date: string;
    opponent: string;
    opponentCode?: string;
    home: boolean;
    fixtureId?: number;
}

export interface HighlightStat {
    labelKey: string;
    value: string;
    contextKey: string;
    contextParams?: Record<string, string | number>;
}

export interface ShotMapData {
    shots: number;
    goals: number;
    xg: number;
    onTargetPct: number;
    points: { x: number; y: number; goal: boolean }[];
}

export interface PlayerViewModel {
    id: string;
    name: string;
    photoUrl?: string;
    shirtNumber?: number;
    heightCm?: number;
    preferredFoot?: string;
    age: number;
    dateOfBirth?: string;
    nationality: string;
    primaryPosition: string;
    otherPositions: string[];
    marketValue?: string;
    highestValue?: string;
    contractUntil?: string;
    clubTeam?: { id: number; name: string; crest?: string };
    traits: PlayerTrait[];
    highlights: HighlightStat[];
    transferHistory: TransferPoint[];
    career: CareerRow[];
    season: SeasonSummary;
    recentMatches: RecentMatch[];
    upcomingFixtures: UpcomingFixture[];
    shotMap: ShotMapData;
    performance: StatCategory[];
}

export function buildHighlightStats(s: SeasonSummary, position: string): HighlightStat[] {
    const minsPerMatch = s.matches > 0 ? Math.round(s.minutes / s.matches) : 0;
    const role = position.toLowerCase();

    const goalsCtxKey =
        s.goals >= 20 ? 'player.leadingScorer' : s.goals >= 10 ? 'player.top10League' : 'player.thisSeason';
    const assistsCtxKey = s.assists >= 15 ? 'player.topCreator' : 'player.thisSeason';
    const ratingCtxKey =
        s.rating >= 8 ? 'player.eliteForm' : s.rating >= 7.5 ? 'player.strongForm' : 'player.matchAverage';

    if (/back|defender|goalkeeper/i.test(role)) {
        return [
            {
                labelKey: 'player.cleanSheets',
                value: String(Math.round(s.matches * 0.35)),
                contextKey: 'player.thisSeason',
            },
            { labelKey: 'player.rating', value: s.rating.toFixed(1), contextKey: ratingCtxKey },
            {
                labelKey: 'player.minsPerMatch',
                value: String(minsPerMatch),
                contextKey: 'player.appearancesCount',
                contextParams: { count: s.matches },
            },
            {
                labelKey: 'player.cards',
                value: String(s.yellowCards + s.redCards),
                contextKey: 'player.discipline',
            },
        ];
    }

    return [
        { labelKey: 'player.goals', value: String(s.goals), contextKey: goalsCtxKey },
        { labelKey: 'player.assists', value: String(s.assists), contextKey: assistsCtxKey },
        { labelKey: 'player.rating', value: s.rating.toFixed(1), contextKey: ratingCtxKey },
        {
            labelKey: 'player.minsPerMatch',
            value: String(minsPerMatch),
            contextKey: 'player.appearancesCount',
            contextParams: { count: s.matches },
        },
    ];
}

function per90(total: number, minutes: number, decimals = 1): number {
    if (minutes <= 0) return 0;
    return Number(((total / minutes) * 90).toFixed(decimals));
}

export function buildPerformanceFromSeason(s: SeasonSummary): StatCategory[] {
    const m = s.minutes;
    const shots = Math.round(s.goals * 2.8 + s.assists * 0.6 + 12);
    const shotsOnTarget = Math.round(shots * 0.42);
    const xg = Number((s.goals * 0.88).toFixed(2));
    const xa = Number((s.assists * 0.95).toFixed(2));
    const passes = Math.round(m * 0.45);
    const passPct = 82.5;
    const touches = Math.round(m * 0.78);
    const dribbles = Math.round(s.goals * 0.4 + s.assists * 0.8 + 8);
    const duelsWon = Math.round(m * 0.055);
    const tackles = Math.round(m * 0.018);

    return [
        {
            title: 'Shooting',
            rows: [
                { label: 'Goals', total: s.goals, per90: per90(s.goals, m) },
                { label: 'Expected goals (xG)', total: xg, per90: per90(xg, m, 2) },
                { label: 'Shots', total: shots, per90: per90(shots, m) },
                { label: 'Shots on target', total: shotsOnTarget, per90: per90(shotsOnTarget, m) },
                { label: 'Headed shots', total: Math.round(s.goals * 0.15), per90: per90(Math.round(s.goals * 0.15), m) },
            ],
        },
        {
            title: 'Passing',
            rows: [
                { label: 'Assists', total: s.assists, per90: per90(s.assists, m) },
                { label: 'Expected assists (xA)', total: xa, per90: per90(xa, m, 2) },
                { label: 'Successful passes', total: passes, per90: per90(passes, m) },
                { label: 'Successful passes %', total: `${passPct}%` },
                { label: 'Chances created', total: Math.round(s.assists * 1.4 + s.goals * 0.5), per90: per90(Math.round(s.assists * 1.4 + s.goals * 0.5), m) },
                { label: 'Big chances created', total: Math.round(s.assists * 0.45 + 2), per90: per90(Math.round(s.assists * 0.45 + 2), m) },
            ],
        },
        {
            title: 'Possession',
            rows: [
                { label: 'Successful dribbles', total: dribbles, per90: per90(dribbles, m) },
                { label: 'Duels won', total: duelsWon, per90: per90(duelsWon, m) },
                { label: 'Touches', total: touches, per90: per90(touches, m) },
                { label: 'Touches in opposition box', total: Math.round(s.goals * 3 + s.assists * 2 + 8), per90: per90(Math.round(s.goals * 3 + s.assists * 2 + 8), m) },
                { label: 'Fouls won', total: Math.round(m * 0.02), per90: per90(Math.round(m * 0.02), m) },
            ],
        },
        {
            title: 'Defending',
            rows: [
                { label: 'Defensive contributions', total: tackles + Math.round(m * 0.008), per90: per90(tackles + Math.round(m * 0.008), m) },
                { label: 'Tackles', total: tackles, per90: per90(tackles, m) },
                { label: 'Interceptions', total: Math.round(m * 0.006), per90: per90(Math.round(m * 0.006), m) },
                { label: 'Recoveries', total: Math.round(m * 0.022), per90: per90(Math.round(m * 0.022), m) },
                { label: 'Fouls committed', total: Math.round(m * 0.01), per90: per90(Math.round(m * 0.01), m) },
            ],
        },
        {
            title: 'Discipline',
            rows: [
                { label: 'Yellow cards', total: s.yellowCards, per90: per90(s.yellowCards, m, 2) },
                { label: 'Red cards', total: s.redCards, per90: per90(s.redCards, m, 2) },
            ],
        },
    ];
}

export function buildTraitsFromSeason(s: SeasonSummary, position: string): PlayerTrait[] {
    const isForward = /striker|forward|wing/i.test(position);
    const touchBase = isForward ? 88 : 65;
    const aerialBase = isForward ? 25 : 55;

    return [
        { label: 'Touches', pct: Math.min(99, touchBase + Math.round(s.matches * 0.3)) },
        { label: 'Shot attempts', pct: Math.min(99, Math.round((s.goals / Math.max(s.matches, 1)) * 40 + 35)) },
        { label: 'Goals', pct: Math.min(99, Math.round((s.goals / Math.max(s.matches, 1)) * 55 + 30)) },
        { label: 'Chances created', pct: Math.min(99, Math.round((s.assists / Math.max(s.matches, 1)) * 50 + 35)) },
        { label: 'Aerial duels won', pct: Math.min(99, aerialBase) },
        { label: 'Defensive contributions', pct: Math.min(99, isForward ? 12 : 48) },
    ];
}

function buildShotMapStable(s: SeasonSummary): ShotMapData {
    const shots = Math.round(s.goals * 2.8 + 10);
    const xg = Number((s.goals * 0.9).toFixed(2));
    const onTarget = Math.round(shots * 0.4);
    const points: ShotMapData['points'] = [];
    for (let i = 0; i < shots; i++) {
        const goal = i < s.goals;
        const t = (i * 17 + s.goals * 3) % 100;
        points.push({
            x: 30 + (t % 60),
            y: goal ? 10 + (t % 20) : 22 + (t % 30),
            goal,
        });
    }
    return {
        shots,
        goals: s.goals,
        xg,
        onTargetPct: shots > 0 ? Math.round((onTarget / shots) * 100) : 0,
        points,
    };
}

const HAA_RECENT: RecentMatch[] = [
    { date: '4 May', gameweek: 'GW37', opponent: 'West Ham', opponentCode: 'WHU', home: true, result: 'W', score: '3-1', goals: 2, assists: 0, minutes: 90, rating: 9.1 },
    { date: '27 Apr', gameweek: 'GW36', opponent: 'Brighton', opponentCode: 'BHA', home: false, result: 'W', score: '2-0', goals: 1, assists: 0, minutes: 78, rating: 8.4 },
    { date: '20 Apr', gameweek: 'GW35', opponent: 'Arsenal', opponentCode: 'ARS', home: true, result: 'D', score: '1-1', goals: 1, assists: 0, minutes: 90, rating: 8.0 },
];

const KDB_RECENT: RecentMatch[] = [
    { date: '4 May', gameweek: 'GW37', opponent: 'West Ham', opponentCode: 'WHU', home: true, result: 'W', score: '3-1', goals: 0, assists: 2, minutes: 90, rating: 9.0 },
    { date: '27 Apr', gameweek: 'GW36', opponent: 'Brighton', opponentCode: 'BHA', home: false, result: 'W', score: '2-0', goals: 1, assists: 1, minutes: 90, rating: 8.8 },
    { date: '20 Apr', gameweek: 'GW35', opponent: 'Arsenal', opponentCode: 'ARS', home: true, result: 'D', score: '1-1', goals: 0, assists: 1, minutes: 72, rating: 7.9 },
];

const DIAS_RECENT: RecentMatch[] = [
    { date: '4 May', gameweek: 'GW37', opponent: 'West Ham', opponentCode: 'WHU', home: true, result: 'W', score: '3-1', goals: 0, assists: 0, minutes: 90, rating: 7.8 },
    { date: '27 Apr', gameweek: 'GW36', opponent: 'Brighton', opponentCode: 'BHA', home: false, result: 'W', score: '2-0', goals: 0, assists: 0, minutes: 90, rating: 7.5 },
    { date: '20 Apr', gameweek: 'GW35', opponent: 'Arsenal', opponentCode: 'ARS', home: true, result: 'D', score: '1-1', goals: 0, assists: 0, minutes: 90, rating: 7.2 },
];

function assemblePlayer(base: Omit<PlayerViewModel, 'traits' | 'performance' | 'shotMap' | 'highlights'>): PlayerViewModel {
    const traits = buildTraitsFromSeason(base.season, base.primaryPosition);
    const performance = buildPerformanceFromSeason(base.season);
    const shotMap = buildShotMapStable(base.season);
    const highlights = buildHighlightStats(base.season, base.primaryPosition);
    return { ...base, traits, performance, shotMap, highlights };
}

export const MOCK_PLAYERS: PlayerViewModel[] = [
    assemblePlayer({
        id: '1',
        name: 'Erling Haaland',
        shirtNumber: 9,
        heightCm: 194,
        preferredFoot: 'Left',
        age: 24,
        dateOfBirth: '2000-07-21',
        nationality: 'Norway',
        primaryPosition: 'Striker',
        otherPositions: ['Centre Forward'],
        marketValue: '€180M',
        highestValue: '€180M',
        contractUntil: '2027-06-30',
        clubTeam: {
            id: 1,
            name: 'Manchester City',
            crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        },
        season: {
            competition: 'Premier League 2025/26',
            goals: 52,
            assists: 9,
            started: 50,
            matches: 53,
            minutes: 4410,
            rating: 8.12,
            yellowCards: 3,
            redCards: 0,
        },
        recentMatches: HAA_RECENT,
        upcomingFixtures: [],
        transferHistory: [
            { year: 2020, valueM: 60 },
            { year: 2022, valueM: 150 },
            { year: 2024, valueM: 180 },
            { year: 2026, valueM: 175 },
        ],
        career: [
            {
                club: 'Manchester City',
                crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
                teamId: 1,
                from: 'Jul 2022',
                to: 'now',
                apps: 128,
                goals: 131,
            },
            { club: 'Borussia Dortmund', from: 'Jan 2020', to: 'Jul 2022', apps: 89, goals: 86 },
        ],
    }),
    assemblePlayer({
        id: '2',
        name: 'Kevin De Bruyne',
        shirtNumber: 17,
        heightCm: 181,
        preferredFoot: 'Right',
        age: 33,
        dateOfBirth: '1991-06-28',
        nationality: 'Belgium',
        primaryPosition: 'Attacking Midfielder',
        otherPositions: ['Central Midfielder'],
        marketValue: '€60M',
        highestValue: '€120M',
        contractUntil: '2025-06-30',
        clubTeam: {
            id: 1,
            name: 'Manchester City',
            crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        },
        season: {
            competition: 'Premier League 2025/26',
            goals: 10,
            assists: 31,
            started: 42,
            matches: 49,
            minutes: 3580,
            rating: 8.45,
            yellowCards: 5,
            redCards: 0,
        },
        recentMatches: KDB_RECENT,
        upcomingFixtures: [],
        transferHistory: [
            { year: 2018, valueM: 100 },
            { year: 2020, valueM: 120 },
            { year: 2023, valueM: 80 },
            { year: 2026, valueM: 60 },
        ],
        career: [
            {
                club: 'Manchester City',
                crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
                teamId: 1,
                from: 'Aug 2015',
                to: 'now',
                apps: 380,
                goals: 102,
            },
        ],
    }),
    assemblePlayer({
        id: '3',
        name: 'Rúben Dias',
        shirtNumber: 3,
        heightCm: 187,
        preferredFoot: 'Right',
        age: 28,
        dateOfBirth: '1997-05-14',
        nationality: 'Portugal',
        primaryPosition: 'Centre Back',
        otherPositions: ['Defender'],
        marketValue: '€80M',
        highestValue: '€90M',
        contractUntil: '2027-06-30',
        clubTeam: {
            id: 1,
            name: 'Manchester City',
            crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        },
        season: {
            competition: 'Premier League 2025/26',
            goals: 1,
            assists: 2,
            started: 40,
            matches: 43,
            minutes: 3780,
            rating: 7.62,
            yellowCards: 4,
            redCards: 0,
        },
        recentMatches: DIAS_RECENT,
        upcomingFixtures: [],
        transferHistory: [
            { year: 2020, valueM: 68 },
            { year: 2022, valueM: 90 },
            { year: 2025, valueM: 80 },
            { year: 2026, valueM: 80 },
        ],
        career: [
            {
                club: 'Manchester City',
                crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
                teamId: 1,
                from: 'Sep 2020',
                to: 'now',
                apps: 198,
                goals: 8,
            },
        ],
    }),
];

export function buildApiPlayerViewModel(
    api: {
        id: number;
        name: string;
        dateOfBirth: string;
        nationality: string;
        kitNumber?: number;
        height?: number;
        photoUrl?: string;
        metadata?: Record<string, unknown> | null;
    },
    clubTeam?: { id: number; name: string; crest?: string },
): PlayerViewModel {
    const age = (() => {
        const birth = new Date(api.dateOfBirth);
        if (Number.isNaN(birth.getTime())) return 0;
        const today = new Date();
        let a = today.getFullYear() - birth.getFullYear();
        const md = today.getMonth() - birth.getMonth();
        if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) a -= 1;
        return a;
    })();

    const meta = api.metadata ?? {};
    const preferredFoot =
        typeof meta.preferredFoot === 'string' ? meta.preferredFoot : undefined;
    const primaryPosition =
        typeof meta.primaryPosition === 'string' ? meta.primaryPosition : 'Player';

    const season: SeasonSummary = {
        competition: 'Current season',
        goals: 0,
        assists: 0,
        started: 0,
        matches: 0,
        minutes: 0,
        rating: 0,
        yellowCards: 0,
        redCards: 0,
    };

    return assemblePlayer({
        id: String(api.id),
        name: api.name,
        photoUrl: api.photoUrl,
        shirtNumber: api.kitNumber,
        heightCm: api.height,
        preferredFoot,
        age,
        dateOfBirth: api.dateOfBirth,
        nationality: api.nationality || '—',
        primaryPosition,
        otherPositions: [],
        clubTeam,
        season,
        recentMatches: [],
        upcomingFixtures: [],
        transferHistory: [],
        career: clubTeam
            ? [
                  {
                      club: clubTeam.name,
                      crest: clubTeam.crest,
                      teamId: clubTeam.id,
                      from: '—',
                      to: 'now',
                      apps: 0,
                      goals: 0,
                  },
              ]
            : [],
    });
}

function formatMatchDateLabel(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function opponentCode(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z\s]/g, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return parts
            .slice(0, 3)
            .map((p) => p[0])
            .join('')
            .toUpperCase();
    }
    return cleaned.slice(0, 3).toUpperCase() || 'OPP';
}

function estimateMatchRating(row: PlayerMatchRow): number {
    const base = row.isStarting ? 6.6 : 6.3;
    return Number(Math.min(10, base + row.goals * 0.75 + row.assists * 0.45).toFixed(1));
}

export function mapPlayerMatchToRecent(row: PlayerMatchRow): RecentMatch {
    const teamScore = row.home ? row.homeScore : row.awayScore;
    const oppScore = row.home ? row.awayScore : row.homeScore;
    const score =
        teamScore != null && oppScore != null ? `${teamScore}-${oppScore}` : '—';

    return {
        date: formatMatchDateLabel(row.date),
        opponent: row.opponentName,
        opponentCode: opponentCode(row.opponentName),
        home: row.home,
        result: row.result ?? 'D',
        score,
        goals: row.goals,
        assists: row.assists,
        minutes: row.minutes,
        rating: estimateMatchRating(row),
        fixtureId: row.fixtureId,
    };
}

export function mapPlayerFixtureToUpcoming(row: PlayerMatchRow): UpcomingFixture {
    return {
        date: formatMatchDateLabel(row.date),
        opponent: row.opponentName,
        opponentCode: opponentCode(row.opponentName),
        home: row.home,
        fixtureId: row.fixtureId,
    };
}

export function mergePlayerMatchesIntoViewModel(
    base: PlayerViewModel,
    season: PlayerSeasonSummary,
    results: PlayerMatchRow[],
    fixtures: PlayerMatchRow[],
): PlayerViewModel {
    const { traits, performance, shotMap, highlights, ...rest } = base;
    const mergedSeason = {
        ...rest.season,
        ...season,
        competition: season.competition || rest.season.competition,
    };

    return assemblePlayer({
        ...rest,
        season: mergedSeason,
        recentMatches: results.map(mapPlayerMatchToRecent),
        upcomingFixtures: fixtures.map(mapPlayerFixtureToUpcoming),
    });
}
