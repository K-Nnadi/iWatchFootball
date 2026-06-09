import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { UserConnection } from './userConnection.entity';
import { User } from '../user/user.entity';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserConnection, User]),
        NotificationModule,
    ],
    controllers: [SocialController],
    providers: [SocialService],
    exports: [SocialService],
})
export class SocialModule {}
