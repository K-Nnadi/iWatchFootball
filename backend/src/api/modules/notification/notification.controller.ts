import {
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { NotificationService } from './notification.service';
import { UserNotification } from './userNotification.entity';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('notifications')
@ApiTags('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @ApiOperation({ summary: 'List recent in-app notifications' })
    @ApiOkResponse({ type: UserNotification, isArray: true })
    async list(@Req() req: AuthedRequest): Promise<UserNotification[]> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.notificationService.listForUser(userId);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Unread notification count' })
    async unreadCount(@Req() req: AuthedRequest): Promise<{ count: number }> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        const count = await this.notificationService.getUnreadCount(userId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark one notification as read' })
    async markRead(
        @Req() req: AuthedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ ok: true }> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        await this.notificationService.markRead(userId, id);
        return { ok: true };
    }

    @Post('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllRead(@Req() req: AuthedRequest): Promise<{ ok: true }> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        await this.notificationService.markAllRead(userId);
        return { ok: true };
    }
}
