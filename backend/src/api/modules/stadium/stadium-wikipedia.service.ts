import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stadium } from './stadium.entity';
import type { StadiumLore } from './stadium-profile.types';

const WIKIPEDIA_ATTRIBUTION =
    'Content from Wikipedia, licensed under CC BY-SA 4.0. © Wikipedia contributors.';

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const USER_AGENT = 'iWatchFootball/1.0 (stadium-lore; contact@iwatchfootball.app)';

type WikipediaCache = {
    pageTitle?: string;
    extract?: string;
    thumbnailUrl?: string;
    pageUrl?: string;
    fetchedAt?: string;
    notFound?: boolean;
};

type WikiSummaryResponse = {
    title?: string;
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    thumbnail?: { source?: string };
};

@Injectable()
export class StadiumWikipediaService {
    private readonly logger = new Logger(StadiumWikipediaService.name);

    constructor(
        @InjectRepository(Stadium) private readonly stadiumRepo: Repository<Stadium>,
    ) {}

    async resolveLore(
        stadium: Stadium,
        homeClubNames: string[] = [],
    ): Promise<StadiumLore | null> {
        const metadata = (stadium.metadata ?? {}) as Record<string, unknown>;
        if (metadata.loreOverride && typeof metadata.loreOverride === 'string') {
            return {
                source: 'wikipedia',
                pageTitle: stadium.name,
                extract: metadata.loreOverride,
                pageUrl: '',
                fetchedAt: new Date().toISOString(),
                attribution: WIKIPEDIA_ATTRIBUTION,
            };
        }

        const cached = metadata.wikipedia as WikipediaCache | undefined;
        if (cached?.fetchedAt) {
            const age = Date.now() - new Date(cached.fetchedAt).getTime();
            if (age >= 0 && age < CACHE_TTL_MS) {
                if (cached.notFound) return null;
                if (cached.extract && cached.pageTitle) {
                    return this.toLore(cached);
                }
            }
        }

        const resolved = await this.fetchAndCache(stadium, homeClubNames);
        return resolved;
    }

    private toLore(cached: WikipediaCache): StadiumLore {
        return {
            source: 'wikipedia',
            pageTitle: cached.pageTitle ?? '',
            extract: cached.extract ?? '',
            ...(cached.thumbnailUrl ? { thumbnailUrl: cached.thumbnailUrl } : {}),
            pageUrl: cached.pageUrl ?? '',
            fetchedAt: cached.fetchedAt ?? new Date().toISOString(),
            attribution: WIKIPEDIA_ATTRIBUTION,
        };
    }

    private async fetchAndCache(
        stadium: Stadium,
        homeClubNames: string[],
    ): Promise<StadiumLore | null> {
        const metadata = (stadium.metadata ?? {}) as Record<string, unknown>;
        const existingWiki = metadata.wikipedia as WikipediaCache | undefined;
        const storedTitle = existingWiki?.pageTitle?.trim();

        const titleCandidates = this.buildTitleCandidates(stadium, homeClubNames, storedTitle);
        let summary: WikiSummaryResponse | null = null;
        let resolvedTitle: string | undefined;

        for (const title of titleCandidates) {
            summary = await this.fetchSummary(title);
            if (summary?.extract) {
                resolvedTitle = summary.title ?? title;
                break;
            }
        }

        if (!summary?.extract) {
            const searchQuery = this.buildSearchQuery(stadium, homeClubNames);
            const searchTitle = await this.opensearch(searchQuery);
            if (searchTitle) {
                summary = await this.fetchSummary(searchTitle);
                resolvedTitle = summary?.title ?? searchTitle;
            }
        }

        const fetchedAt = new Date().toISOString();

        if (!summary?.extract || !resolvedTitle) {
            await this.persistCache(stadium.id, metadata, {
                fetchedAt,
                notFound: true,
                pageTitle: storedTitle ?? stadium.name,
            });
            return null;
        }

        const cache: WikipediaCache = {
            pageTitle: resolvedTitle,
            extract: summary.extract,
            thumbnailUrl: summary.thumbnail?.source,
            pageUrl:
                summary.content_urls?.desktop?.page ??
                `https://en.wikipedia.org/wiki/${encodeURIComponent(resolvedTitle.replace(/ /g, '_'))}`,
            fetchedAt,
        };

        await this.persistCache(stadium.id, metadata, cache);
        return this.toLore(cache);
    }

    private buildTitleCandidates(
        stadium: Stadium,
        homeClubNames: string[],
        storedTitle?: string,
    ): string[] {
        const name = stadium.name.trim();
        const seen = new Set<string>();
        const out: string[] = [];

        const push = (t: string) => {
            const key = t.trim().toLowerCase();
            if (!key || seen.has(key)) return;
            seen.add(key);
            out.push(t.trim());
        };

        if (storedTitle) push(storedTitle);
        push(name);
        push(`${name} (stadium)`);
        push(`${name} Stadium`);
        for (const club of homeClubNames) {
            push(`${club} ${name}`);
            push(`${name} (${club})`);
        }

        return out;
    }

    private buildSearchQuery(stadium: Stadium, homeClubNames: string[]): string {
        const club = homeClubNames[0]?.trim();
        const country = stadium.country?.trim();
        const parts = [stadium.name.trim(), club, country, 'stadium'].filter(Boolean);
        return parts.join(' ');
    }

    private async fetchSummary(title: string): Promise<WikiSummaryResponse | null> {
        const encoded = encodeURIComponent(title.replace(/ /g, '_'));
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
            });
            if (res.status === 404) return null;
            if (!res.ok) {
                this.logger.warn(`Wikipedia summary failed for "${title}": ${res.status}`);
                return null;
            }
            return (await res.json()) as WikiSummaryResponse;
        } catch (err) {
            this.logger.warn(`Wikipedia summary error for "${title}": ${err}`);
            return null;
        }
    }

    private async opensearch(query: string): Promise<string | null> {
        const params = new URLSearchParams({
            action: 'opensearch',
            search: query,
            limit: '3',
            namespace: '0',
            format: 'json',
        });
        const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
            });
            if (!res.ok) return null;
            const data = (await res.json()) as [string, string[], string[], string[]];
            const titles = data[1] ?? [];
            const stadiumLike = titles.find((t) => /stadium|arena|ground|field|park/i.test(t));
            return stadiumLike ?? titles[0] ?? null;
        } catch (err) {
            this.logger.warn(`Wikipedia opensearch error: ${err}`);
            return null;
        }
    }

    private async persistCache(
        stadiumId: number,
        metadata: Record<string, unknown>,
        wiki: WikipediaCache,
    ): Promise<void> {
        const merged = {
            ...metadata,
            wikipedia: wiki,
        };
        await this.stadiumRepo.update(stadiumId, { metadata: merged } as any);
    }
}
