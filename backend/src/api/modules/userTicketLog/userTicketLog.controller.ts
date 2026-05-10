import { Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { UserTicketLogService } from './userTicketLog.service';
import { UserTicketLog } from './userTicketLog.entity';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('user-ticket-log')
@ApiTags('user-ticket-log')
export class UserTicketLogController {
    constructor(private readonly service: UserTicketLogService) {}

    @Get('my')
    @ApiOperation({ summary: 'Get all tickets currently in the logged-in user\'s wallet' })
    @ApiOkResponse({ type: [UserTicketLog] })
    async getMyLogs(@Req() req: AuthedRequest): Promise<UserTicketLog[]> {
        const userId = req.user?.id;
        if (!userId) return [];
        return this.service.getActiveForUser(userId);
    }
}
