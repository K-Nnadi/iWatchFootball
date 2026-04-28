import { Module } from '@nestjs/common';
import { ApiSportsHttpService } from './api-sports-http.service';
import { ApiSportsAdapterService } from './api-sports-adapter.service';
import { ApiSportsController } from './api-sports.controller';
import { CompetitionStandingModule } from '../../modules/competitionStanding/competitionStanding.module';
import { TeamModule } from '../../modules/team/team.module';
import { PlayerModule } from '../../modules/player/player.module';
import { TransferModule } from '../../modules/transfer/transfer.module';

@Module({
  imports: [
    CompetitionStandingModule,
    TeamModule,
    PlayerModule,
    TransferModule,
  ],
  providers: [ApiSportsHttpService, ApiSportsAdapterService],
  controllers: [ApiSportsController],
  exports: [ApiSportsAdapterService, ApiSportsHttpService],
})
export class ApiSportsAdapterModule {}
