/**
 * @deprecated Local demo fixtures for the Matches page. Real `/fixture/query` data is the
 * default. Enable only with `VITE_USE_DEPRECATED_MATCH_MOCKS=true`.
 */
export type DeprecatedMockMatch = {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    homeScore?: number;
    awayScore?: number;
    hasTickets?: boolean;
    isLive?: boolean;
};

/** @deprecated Crest URLs for demo team names (Team A–L). */
export const deprecatedMockTeamCrests: Record<string, string> = {
    'Team A': 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
    'Team B': 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
    'Team C': 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
    'Team D': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
    'Team E': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
    'Team F': 'https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png',
    'Team G': 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
    'Team H': 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
    'Team I': 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png',
    'Team J': 'https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png',
    'Team K': 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png',
    'Team L': 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png',
};

export function isDeprecatedMatchMocksEnabled(): boolean {
    return import.meta.env.VITE_USE_DEPRECATED_MATCH_MOCKS === 'true';
}

/**
 * @deprecated Builds the old Team A–L demo card for a calendar day.
 */
export function buildDeprecatedMockMatches(date: Date, today: Date): DeprecatedMockMatch[] {
    const isPast = date < today && date.toDateString() !== today.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const currentHour = new Date().getHours();

    return [
        {
            id: 'match1',
            competitionName: 'Premier League',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0).toISOString(),
            venue: 'Stadium A',
            homeScore: isPast ? 2 : isToday && currentHour >= 15 && currentHour < 17 ? 1 : undefined,
            awayScore: isPast ? 1 : isToday && currentHour >= 15 && currentHour < 17 ? 0 : undefined,
            hasTickets: true,
            isLive: isToday && currentHour >= 15 && currentHour < 17,
        },
        {
            id: 'match2',
            competitionName: 'Premier League',
            homeTeam: 'Team C',
            awayTeam: 'Team D',
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
            venue: 'Stadium B',
            homeScore: isPast ? 0 : isToday && currentHour >= 17 && currentHour < 19 ? 2 : undefined,
            awayScore: isPast ? 0 : isToday && currentHour >= 17 && currentHour < 19 ? 1 : undefined,
            hasTickets: true,
            isLive: isToday && currentHour >= 17 && currentHour < 19,
        },
        {
            id: 'match3',
            competitionName: 'Premier League',
            homeTeam: 'Team E',
            awayTeam: 'Team F',
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
            venue: 'Stadium C',
            homeScore: isPast ? 0 : undefined,
            awayScore: isPast ? 0 : undefined,
            hasTickets: false,
            isLive: false,
        },
        {
            id: 'match4',
            competitionName: 'Premier League',
            homeTeam: 'Team G',
            awayTeam: 'Team H',
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
            venue: 'Stadium D',
            homeScore: isPast ? 0 : undefined,
            awayScore: isPast ? 0 : undefined,
            hasTickets: true,
            isLive: false,
        },
        {
            id: 'match5',
            competitionName: 'Champions League',
            homeTeam: 'Team I',
            awayTeam: 'Team J',
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
            venue: 'Stadium E',
            homeScore: isPast ? 3 : undefined,
            awayScore: isPast ? 2 : undefined,
            hasTickets: true,
            isLive: false,
        },
        {
            id: 'match6',
            competitionName: 'FA Cup',
            homeTeam: 'Team K',
            awayTeam: 'Team L',
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
            venue: 'Stadium F',
            homeScore: isPast ? 3 : undefined,
            awayScore: isPast ? 2 : undefined,
            hasTickets: false,
            isLive: false,
        },
    ];
}
