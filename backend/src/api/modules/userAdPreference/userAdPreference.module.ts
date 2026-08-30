import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdPreference } from './userAdPreference.entity';
import { UserAdPreferenceController } from './userAdPreference.controller';
import { UserAdPreferenceService } from './userAdPreference.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserAdPreference])],
    controllers: [UserAdPreferenceController],
    providers: [UserAdPreferenceService],
    exports: [UserAdPreferenceService],
})
export class UserAdPreferenceModule {}
