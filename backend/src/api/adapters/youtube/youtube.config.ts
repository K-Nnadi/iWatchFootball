export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
export const YOUTUBE_EMBED_BASE_URL = 'https://www.youtube.com/embed';
export const YOUTUBE_WATCH_BASE_URL = 'https://www.youtube.com/watch';

export function getYouTubeApiKey(): string {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
        throw new Error('YOUTUBE_API_KEY environment variable is not set');
    }
    return key;
}

export function getOfficialChannelIds(): string[] {
    const raw = process.env.YOUTUBE_OFFICIAL_CHANNEL_IDS ?? '';
    return raw
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
}

export function isYouTubeEnabled(): boolean {
    return !!process.env.YOUTUBE_API_KEY;
}

/** YouTube Data API v3 daily quota units (search.list = 100, videos.list = 1). */
export function getYouTubeDailyQuotaUnits(): number {
    const raw = process.env.YOUTUBE_DAILY_QUOTA_UNITS;
    const parsed = raw != null ? Number(raw) : 2000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2000;
}

export const YOUTUBE_QUOTA_COST = {
    search: 100,
    videos: 1,
} as const;
