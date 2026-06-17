import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavouriteTeam } from './userFavouriteTeam.entity';
import { UserFavouriteTeamService } from './userFavouriteTeam.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserFavouriteTeam])],
    providers: [UserFavouriteTeamService],
    exports: [UserFavouriteTeamService],
})
export class UserFavouriteTeamModule {}
