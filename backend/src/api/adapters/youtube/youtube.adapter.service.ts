import { Injectable, Logger } from '@nestjs/common';
import { parseDurationToSeconds, YouTubeHttpService, YouTubeSearchResult } from './youtube.http.service';
import { YOUTUBE_EMBED_BASE_URL, YOUTUBE_WATCH_BASE_URL, getOfficialChannelIds } from './youtube.config';
import { FixtureHighlight } from '../../modules/fixtureHighlight/fixtureHighlight.entity';
import { HighlightProvider, HighlightStatus, HighlightType } from '../../enums/fixture-highlight.enum';

export interface HighlightSearchContext {
    fixtureId: number;
    homeTeamName: string;
    awayTeamName: string;
    kickoffTime: Date;
}

@Injectable()
export class YouTubeAdapterService {
    private readonly logger = new Logger(YouTubeAdapterService.name);

    constructor(private readonly youTubeHttp: YouTubeHttpService) {}

    async searchFixtureHighlights(ctx: HighlightSearchContext): Promise<Partial<FixtureHighlight>[]> {
        const { fixtureId, homeTeamName, awayTeamName, kickoffTime } = ctx;

        const queries = this.buildSearchQueries(homeTeamName, awayTeamName);
        const officialChannelIds = getOfficialChannelIds();

        this.logger.log(
            `Searching YouTube highlights for fixture ${fixtureId}: ${homeTeamName} vs ${awayTeamName}`,
        );

        const allResults: YouTubeSearchResult[] = [];
        for (const query of queries) {
            const results = await this.youTubeHttp.searchVideos(query, {
                publishedAfter: kickoffTime,
                publishedBefore: new Date(kickoffTime.getTime() + 7 * 24 * 60 * 60 * 1000),
                maxResults: 10,
            });
            allResults.push(...results);
        }

        this.logger.log(`YouTube returned ${allResults.length} raw results for fixture ${fixtureId}`);

        const deduped = this.deduplicateByVideoId(allResults);
        const filtered = this.filterByRelevance(deduped, homeTeamName, awayTeamName, kickoffTime);

        this.logger.log(`${filtered.length} results after relevance filter for fixture ${fixtureId}`);

        // Cap at 5 highlights per fixture
        const capped = filtered.slice(0, 5);

        if (capped.length === 0) {
            this.logger.warn(`No highlights found for fixture ${fixtureId}`);
            return [];
        }

        const videoIds = capped.map((r) => r.id.videoId);
        const details = await this.youTubeHttp.getVideoDetails(videoIds);
        const detailsMap = new Map(details.map((d) => [d.id, d]));

        return capped.map((result) => {
            const detail = detailsMap.get(result.id.videoId);
            // Mark as official only if channel is in the allow-list — but never exclude based on it
            const isOfficial =
                officialChannelIds.length > 0 &&
                officialChannelIds.includes(result.snippet.channelId);
            const thumbnailUrl =
                result.snippet.thumbnails.high?.url ??
                result.snippet.thumbnails.medium?.url ??
                result.snippet.thumbnails.default?.url;

            return {
                fixtureId,
                provider: HighlightProvider.YOUTUBE,
                type: this.inferHighlightType(result.snippet.title),
                title: result.snippet.title,
                providerVideoId: result.id.videoId,
                thumbnailUrl,
                embedUrl: `${YOUTUBE_EMBED_BASE_URL}/${result.id.videoId}`,
                sourceUrl: `${YOUTUBE_WATCH_BASE_URL}?v=${result.id.videoId}`,
                durationSeconds: detail
                    ? parseDurationToSeconds(detail.contentDetails.duration)
                    : undefined,
                publishedAt: new Date(result.snippet.publishedAt),
                isOfficial,
                status: HighlightStatus.ACTIVE,
                channelName: result.snippet.channelTitle,
            } satisfies Partial<FixtureHighlight>;
        });
    }

    private buildSearchQueries(homeTeam: string, awayTeam: string): string[] {
        return [
            `${homeTeam} ${awayTeam} Highlights`,
            `${homeTeam} vs ${awayTeam} Highlights`,
            `${homeTeam} vs ${awayTeam} Extended Highlights`,
        ];
    }

    private deduplicateByVideoId(results: YouTubeSearchResult[]): YouTubeSearchResult[] {
        const seen = new Set<string>();
        return results.filter((r) => {
            if (seen.has(r.id.videoId)) return false;
            seen.add(r.id.videoId);
            return true;
        });
    }

    /** Keep only results that mention at least one team name and were published after kickoff */
    private filterByRelevance(
        results: YouTubeSearchResult[],
        homeTeam: string,
        awayTeam: string,
        kickoffTime: Date,
    ): YouTubeSearchResult[] {
        const homeNormalized = homeTeam.toLowerCase();
        const awayNormalized = awayTeam.toLowerCase();

        return results.filter((result) => {
            const titleLower = result.snippet.title.toLowerCase();
            const publishedAt = new Date(result.snippet.publishedAt);

            const mentionsATeam =
                titleLower.includes(homeNormalized) || titleLower.includes(awayNormalized);
            const publishedAfterKickoff = publishedAt >= kickoffTime;

            return mentionsATeam && publishedAfterKickoff;
        });
    }

    private inferHighlightType(title: string): HighlightType {
        const lower = title.toLowerCase();
        if (lower.includes('extended')) return HighlightType.EXTENDED;
        if (lower.includes('goal') || lower.includes('goals')) return HighlightType.GOAL;
        if (lower.includes('penalty') || lower.includes('penalties')) return HighlightType.PENALTY;
        if (lower.includes('red card')) return HighlightType.RED_CARD;
        if (lower.includes('interview') || lower.includes('post-match') || lower.includes('post match'))
            return HighlightType.INTERVIEW;
        if (lower.includes('fan') || lower.includes('reaction')) return HighlightType.FAN_REACTION;
        return HighlightType.MATCH;
    }
}
