import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type AdvancedStatRow = {
    label: string;
    total: number | string;
    per90?: number | string;
};

export type AdvancedStatCategory = {
    title: string;
    rows: AdvancedStatRow[];
};

export type PlayerAdvancedStatsResponse = {
    minutes: number;
    categories: AdvancedStatCategory[];
    hasRollupData: boolean;
};

export async function fetchPlayerAdvancedStats(
    playerId: number,
    seasonId?: number,
): Promise<PlayerAdvancedStatsResponse> {
    const params = seasonId != null ? `?seasonId=${seasonId}` : '';
    const res = await fetch(`${baseURL}/player/${playerId}/advanced-stats${params}`);
    if (!res.ok) {
        throw new Error(`Failed to load player advanced stats (${res.status})`);
    }
    return res.json() as Promise<PlayerAdvancedStatsResponse>;
}

export type AttendanceLeaderboardEntry = {
    rank: number;
    playerId: number;
    name: string;
    value: number;
};

export type AttendanceLeaderboard = {
    metric: string;
    title: string;
    entries: AttendanceLeaderboardEntry[];
};

export type AttendanceAdvancedStatsResponse = {
    leaderboards: AttendanceLeaderboard[];
};

export async function fetchMyAttendanceAdvancedStats(): Promise<AttendanceAdvancedStatsResponse> {
    const { data } = await axios.get<AttendanceAdvancedStatsResponse>(
        '/log/my-attendance-advanced-stats',
    );
    return data;
}
