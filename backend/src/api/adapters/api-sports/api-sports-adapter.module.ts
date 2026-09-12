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
import { PlayerTeamStintModule } from '../../modules/playerTeamStint/playerTeamStint.module';
import { TeamCompetitionSeasonModule } from '../../modules/teamCompetitionSeason/teamCompetitionSeason.module';
import { FixtureModule } from '../../modules/fixture/fixture.module';
import { StadiumModule } from '../../modules/stadium/stadium.module';
import { TeamStadiumModule } from '../../modules/teamStadium/teamStadium.module';
import { FixtureTeamStatModule } from '../../modules/fixtureTeamStat/fixtureTeamStat.module';
import { GoalModule } from '../../modules/goal/goal.module';
import { CardModule } from '../../modules/card/card.module';
import { SubstitutionModule } from '../../modules/substitution/substitution.module';
import { LineUpModule } from '../../modules/lineUp/lineUp.module';
import { PlayerLineUpModule } from '../../modules/playerLineUp/playerLineUp.module';
import { ManagerModule } from '../../modules/manager/manager.module';
import { ManagerEmploymentModule } from '../../modules/managerEmployment/managerEmployment.module';

@Module({
  imports: [
    CompetitionModule,
    SeasonModule,
    CompetitionStandingModule,
    TeamModule,
    TeamCompetitionSeasonModule,
    TeamStadiumModule,
    PlayerModule,
    TransferModule,
    PlayerTeamStintModule,
    FixtureModule,
    StadiumModule,
    FixtureTeamStatModule,
    GoalModule,
    CardModule,
    SubstitutionModule,
    LineUpModule,
    PlayerLineUpModule,
    ManagerModule,
    ManagerEmploymentModule,
  ],
  providers: [ApiSportsHttpService, ApiSportsAdapterService],
  controllers: [ApiSportsController],
  exports: [ApiSportsAdapterService, ApiSportsHttpService],
})
export class ApiSportsAdapterModule {}
