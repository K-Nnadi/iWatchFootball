import {
    Body,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../auth/types/security.types';
import { TicketInterestService } from './ticketInterest.service';
import {
    AdminDemandStatsDto,
    CreateTicketInterestDto,
    DemandStatsDto,
    TicketInterestResponseDto,
} from './ticketInterest.dto';
import { TicketDemandFeatureService } from '../../complexModules/ticketDemand/ticket-demand-feature.service';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('ticket-interest')
@ApiTags('ticket-interest')
export class TicketInterestController {
    constructor(
        private readonly service: TicketInterestService,
        private readonly featureService: TicketDemandFeatureService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Register or update interest in attending a match' })
    @ApiBody({ type: CreateTicketInterestDto })
    @ApiOkResponse({ type: TicketInterestResponseDto })
    async upsert(@Body() dto: CreateTicketInterestDto, @Req() req: AuthedRequest): Promise<TicketInterestResponseDto> {
        await this.featureService.assertEnabled();
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.upsert(userId, dto);
    }

    @Get('my')
    @ApiOperation({ summary: "Get the authenticated user's ticket interests" })
    @ApiOkResponse({ type: [TicketInterestResponseDto] })
    async getMyInterests(@Req() req: AuthedRequest): Promise<TicketInterestResponseDto[]> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.getMyInterests(userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel a ticket interest' })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async cancel(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        await this.featureService.assertEnabled();
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        await this.service.cancel(id, userId);
        return { ok: true };
    }

    @Get(':fixtureId/demand')
    @Public()
    @ApiOperation({ summary: 'Get public aggregate demand stats for a fixture (count only, no user data)' })
    @ApiOkResponse({ type: DemandStatsDto })
    async getDemand(@Param('fixtureId', ParseIntPipe) fixtureId: number): Promise<DemandStatsDto> {
        return this.service.getDemand(fixtureId);
    }

    @Get(':fixtureId/demand/admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Get detailed demand stats including avg max price' })
    @ApiOkResponse({ type: AdminDemandStatsDto })
    async getAdminDemand(@Param('fixtureId', ParseIntPipe) fixtureId: number): Promise<AdminDemandStatsDto> {
        return this.service.getAdminDemand(fixtureId);
    }

    @Post('notify/:fixtureId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Notify all interested users for a fixture that resale is now live' })
    @ApiOkResponse({ schema: { type: 'object', properties: { notified: { type: 'number' } } } })
    async notifyInterested(@Param('fixtureId', ParseIntPipe) fixtureId: number) {
        return this.service.notifyInterested(fixtureId);
    }
}
