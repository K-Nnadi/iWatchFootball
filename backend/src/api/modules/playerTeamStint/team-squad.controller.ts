import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { PlayerTeamStintService } from './playerTeamStint.service';
import { TransferService } from '../transfer/transfer.module';
import { Transfer } from '../transfer/transfer.entity';
import {
    TeamCurrentManagerResponse,
    TeamSeasonsResponse,
    TeamSquadResponse,
} from './team-squad.types';

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
    @ApiOkResponse({ type: TeamSquadResponse, description: 'Display-ready squad members' })
    async getTeamSquad(
        @Param('teamId', ParseIntPipe) teamId: number,
        @Query('seasonId') seasonIdRaw?: string,
        @Query('includeLoans') includeLoansRaw?: string,
    ): Promise<TeamSquadResponse> {
        const includeLoans = includeLoansRaw === 'true' || includeLoansRaw === '1';
        const seasonId =
            seasonIdRaw != null && seasonIdRaw !== '' ? Number(seasonIdRaw) : undefined;
        const scopedSeason = seasonId != null && Number.isFinite(seasonId) ? seasonId : undefined;

        const players = await this.stintService.getSquadMembers(teamId, scopedSeason, includeLoans);

        return {
            players,
            scope: scopedSeason != null ? 'season' : 'current',
            ...(scopedSeason != null ? { seasonId: scopedSeason } : {}),
        };
    }

    @Get(':teamId/manager')
    @Public()
    @ApiOperation({ summary: 'Current manager for a team (employment first, then team.managerId)' })
    @ApiOkResponse({ type: TeamCurrentManagerResponse })
    async getTeamManager(
        @Param('teamId', ParseIntPipe) teamId: number,
    ): Promise<TeamCurrentManagerResponse> {
        return this.stintService.getCurrentManager(teamId);
    }

    @Get(':teamId/seasons')
    @Public()
    @ApiOperation({ summary: 'Seasons this team has squad or competition rows for' })
    @ApiOkResponse({ type: TeamSeasonsResponse })
    async getTeamSeasons(
        @Param('teamId', ParseIntPipe) teamId: number,
    ): Promise<TeamSeasonsResponse> {
        const seasons = await this.stintService.getTeamSeasons(teamId);
        return { seasons };
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
