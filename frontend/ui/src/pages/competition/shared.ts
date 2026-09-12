import type { MatchRowData } from '../../components/ui';
import { resolveFixtureScores, type FixtureScoresInput } from '../../shared/fixtureScores';
import { formatLiveClockLabel } from '../../shared/liveClock';

export type FixtureRecord = {
    id: number;
    date: string;
    status?: string;
    homeTeamId: number;
    awayTeamId: number;
    homeScore?: number;
    awayScore?: number;
    stadiumId?: number;
    competitionId?: number;
    seasonId?: number;
    metadata?: { homeScore?: number; awayScore?: number };
};

export type TeamRecord = {
    id: number;
    name?: string;
    logoUrl?: string;
};

export function fixtureToMatchRowData(fix: FixtureRecord, teams: TeamRecord[]): MatchRowData {
    const homeTeam = teams.find((t) => t.id === fix.homeTeamId);
    const awayTeam = teams.find((t) => t.id === fix.awayTeamId);
    const home = homeTeam?.name ?? `Team ${fix.homeTeamId}`;
    const away = awayTeam?.name ?? `Team ${fix.awayTeamId}`;
    const scores = resolveFixtureScores(fix as FixtureScoresInput);
    const isLive = fix.status === 'Live';
    const kickoff = new Date(fix.date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (isLive && scores) {
        return {
            id: fix.id,
            homeTeam: home,
            awayTeam: away,
            homeScore: scores.home,
            awayScore: scores.away,
            homeLogo: homeTeam?.logoUrl,
            awayLogo: awayTeam?.logoUrl,
            time: formatLiveClockLabel({
                status: fix.status,
                metadata: fix.metadata,
                kickoffIso: fix.date,
            }),
            isLive: true,
        };
    }

    if (scores) {
        return {
            id: fix.id,
            homeTeam: home,
            awayTeam: away,
            homeScore: scores.home,
            awayScore: scores.away,
            homeLogo: homeTeam?.logoUrl,
            awayLogo: awayTeam?.logoUrl,
            time: fix.status === 'Completed' ? 'FT' : kickoff,
            isLive: false,
        };
    }

    return {
        id: fix.id,
        homeTeam: home,
        awayTeam: away,
        homeLogo: homeTeam?.logoUrl,
        awayLogo: awayTeam?.logoUrl,
        time: kickoff,
        isLive: false,
    };
}

export const competitionTableStyles = {
    th: {
        color: 'var(--modern-text-secondary)',
        fontSize: '0.75rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        padding: '0.75rem 1rem',
    },
    td: { padding: '0.65rem 1rem', borderColor: 'var(--modern-card-border)' },
};
