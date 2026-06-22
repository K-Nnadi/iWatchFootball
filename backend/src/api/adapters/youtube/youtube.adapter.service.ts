import { Injectable, Logger } from '@nestjs/common';
import { parseDurationToSeconds, YouTubeHttpService, YouTubeSearchResult, YouTubeVideoDetails } from './youtube.http.service';
import { YOUTUBE_EMBED_BASE_URL, YOUTUBE_WATCH_BASE_URL, getOfficialChannelIds } from './youtube.config';
import { FixtureHighlight } from '../../modules/fixtureHighlight/fixtureHighlight.entity';
import { HighlightProvider, HighlightStatus, HighlightType } from '../../enums/fixture-highlight.enum';

export interface HighlightSearchContext {
    fixtureId: number;
    homeTeamName: string;
    awayTeamName: string;
    kickoffTime: Date;
}

/** One targeted search slot: a type label + the query terms that best surface that type */
interface SlotConfig {
    type: HighlightType;
    queries: string[];
    /** Title keywords that CONFIRM this is the right type (at least one must match) */
    mustInclude?: string[];
    /** Title keywords that DISQUALIFY a result for this slot */
    exclude?: string[];
}

/**
 * Global title keyword exclusions applied to every slot.
 * Catches animations, game simulations, and other non-real-match content.
 */
const GLOBAL_TITLE_EXCLUSIONS = [
    // Cartoons / animations
    'cartoon', 'animated', 'animation', 'parody',
    // Game simulations
    'pes', 'fifa', 'ea sports', 'efootball', 'pro evolution',
    'simulation', 'gameplay', 'gaming', 'career mode',
];

const SLOTS: SlotConfig[] = [
    {
        type: HighlightType.MATCH,
        queries: ['{home} vs {away} highlights', '{home} {away} match highlights'],
        exclude: ['extended', 'all goals', 'goal compilation', 'red card', 'interview'],
    },
    {
        type: HighlightType.EXTENDED,
        queries: ['{home} vs {away} extended highlights', '{home} {away} extended'],
        mustInclude: ['extended'],
    },
    {
        type: HighlightType.GOAL,
        queries: ['{home} vs {away} all goals', '{home} {away} goals highlights'],
        mustInclude: ['goal', 'goals'],
        exclude: ['extended'],
    },
];

@Injectable()
export class YouTubeAdapterService {
    private readonly logger = new Logger(YouTubeAdapterService.name);

    constructor(private readonly youTubeHttp: YouTubeHttpService) {}

    async searchFixtureHighlights(ctx: HighlightSearchContext): Promise<Partial<FixtureHighlight>[]> {
        const { fixtureId, homeTeamName, awayTeamName, kickoffTime } = ctx;
        const officialChannelIds = getOfficialChannelIds();
        const publishedAfter = kickoffTime;
        const publishedBefore = new Date(kickoffTime.getTime() + 7 * 24 * 60 * 60 * 1000);

        this.logger.log(`Searching YouTube highlights for fixture ${fixtureId}: ${homeTeamName} vs ${awayTeamName}`);

        // Run all slot searches in parallel
        const slotResults = await Promise.all(
            SLOTS.map(async (slot) => {
                const queries = slot.queries.map((q) =>
                    q.replace('{home}', homeTeamName).replace('{away}', awayTeamName),
                );

                const allResults: YouTubeSearchResult[] = [];
                for (const query of queries) {
                    const results = await this.youTubeHttp.searchVideos(query, {
                        publishedAfter,
                        publishedBefore,
                        maxResults: 8,
                    });
                    allResults.push(...results);
                }

                const deduped = this.deduplicateByVideoId(allResults);
                const relevant = this.filterByRelevance(deduped, homeTeamName, awayTeamName, kickoffTime, slot);
                const best = this.pickBest(relevant, officialChannelIds);

                this.logger.log(
                    `Slot [${slot.type}]: ${deduped.length} deduped → ${relevant.length} relevant → ${best ? `picked "${best.snippet.title}"` : 'no match'}`,
                );

                return best ? { result: best, type: slot.type } : null;
            }),
        );

        const winners = slotResults.filter((s): s is { result: YouTubeSearchResult; type: HighlightType } => s !== null);

        // Final dedup across slots — same video can't fill two slots
        const seenVideoIds = new Set<string>();
        const uniqueWinners = winners.filter(({ result }) => {
            if (seenVideoIds.has(result.id.videoId)) return false;
            seenVideoIds.add(result.id.videoId);
            return true;
        });

        if (uniqueWinners.length === 0) {
            this.logger.warn(`No highlights found for fixture ${fixtureId}`);
            return [];
        }

        // Fetch video details (duration + embeddability) for all winners in one API call
        const videoIds = uniqueWinners.map((w) => w.result.id.videoId);
        const details = await this.youTubeHttp.getVideoDetails(videoIds);
        const detailsMap = new Map(details.map((d) => [d.id, d]));

        // Discard videos that rights-holders have blocked from embedding
        const embeddableWinners = uniqueWinners.filter(({ result }) => {
            const detail = detailsMap.get(result.id.videoId);
            if (!detail) return true; // no detail returned → assume embeddable
            if (!detail.status.embeddable) {
                this.logger.warn(
                    `Skipping non-embeddable video "${result.snippet.title}" (${result.id.videoId}) — blocked by rights holder`,
                );
                return false;
            }
            return true;
        });

        this.logger.log(`Fixture ${fixtureId}: saving ${embeddableWinners.length} highlight(s) (${embeddableWinners.map((w) => w.type).join(', ')})`);

        return embeddableWinners.map(({ result, type }) =>
            this.mapToHighlight(fixtureId, result, type, detailsMap.get(result.id.videoId), officialChannelIds),
        );
    }

    private deduplicateByVideoId(results: YouTubeSearchResult[]): YouTubeSearchResult[] {
        const seen = new Set<string>();
        return results.filter((r) => {
            if (seen.has(r.id.videoId)) return false;
            seen.add(r.id.videoId);
            return true;
        });
    }

    private filterByRelevance(
        results: YouTubeSearchResult[],
        homeTeam: string,
        awayTeam: string,
        kickoffTime: Date,
        slot: SlotConfig,
    ): YouTubeSearchResult[] {
        const home = homeTeam.toLowerCase();
        const away = awayTeam.toLowerCase();

        return results.filter((r) => {
            const title = r.snippet.title.toLowerCase();
            const publishedAt = new Date(r.snippet.publishedAt);

            if (publishedAt < kickoffTime) return false;
            if (!title.includes(home) && !title.includes(away)) return false;

            // Global exclusions: cartoons, game simulations, etc.
            if (GLOBAL_TITLE_EXCLUSIONS.some((kw) => title.includes(kw))) return false;

            if (slot.mustInclude && !slot.mustInclude.some((kw) => title.includes(kw))) return false;
            if (slot.exclude && slot.exclude.some((kw) => title.includes(kw))) return false;

            return true;
        });
    }

    /** Pick the single best result: prefer official channels, then take the first (YouTube relevance order) */
    private pickBest(results: YouTubeSearchResult[], officialChannelIds: string[]): YouTubeSearchResult | null {
        if (results.length === 0) return null;

        if (officialChannelIds.length > 0) {
            const official = results.find((r) => officialChannelIds.includes(r.snippet.channelId));
            if (official) return official;
        }

        return results[0];
    }

    private mapToHighlight(
        fixtureId: number,
        result: YouTubeSearchResult,
        type: HighlightType,
        detail: YouTubeVideoDetails | undefined,
        officialChannelIds: string[],
    ): Partial<FixtureHighlight> {
        const isOfficial = officialChannelIds.length > 0 && officialChannelIds.includes(result.snippet.channelId);
        const thumbnailUrl =
            result.snippet.thumbnails.high?.url ??
            result.snippet.thumbnails.medium?.url ??
            result.snippet.thumbnails.default?.url;

        return {
            fixtureId,
            provider: HighlightProvider.YOUTUBE,
            type,
            title: result.snippet.title,
            providerVideoId: result.id.videoId,
            thumbnailUrl,
            embedUrl: `${YOUTUBE_EMBED_BASE_URL}/${result.id.videoId}`,
            sourceUrl: `${YOUTUBE_WATCH_BASE_URL}?v=${result.id.videoId}`,
            durationSeconds: detail ? parseDurationToSeconds(detail.contentDetails.duration) : undefined,
            publishedAt: new Date(result.snippet.publishedAt),
            isOfficial,
            status: HighlightStatus.ACTIVE,
            channelName: result.snippet.channelTitle,
        } satisfies Partial<FixtureHighlight>;
    }
}
