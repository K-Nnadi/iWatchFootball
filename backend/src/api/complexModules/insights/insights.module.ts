import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { IntegrationModule } from '../../modules/integration/integration.module';
import { AiUsageEvent } from './ai-usage-event.entity';
import { Fixture } from '../../modules/fixture/fixture.entity';
import { Competition } from '../../modules/competition/competition.entity';
import { LineUp } from '../../modules/lineUp/lineUp.entity';
import { Goal } from '../../modules/goal/goal.entity';
import { IntegrationResolverService } from './integration-resolver.service';
import { AiUsageService } from './ai-usage.service';
import { FixtureBriefBuilder } from './fixture-brief.builder';
import { LlmClientService } from './llm-client.service';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { InsightsAccessGuard } from './insights-access.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([AiUsageEvent, Fixture, Competition, LineUp, Goal]),
        IntegrationModule,
        AuthModule,
    ],
    controllers: [InsightsController],
    providers: [
        IntegrationResolverService,
        AiUsageService,
        FixtureBriefBuilder,
        LlmClientService,
        InsightsService,
        InsightsAccessGuard,
    ],
})
export class InsightsModule {}
