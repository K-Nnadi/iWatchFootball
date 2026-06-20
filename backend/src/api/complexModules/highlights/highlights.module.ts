import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixtureHighlightModule } from '../../modules/fixtureHighlight/fixtureHighlight.module';
import { Fixture } from '../../modules/fixture/fixture.entity';
import { Team } from '../../modules/team/team.entity';
import { YouTubeModule } from '../../adapters/youtube/youtube.module';
import { HighlightProviderRegistry } from './highlight-provider.registry';
import { YouTubeHighlightProvider } from './youtube-highlight.provider';
import { HighlightsService } from './highlights.service';
import { HighlightsProcessor } from './highlights.processor';
import { HighlightsScheduler } from './highlights.scheduler';
import { HighlightsController } from './highlights.controller';

const hasRedis = !!process.env.REDIS_HOST;
const bullQueueModule = hasRedis
    ? BullModule.registerQueue({ name: 'highlights' })
    : null;

@Module({
    imports: [
        TypeOrmModule.forFeature([Fixture, Team]),
        FixtureHighlightModule,
        YouTubeModule,
        ...(bullQueueModule ? [bullQueueModule] : []),
    ],
    controllers: [HighlightsController],
    providers: [
        HighlightProviderRegistry,
        YouTubeHighlightProvider,
        HighlightsService,
        HighlightsScheduler,
        ...(hasRedis ? [HighlightsProcessor] : []),
        {
            provide: 'HIGHLIGHTS_BOOTSTRAP',
            useFactory: (registry: HighlightProviderRegistry, youtube: YouTubeHighlightProvider) => {
                registry.register(youtube);
            },
            inject: [HighlightProviderRegistry, YouTubeHighlightProvider],
        },
    ],
})
export class HighlightsModule {}
