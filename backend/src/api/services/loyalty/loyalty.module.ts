import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Transaction} from '../../modules/transaction/transaction';
import {Credit} from '../../modules/credit/credit';
import {LoyaltyScheme} from '../../modules/loyaltyScheme/loyaltyScheme';
import {LoyaltyEvent} from '../../modules/loyaltyEvent/loyaltyEvent';
import {User} from '../../modules/user/user';
import {LoyaltyService} from './loyalty.service';
import {CreditModule} from '../../modules/credit/credit.module';
import {LoyaltySchemeModule} from '../../modules/loyaltyScheme/loyaltyScheme.module';
import {LoyaltyEventModule} from '../../modules/loyaltyEvent/loyaltyEvent.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, Credit, LoyaltyScheme, LoyaltyEvent, User]),
        CreditModule,
        LoyaltySchemeModule,
        LoyaltyEventModule,
    ],
    providers: [LoyaltyService],
    exports: [LoyaltyService],
})
export class LoyaltyModule {}

