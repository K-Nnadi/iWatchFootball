import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bullmq';
import {CONFIG, TYPEORM_CONFIG} from "@iWatchFootball/base-tools/config/config";
import {PlayerModule} from "./api/modules/player/player.module";
import {ManagerEmploymentModule} from "./api/modules/managerEmployment/managerEmployment.module";
import {AddressModule} from "./api/modules/address/address.module";
import {StadiumModule} from "./api/modules/stadium/stadium.module";
import {GenericTokenModule} from "./api/modules/genericToken/genericToken.module";
import {LogModule} from "./api/modules/log/log.module";
import {UserModule} from "./api/modules/user/user.module";
import {CommsPreferenceModule} from "./api/modules/commsPreference/commsPreference.module";
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
import {AuthModule} from "./api/complexControllers/auth.controller";
import {AuthModule as CoreAuthModule} from "./auth/auth.module";
import {PaymentModule} from "./api/modules/payment/payment.module";
import {PaymentProviderModule} from "./api/modules/paymentProvider/paymentProvider.module";
import {TicketModule} from "./api/modules/ticket/ticket.module";
import {TransactionModule} from "./api/modules/transaction/transaction.module";
import {CreditModule} from "./api/modules/credit/credit.module";
import {LoyaltySchemeModule} from "./api/modules/loyaltyScheme/loyaltyScheme.module";
import {LoyaltyEventModule} from "./api/modules/loyaltyEvent/loyaltyEvent.module";
import {LoyaltyModule} from "./api/services/loyalty/loyalty.module";
import {NewsArticleModule} from "./api/modules/newsArticle/newsArticle.module";
import {NewsAggregatorModule} from "./api/services/news/news-aggregator.module";
import {StatsBombAdapterModule} from "./api/adapters/statsbomb/statsbomb-adapter.module";
import {ApiSportsAdapterModule} from "./api/adapters/api-sports/api-sports-adapter.module";
import {HealthController} from "./health/health.controller";
import {DataSeedingModule} from "./api/complexControllers/dataSeeding.controller";

// Only configure BullMQ if Redis is available
const BULL_MODULE = process.env.REDIS_HOST ? BullModule.forRoot({
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
}) : null

const Modules = [
    AddressModule,
    CardModule,
    CommsPreferenceModule,
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
    NewsArticleModule,
    NewsAggregatorModule,
    PaymentModule,
    PaymentProviderModule,
    CreditModule,
    TransactionModule,
    LoyaltySchemeModule,
    LoyaltyEventModule,
    LoyaltyModule,
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
    UserModule,
    StatsBombAdapterModule,
    ApiSportsAdapterModule
];

const ComplexModules = [
    AuthModule,
    DataSeedingModule,
    CoreAuthModule
];


@Module({
    imports: [
        CONFIG,
        TYPEORM_CONFIG,
        ...(BULL_MODULE ? [BULL_MODULE] : []),
        ...Modules,
        ...ComplexModules
    ],
    controllers: [HealthController],
})
export class AppModule {
}

