import { ApiBody, ApiOkResponse, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Body, Get, Module, Param, Query } from '@nestjs/common';
import { IsNumber, IsOptional } from 'class-validator';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Team } from '../modules/team/team';
import { Player } from '../modules/player/player';
import { Manager } from '../modules/manager/manager';
import { Transfer } from '../modules/transfer/transfer';
import { TeamModule, TeamService } from '../modules/team/team.module';
import { PlayerModule, PlayerService } from '../modules/player/player.module';
import { ManagerModule, ManagerService } from '../modules/manager/manager.module';
import { TransferModule, TransferService } from '../modules/transfer/transfer.module';
import { ManagerEmploymentModule, ManagerEmploymentService } from '../modules/managerEmployment/managerEmployment.module';
import {TrophyModule, TrophyService} from "../modules/trophy/trophy.module";

export class TeamDataResponse {
    @ApiProperty({ type: Team })
    team!: Team;

    @ApiProperty({ type: [Player] })
    squad!: Player[];

    @ApiProperty({ type: Manager })
    manager!: Manager;

    @ApiProperty({ type: [Transfer] })
    transfers!: Transfer[];
}

export class PlayerCareerResponse {
    @ApiProperty({ type: Player })
    player!: Player;

    @ApiProperty({ type: [Transfer] })
    careerHistory!: Transfer[];
}

@AuthedController('team-management')
export class TeamManagementController {
    constructor(
        private teamService: TeamService,
        private playerService: PlayerService,
        private managerService: ManagerService,
        private transferService: TransferService,
        private managerEmploymentService: ManagerEmploymentService,
        private trophyService: TrophyService
    ) {}

    @Get('team/:teamId/complete')
    @ApiOkResponse({ type: TeamDataResponse })
    async getCompleteTeamData(@Param('teamId') teamId: number) {
        const team = await this.teamService.getOne(teamId);

        const squad = await this.playerService.getQuery({
            where: { currentTeamId: teamId },
            relations: ['position']
        });

        const currentManager = await this.managerEmploymentService.getQuery({
            where: { teamId, endDate: null },
            relations: ['manager']
        });

        const transfers = await this.transferService.getQuery({
            where: [{ fromTeamId: teamId }, { toTeamId: teamId }],
            relations: ['player', 'fromTeam', 'toTeam']
        });

        return {
            team,
            squad,
            manager: currentManager?.manager,
            transfers
        };
    }

    @Get('team/:teamId/squad')
    @ApiOkResponse({ type: [Player] })
    async getTeamSquad(@Param('teamId') teamId: number) {
        return this.playerService.getQuery({
            where: { t: teamId }
        });
    }

    @Get('team/:teamId/transfers')
    @ApiOkResponse({ type: [Transfer] })
    async getTeamTransfers(
        @Param('teamId') teamId: number,
        @Query('seasonId') @IsOptional() @IsNumber() seasonId?: number
    ) {
        const query = this.transferService
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.player', 'player')
            .leftJoinAndSelect('transfer.fromTeam', 'fromTeam')
            .leftJoinAndSelect('transfer.toTeam', 'toTeam')
            .where('transfer.fromTeamId = :teamId OR transfer.toTeamId = :teamId', { teamId });

        if (seasonId) {
            query.andWhere('transfer.seasonId = :seasonId', { seasonId });
        }

        return query.getMany();
    }

    @Get('player/:playerId/career')
    @ApiOkResponse({ type: PlayerCareerResponse })
    async getPlayerCareer(@Param('playerId') playerId: number) {
        const [player] = await this.playerService.getQuery({
            where: { id: playerId },
            relations: ['position', 'nationality', 'currentTeam']
        });

        const transfers = await this.transferService.getQuery({
            where: { playerId },
            relations: ['fromTeam', 'toTeam'],
            order: { date: 'DESC' }
        });

        const trophies = await this.trophyService.getQuery({

        })

        return {
            player,
            careerHistory: transfers
        };
    }
}

@Module({
    imports: [
        TeamModule,
        PlayerModule,
        ManagerModule,
        TransferModule,
        ManagerEmploymentModule,
        TrophyModule
    ],
    controllers: [TeamManagementController],
    providers: [],
    exports: []
})
export class TeamManagementModule {}
