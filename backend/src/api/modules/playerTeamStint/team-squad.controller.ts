import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { PlayerTeamStintService } from './playerTeamStint.service';
import { TransferService } from '../transfer/transfer.module';
import { Player } from '../player/player.entity';
import { Transfer } from '../transfer/transfer.entity';

export class TeamSquadResponse {
    players!: Player[];
    seasonId?: number;
}

export class TeamTransfersResponse {
    ins!: Transfer[];
    outs!: Transfer[];
}

@ApiTags('team')
@Controller('team')
export class TeamSquadController {
    constructor(
        private readonly stintService: PlayerTeamStintService,
        private readonly transferService: TransferService,
    ) {}

    @Get(':teamId/squad')
    @Public()
    @ApiOperation({ summary: 'Current or season-scoped squad for a team' })
    @ApiQuery({ name: 'seasonId', required: false, type: Number })
    @ApiQuery({ name: 'includeLoans', required: false, type: Boolean })
    @ApiOkResponse({ description: 'Players in the squad' })
    async getTeamSquad(
        @Param('teamId', ParseIntPipe) teamId: number,
        @Query('seasonId') seasonIdRaw?: string,
        @Query('includeLoans') includeLoansRaw?: string,
    ): Promise<TeamSquadResponse> {
        const includeLoans = includeLoansRaw === 'true' || includeLoansRaw === '1';
        const seasonId =
            seasonIdRaw != null && seasonIdRaw !== '' ? Number(seasonIdRaw) : undefined;

        const players =
            seasonId != null && Number.isFinite(seasonId)
                ? await this.stintService.getSquadForSeason(teamId, seasonId, includeLoans)
                : await this.stintService.getCurrentSquad(teamId, includeLoans);

        return {
            players,
            ...(seasonId != null && Number.isFinite(seasonId) ? { seasonId } : {}),
        };
    }

    @Get(':teamId/transfers')
    @Public()
    @ApiOperation({ summary: 'Incoming and outgoing transfers for a team' })
    @ApiOkResponse({ description: 'Transfer lists grouped by direction' })
    async getTeamTransfers(
        @Param('teamId', ParseIntPipe) teamId: number,
    ): Promise<TeamTransfersResponse> {
        const [ins, outs] = await Promise.all([
            this.transferService.getQuery({
                where: { destinationTeamId: teamId },
                order: { date: 'DESC' as const },
                take: 100,
            } as any),
            this.transferService.getQuery({
                where: { sourceTeamId: teamId },
                order: { date: 'DESC' as const },
                take: 100,
            } as any),
        ]);

        return { ins, outs };
    }
}
