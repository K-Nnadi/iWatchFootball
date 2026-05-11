import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {StatsBombAdapterService} from './statsbomb-adapter.service';
import {StatsBombController} from './statsbomb.controller';
import {StatsBombHttpService} from './statsbomb-http.service';
import {CompetitionModule} from '../../modules/competition/competition.module';
import {SeasonModule} from '../../modules/season/season.module';
import {TeamModule} from '../../modules/team/team.module';
import {PlayerModule} from '../../modules/player/player.module';
import {FixtureModule} from '../../modules/fixture/fixture.module';
import {GoalModule} from '../../modules/goal/goal.module';
import {PositionModule} from '../../modules/position/position.module';
import {StadiumModule} from '../../modules/stadium/stadium.module';
import {CardModule} from "../../modules/card/card.module";
import {SubstitutionModule} from "../../modules/substitution/substitution.module";
import {TeamCompetitionSeasonModule} from "../../modules/teamCompetitionSeason/teamCompetitionSeason.module";
import {LineUpModule} from "../../modules/lineUp/lineUp.module";
import {PlayerLineUpModule} from "../../modules/playerLineUp/playerLineUp.module";
import {ManagerModule} from "../../modules/manager/manager.module";
import {Card} from '../../modules/card/card.entity';
import {Goal} from '../../modules/goal/goal.entity';
import {Substitution} from '../../modules/substitution/substitution.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Card, Goal, Substitution]),
        CompetitionModule,
        SeasonModule,
        TeamModule,
        PlayerModule,
        TeamCompetitionSeasonModule,
        FixtureModule,
        LineUpModule,
        PlayerLineUpModule,
        ManagerModule,
        GoalModule,
        PositionModule,
        StadiumModule,
        CardModule,
        SubstitutionModule
    ],
    providers: [StatsBombAdapterService, StatsBombHttpService],
    controllers: [StatsBombController],
    exports: [StatsBombAdapterService],
})
export class StatsBombAdapterModule {
}
