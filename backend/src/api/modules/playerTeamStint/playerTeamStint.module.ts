import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CreatePlayerTeamStintDTO, PlayerTeamStint } from './playerTeamStint.entity';
import { PlayerTeamStintService } from './playerTeamStint.service';
import { TeamSquadController } from './team-squad.controller';
import { Player } from '../player/player.entity';
import { Transfer } from '../transfer/transfer.entity';
import { Season } from '../season/season.entity';
import { TransferModule } from '../transfer/transfer.module';

@AuthedController('playerTeamStint')
export class PlayerTeamStintController extends CrudController<
    PlayerTeamStint,
    CreatePlayerTeamStintDTO
>(PlayerTeamStint, CreatePlayerTeamStintDTO) {
    constructor(private service: PlayerTeamStintService) {
        super(service);
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([PlayerTeamStint, Player, Transfer, Season]),
        TransferModule,
    ],
    controllers: [PlayerTeamStintController, TeamSquadController],
    providers: [PlayerTeamStintService],
    exports: [PlayerTeamStintService],
})
export class PlayerTeamStintModule {}
