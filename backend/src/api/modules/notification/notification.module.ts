import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from './userNotification.entity';
import { CommsPreference } from '../commsPreference/commsPreference.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserNotification, CommsPreference])],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
