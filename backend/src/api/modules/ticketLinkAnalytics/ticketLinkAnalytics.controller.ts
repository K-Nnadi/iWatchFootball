import { Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { TicketLinkAnalyticsService } from './ticketLinkAnalytics.service';
import {
    TicketLinkAnalyticsSummaryDto,
    TicketLinkClicksByFixtureDto,
    TicketLinkClicksByLinkDto,
} from './ticketLinkAnalytics.dto';

@AuthedController('admin/ticket-link-analytics')
@ApiTags('admin/ticket-link-analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TicketLinkAnalyticsController {
    constructor(private readonly service: TicketLinkAnalyticsService) {}

    @Get('summary')
    @ApiOperation({ summary: '(Admin) Overall click + conversion summary' })
    @ApiOkResponse({ type: TicketLinkAnalyticsSummaryDto })
    async getSummary(): Promise<TicketLinkAnalyticsSummaryDto> {
        return this.service.getSummary();
    }

    @Get('by-link')
    @ApiOperation({ summary: '(Admin) Click counts grouped by ticket link' })
    @ApiOkResponse({ type: [TicketLinkClicksByLinkDto] })
    async getByLink(): Promise<TicketLinkClicksByLinkDto[]> {
        return this.service.getByLink();
    }

    @Get('by-fixture')
    @ApiOperation({ summary: '(Admin) Click counts grouped by fixture' })
    @ApiOkResponse({ type: [TicketLinkClicksByFixtureDto] })
    async getByFixture(): Promise<TicketLinkClicksByFixtureDto[]> {
        return this.service.getByFixture();
    }
}
