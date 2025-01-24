import {Module} from '@nestjs/common';
import {CONFIG, TYPEORM_CONFIG} from "@iWatchFootball/base-tools/config/config";
import {PlayerModule} from "./api/modules/player/player.module";
import {ManagerEmploymentModule} from "./api/modules/managerEmployment/managerEmployment.module";
import {AddressModule} from "./api/modules/address/address.module";
import {StadiumModule} from "./api/modules/stadium/stadium.module";
import {GenericTokenModule} from "./api/modules/genericToken/genericToken.module";
import {LogModule} from "./api/modules/log/log.module";
import {UserModule} from "./api/modules/user/user.module";
import {FixtureModule} from "./api/modules/fixture/fixture.module";
import {CompetitionModule} from "./api/modules/competition/competition.module";
import {TransferModule} from "./api/modules/transfer/transfer.module";
import {PositionModule} from "./api/modules/position/position.module";
import {LineUpModule} from "./api/modules/lineUp/lineUp.module";
import {CardModule} from "./api/modules/card/card.module";
import {GoalModule} from "./api/modules/goal/goal.module";
import {SubstitutionModule} from "./api/modules/substitution/substitution.module";
import {FixtureRefereeModule} from "./api/modules/fixtureReferee/fixtureReferee.module";
import {TrophyModule} from "./api/modules/trophy/trophy.module";
import {RefereeModule} from "./api/modules/referee/referee.module";
import {InjuryModule} from "./api/modules/injury/injury.module";
import {TeamModule} from "./api/modules/team/team.module";
import {TeamCompetitionSeasonModule} from "./api/modules/teamCompetitionSeason/teamCompetitionSeason.module";
import {SeasonModule} from "./api/modules/season/season.module";
import {ManagerModule} from "./api/modules/manager/manager.module";
import {PlayerLineUpModule} from "./api/modules/playerLineUp/playerLineUp.module";
import {PredictionModule} from "./api/modules/prediction/prediction.module";
import {AuthModule} from "./api/complexModules/auth.controller";
import {PaymentModule} from "./api/modules/payment/payment.module";
import {TicketModule} from "./api/modules/ticket/ticket.module";

const Modules = [
    AddressModule,
    CardModule,
    CompetitionModule,
    FixtureModule,
    FixtureRefereeModule,
    GenericTokenModule,
    GoalModule,
    InjuryModule,
    LineUpModule,
    LogModule,
    ManagerModule,
    ManagerEmploymentModule,
    PaymentModule,
    PlayerModule,
    PlayerLineUpModule,
    PositionModule,
    PredictionModule,
    RefereeModule,
    SeasonModule,
    StadiumModule,
    SubstitutionModule,
    TeamModule,
    TeamCompetitionSeasonModule,
    TicketModule,
    TransferModule,
    TrophyModule,
    UserModule
];

const ComplexModules = [
    AuthModule
];

@Module({
    imports: [CONFIG, TYPEORM_CONFIG, ...Modules, ...ComplexModules],
})
export class AppModule {
}

