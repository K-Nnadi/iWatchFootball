import {
    Body,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    SetMetadata,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../auth/types/security.types';
import { TicketLinkService } from './ticketLink.service';
import {
    CreateTicketLinkDto,
    TicketLinkQueryDto,
    TicketLinkResponseDto,
    UpdateTicketLinkDto,
} from './ticketLink.dto';
import { TicketLinksEnabledGuard, SKIP_TICKET_LINKS_GUARD } from '../../complexModules/ticketLinks/ticket-links-enabled.guard';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('ticket-link')
@ApiTags('ticket-link')
export class TicketLinkController {
    constructor(private readonly service: TicketLinkService) {}

    // ─── Public read endpoints (no feature gate — links can be pre-seeded before flag is on) ───

    @Get('query')
    @Public()
    @SetMetadata(SKIP_TICKET_LINKS_GUARD, true)
    @ApiOperation({ summary: 'Query active ticket links by fixture, team, or competition' })
    @ApiQuery({ name: 'fixtureId', required: false, type: Number })
    @ApiQuery({ name: 'teamId', required: false, type: Number })
    @ApiQuery({ name: 'competitionId', required: false, type: Number })
    @ApiOkResponse({ type: [TicketLinkResponseDto] })
    async query(
        @Query('fixtureId') fixtureId?: string,
        @Query('teamId') teamId?: string,
        @Query('competitionId') competitionId?: string,
    ): Promise<TicketLinkResponseDto[]> {
        const dto: TicketLinkQueryDto = {
            fixtureId: fixtureId != null ? parseInt(fixtureId, 10) : undefined,
            teamId: teamId != null ? parseInt(teamId, 10) : undefined,
            competitionId: competitionId != null ? parseInt(competitionId, 10) : undefined,
        };
        return this.service.query(dto);
    }

    @Get(':id')
    @Public()
    @SetMetadata(SKIP_TICKET_LINKS_GUARD, true)
    @ApiOperation({ summary: 'Get a single ticket link by ID' })
    @ApiOkResponse({ type: TicketLinkResponseDto })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<TicketLinkResponseDto> {
        return this.service.findOne(id);
    }

    // ─── Click tracking (fire-and-forget, public — auth optional) ───

    @Post(':id/click')
    @Public()
    @SetMetadata(SKIP_TICKET_LINKS_GUARD, true)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Record a click on a ticket link (anonymous or authed, fire-and-forget)' })
    @ApiQuery({ name: 'source', required: false, enum: ['WEB', 'MOBILE'] })
    @ApiQuery({ name: 'fixtureId', required: false, type: Number })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async recordClick(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthedRequest,
        @Query('source') source?: string,
        @Query('fixtureId') fixtureId?: string,
    ) {
        void this.service.recordClick(id, {
            userId: req.user?.id,
            source: (source === 'MOBILE' ? 'MOBILE' : 'WEB'),
            fixtureId: fixtureId ? parseInt(fixtureId, 10) : undefined,
        });
        return { ok: true };
    }

    // ─── Admin write endpoints (feature guard applied, admin role required) ───

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, TicketLinksEnabledGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Create a new ticket link' })
    @ApiBody({ type: CreateTicketLinkDto })
    @ApiOkResponse({ type: TicketLinkResponseDto })
    async create(@Body() dto: CreateTicketLinkDto): Promise<TicketLinkResponseDto> {
        return this.service.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, TicketLinksEnabledGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Update a ticket link' })
    @ApiBody({ type: UpdateTicketLinkDto })
    @ApiOkResponse({ type: TicketLinkResponseDto })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTicketLinkDto,
    ): Promise<TicketLinkResponseDto> {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, TicketLinksEnabledGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Delete a ticket link' })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: boolean }> {
        await this.service.remove(id);
        return { ok: true };
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @SetMetadata(SKIP_TICKET_LINKS_GUARD, true)
    @ApiOperation({ summary: '(Admin) List all ticket links including expired ones' })
    @ApiOkResponse({ type: [TicketLinkResponseDto] })
    async adminListAll(): Promise<TicketLinkResponseDto[]> {
        return this.service.adminListAll();
    }
}
