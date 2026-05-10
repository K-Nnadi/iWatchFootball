import {
    Body,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { MarketplaceListingService } from './marketplaceListing.service';
import { CreateListingDto } from './marketplaceListing.dto';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('marketplace')
@ApiTags('marketplace')
export class MarketplaceListingController {
    constructor(private readonly service: MarketplaceListingService) {}

    @Get('listings')
    @ApiOperation({ summary: 'Browse active marketplace listings' })
    @ApiQuery({ name: 'fixtureId', required: false, type: Number })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    @ApiQuery({
        name: 'team',
        required: false,
        type: String,
        description: 'Filter listings whose fixture involves a team matching this substring (home or away, case-insensitive)',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                listings: { type: 'array' },
                total: { type: 'number' },
            },
        },
    })
    async getListings(
        @Query('fixtureId') fixtureId?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('team') team?: string,
        @Query('page') page?: string,
    ) {
        return this.service.getActiveListings({
            fixtureId: fixtureId != null ? parseInt(fixtureId, 10) : undefined,
            maxPrice: maxPrice != null ? parseFloat(maxPrice) : undefined,
            team: team?.trim() || undefined,
            page: page != null ? parseInt(page, 10) : 1,
        });
    }

    @Get('listings/my')
    @ApiOperation({ summary: "Get the authenticated user's own listings" })
    async getMyListings(@Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.service.getSellerListings(userId);
    }

    @Get('listings/:id')
    @ApiOperation({ summary: 'Get a single marketplace listing by id' })
    async getListing(@Param('id', ParseIntPipe) id: number) {
        return this.service.getListing(id);
    }

    @Post('listings')
    @ApiOperation({ summary: 'List an owned ticket for resale' })
    @ApiBody({ type: CreateListingDto })
    async createListing(@Body() dto: CreateListingDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.service.createListing({
            sellerId: userId,
            ticketId: dto.ticketId,
            askPrice: dto.askPrice,
        });
    }

    @Delete('listings/:id')
    @ApiOperation({ summary: 'Cancel an active listing (seller only). Ticket returned to seller.' })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async cancelListing(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        await this.service.cancelListing(id, userId);
        return { ok: true };
    }
}
