import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
    YOUTUBE_API_BASE_URL,
    YOUTUBE_QUOTA_COST,
    getYouTubeApiKey,
    getYouTubeDailyQuotaUnits,
} from './youtube.config';

export interface YouTubeSearchResult {
    id: { videoId: string };
    snippet: {
        title: string;
        description: string;
        publishedAt: string;
        channelId: string;
        channelTitle: string;
        thumbnails: {
            medium?: { url: string };
            high?: { url: string };
            default?: { url: string };
        };
    };
}

export interface YouTubeVideoDetails {
    id: string;
    contentDetails: {
        duration: string; // ISO 8601 duration e.g. PT9M30S
    };
    status: {
        embeddable: boolean;
        privacyStatus: string;
    };
    snippet: {
        title: string;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
            medium?: { url: string };
            high?: { url: string };
            default?: { url: string };
        };
    };
}

@Injectable()
export class YouTubeHttpService {
    private readonly logger = new Logger(YouTubeHttpService.name);
    private quotaUsed = 0;
    private quotaDate = '';

    private resetQuotaIfNewDay(): void {
        const today = new Date().toISOString().slice(0, 10);
        if (this.quotaDate !== today) {
            this.quotaDate = today;
            this.quotaUsed = 0;
        }
    }

    private consumeQuota(units: number): boolean {
        this.resetQuotaIfNewDay();
        const budget = getYouTubeDailyQuotaUnits();
        if (this.quotaUsed + units > budget) {
            this.logger.warn(
                `YouTube daily quota budget exhausted (${this.quotaUsed}/${budget} units used) — skipping request`,
            );
            return false;
        }
        this.quotaUsed += units;
        return true;
    }

    async searchVideos(
        query: string,
        options: { publishedAfter?: Date; publishedBefore?: Date; maxResults?: number } = {},
    ): Promise<YouTubeSearchResult[]> {
        if (!this.consumeQuota(YOUTUBE_QUOTA_COST.search)) {
            return [];
        }

        const params: Record<string, string | number> = {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: options.maxResults ?? 10,
            key: getYouTubeApiKey(),
        };

        if (options.publishedAfter) {
            params['publishedAfter'] = options.publishedAfter.toISOString();
        }
        if (options.publishedBefore) {
            params['publishedBefore'] = options.publishedBefore.toISOString();
        }

        try {
            const response = await axios.get<{ items: YouTubeSearchResult[] }>(
                `${YOUTUBE_API_BASE_URL}/search`,
                { params },
            );
            return response.data.items ?? [];
        } catch (error) {
            this.logger.error(`YouTube search failed for query "${query}": ${error}`);
            return [];
        }
    }

    async getVideoDetails(videoIds: string[]): Promise<YouTubeVideoDetails[]> {
        if (videoIds.length === 0) return [];
        if (!this.consumeQuota(YOUTUBE_QUOTA_COST.videos)) {
            return [];
        }

        try {
            const response = await axios.get<{ items: YouTubeVideoDetails[] }>(
                `${YOUTUBE_API_BASE_URL}/videos`,
                {
                    params: {
                        part: 'snippet,contentDetails,status',
                        id: videoIds.join(','),
                        key: getYouTubeApiKey(),
                    },
                },
            );
            return response.data.items ?? [];
        } catch (error) {
            this.logger.error(`YouTube video details fetch failed: ${error}`);
            return [];
        }
    }
}

/** Parse ISO 8601 duration (PT9M30S) to total seconds */
export function parseDurationToSeconds(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] ?? '0', 10);
    const minutes = parseInt(match[2] ?? '0', 10);
    const seconds = parseInt(match[3] ?? '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
}
