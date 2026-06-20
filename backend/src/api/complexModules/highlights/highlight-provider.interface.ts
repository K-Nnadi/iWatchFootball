import { HighlightProvider } from '../../enums/fixture-highlight.enum';
import { FixtureHighlight } from '../../modules/fixtureHighlight/fixtureHighlight.entity';

export interface HighlightSearchContext {
    fixtureId: number;
    homeTeamName: string;
    awayTeamName: string;
    kickoffTime: Date;
}

export interface IHighlightProvider {
    readonly providerKey: HighlightProvider;
    searchFixtureHighlights(ctx: HighlightSearchContext): Promise<Partial<FixtureHighlight>[]>;
}
