import {
    Body,
    Post,
    Req,
    Get,
    Query,
    ParseIntPipe,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { TicketHoldService } from './ticketHold.service';
import { AcquireTicketHoldDto, ReleaseTicketHoldDto } from './ticketHold.dto';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('ticket-hold')
@ApiTags('ticket-hold')
export class TicketHoldController {
    constructor(private readonly service: TicketHoldService) {}

    @Post('acquire')
    @ApiOperation({ summary: 'Reserve a listing exclusively until expiry or checkout' })
    @ApiBody({ type: AcquireTicketHoldDto })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: { expiresAt: { type: 'string', format: 'date-time' } },
        },
    })
    async acquire(@Body() body: AcquireTicketHoldDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('Not authenticated');
        }
        return this.service.acquire({
            fixtureId: body.fixtureId,
            offerKey: body.offerKey,
            holderId: body.holderId,
            userId,
            quantity: body.quantity,
            holdMinutes: body.holdMinutes,
        });
    }

    @Post('release')
    @ApiOperation({ summary: 'Cancel reservation (timeout or user abandoned)' })
    @ApiBody({ type: ReleaseTicketHoldDto })
    async release(@Body() body: ReleaseTicketHoldDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('Not authenticated');
        }
        await this.service.release(body.holderId, userId);
        return { ok: true };
    }

    @Get('verify')
    @ApiOperation({ summary: 'Check reservation is still valid during checkout' })
    async verify(
        @Query('fixtureId', ParseIntPipe) fixtureId: number,
        @Query('offerKey') offerKey: string,
        @Query('holderId') holderId: string,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('Not authenticated');
        }
        return this.service.verify({
            fixtureId,
            offerKey,
            holderId,
            userId,
        });
    }
}
