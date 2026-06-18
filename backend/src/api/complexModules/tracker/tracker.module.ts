import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { UserSubscriptionModule } from '../../modules/userSubscription/userSubscription.module';
import { SocialModule } from '../../modules/social/social.module';
import { Log } from '../../modules/log/log.entity';
import { User } from '../../modules/user/user.entity';
import { TrackerEntitlementService } from './tracker-entitlement.service';
import { TrackerStatsService } from './tracker-stats.service';
import { TrackerCompareService } from './tracker-compare.service';
import { TrackerController } from './tracker.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Log, User]),
        PlatformConfigModule,
        UserSubscriptionModule,
        SocialModule,
    ],
    controllers: [TrackerController],
    providers: [TrackerEntitlementService, TrackerStatsService, TrackerCompareService],
    exports: [TrackerEntitlementService, TrackerStatsService, TrackerCompareService],
})
export class TrackerModule {}
