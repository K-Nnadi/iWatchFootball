import {Module} from '@nestjs/common';
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

@Module({
    imports: [
        CompetitionModule,
        SeasonModule,
        TeamModule,
        PlayerModule,
        FixtureModule,
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
