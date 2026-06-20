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
