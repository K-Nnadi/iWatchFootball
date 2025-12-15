import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Transaction} from '../../modules/transaction/transaction.entity';
import {Credit} from '../../modules/credit/credit.entity';
import {LoyaltyScheme} from '../../modules/loyaltyScheme/loyaltyScheme.entity';
import {LoyaltyEvent} from '../../modules/loyaltyEvent/loyaltyEvent.entity';
import {User} from '../../modules/user/user.entity';
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

