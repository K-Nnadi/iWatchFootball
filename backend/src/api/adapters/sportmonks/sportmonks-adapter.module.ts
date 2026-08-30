import { Module } from '@nestjs/common';
import { SportMonksHttpService } from './sportmonks-http.service';
import { SportMonksAdapterService } from './sportmonks-adapter.service';
import { SportMonksController } from './sportmonks.controller';
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
import { StadiumModule, StadiumService } from '../../modules/stadium/stadium.module';
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
    StadiumModule,
    FixtureTeamStatModule,
  ],
  providers: [SportMonksHttpService, SportMonksAdapterService],
  controllers: [SportMonksController],
  exports: [SportMonksAdapterService, SportMonksHttpService],
})
export class SportMonksAdapterModule {}
