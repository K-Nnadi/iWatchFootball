import { Module } from '@nestjs/common';
import { ApiSportsHttpService } from './api-sports-http.service';
import { ApiSportsAdapterService } from './api-sports-adapter.service';
import { ApiSportsController } from './api-sports.controller';
import { CompetitionStandingModule } from '../../modules/competitionStanding/competitionStanding.module';
import { CompetitionModule } from '../../modules/competition/competition.module';
import { SeasonModule } from '../../modules/season/season.module';
import { TeamModule } from '../../modules/team/team.module';
import { PlayerModule } from '../../modules/player/player.module';
import { TransferModule } from '../../modules/transfer/transfer.module';
import { TeamCompetitionSeasonModule } from '../../modules/teamCompetitionSeason/teamCompetitionSeason.module';
import { FixtureModule } from '../../modules/fixture/fixture.module';
import { StadiumModule } from '../../modules/stadium/stadium.module';

@Module({
  imports: [
    CompetitionModule,
    SeasonModule,
    CompetitionStandingModule,
    TeamModule,
    TeamCompetitionSeasonModule,
    PlayerModule,
    TransferModule,
    FixtureModule,
    StadiumModule,
  ],
  providers: [ApiSportsHttpService, ApiSportsAdapterService],
  controllers: [ApiSportsController],
  exports: [ApiSportsAdapterService, ApiSportsHttpService],
})
export class ApiSportsAdapterModule {}
