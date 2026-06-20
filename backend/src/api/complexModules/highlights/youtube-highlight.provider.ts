import { Injectable } from '@nestjs/common';
import { HighlightProvider } from '../../enums/fixture-highlight.enum';
import { FixtureHighlight } from '../../modules/fixtureHighlight/fixtureHighlight.entity';
import { YouTubeAdapterService } from '../../adapters/youtube/youtube.adapter.service';
import { HighlightSearchContext, IHighlightProvider } from './highlight-provider.interface';

@Injectable()
export class YouTubeHighlightProvider implements IHighlightProvider {
    readonly providerKey = HighlightProvider.YOUTUBE;

    constructor(private readonly youTubeAdapter: YouTubeAdapterService) {}

    searchFixtureHighlights(ctx: HighlightSearchContext): Promise<Partial<FixtureHighlight>[]> {
        return this.youTubeAdapter.searchFixtureHighlights(ctx);
    }
}
