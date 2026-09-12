import { Module } from '@nestjs/common';
import { SportApiHttpService } from './sportapi-http.service';
import { SportApiAdapterService } from './sportapi-adapter.service';
import { SportApiController } from './sportapi.controller';
import { CompetitionModule } from '../../modules/competition/competition.module';
import { SeasonModule } from '../../modules/season/season.module';
import { TeamModule } from '../../modules/team/team.module';
import { PlayerModule } from '../../modules/player/player.module';
import { FixtureModule } from '../../modules/fixture/fixture.module';
import { CompetitionStandingModule } from '../../modules/competitionStanding/competitionStanding.module';
import { TeamCompetitionSeasonModule } from '../../modules/teamCompetitionSeason/teamCompetitionSeason.module';
import { GoalModule } from '../../modules/goal/goal.module';
import { CardModule } from '../../modules/card/card.module';
import { SubstitutionModule } from '../../modules/substitution/substitution.module';
import { LineUpModule } from '../../modules/lineUp/lineUp.module';
import { PlayerLineUpModule } from '../../modules/playerLineUp/playerLineUp.module';
import { ManagerModule } from '../../modules/manager/manager.module';
import { ManagerEmploymentModule } from '../../modules/managerEmployment/managerEmployment.module';
import { StadiumModule } from '../../modules/stadium/stadium.module';
import { FixtureTeamStatModule } from '../../modules/fixtureTeamStat/fixtureTeamStat.module';

@Module({
  imports: [
    CompetitionModule,
    SeasonModule,
    TeamModule,
    PlayerModule,
    FixtureModule,
    CompetitionStandingModule,
    TeamCompetitionSeasonModule,
    GoalModule,
    CardModule,
    SubstitutionModule,
    LineUpModule,
    PlayerLineUpModule,
    ManagerModule,
    ManagerEmploymentModule,
    StadiumModule,
    FixtureTeamStatModule,
  ],
  providers: [SportApiHttpService, SportApiAdapterService],
  controllers: [SportApiController],
  exports: [SportApiAdapterService, SportApiHttpService],
})
export class SportApiAdapterModule {}
