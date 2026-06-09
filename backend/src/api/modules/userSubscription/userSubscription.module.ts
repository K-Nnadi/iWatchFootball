import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscription } from './userSubscription.entity';
import { UserSubscriptionService } from './userSubscription.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserSubscription])],
    providers: [UserSubscriptionService],
    exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
