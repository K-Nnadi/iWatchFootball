import { Body, Get, Param, ParseIntPipe, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { UserRatingService } from './userRating.service';
import { CreateRatingDto, UserTrustSummaryDto } from './userRating.dto';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('ratings')
@ApiTags('ratings')
export class UserRatingController {
    constructor(private readonly service: UserRatingService) {}

    @Post()
    @ApiOperation({ summary: 'Submit a post-transaction rating' })
    @ApiBody({ type: CreateRatingDto })
    async submitRating(@Body() dto: CreateRatingDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.submitRating(userId, dto);
    }

    @Get('listing/:listingId')
    @ApiOperation({ summary: 'Get the current user rating for a listing, if any' })
    async getMyListingRating(
        @Param('listingId', ParseIntPipe) listingId: number,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.getMyRatingForListing(listingId, userId);
    }

    @Get(':userId/summary')
    @Public()
    @ApiOperation({ summary: 'Get public trust score summary for a user' })
    @ApiOkResponse({ type: UserTrustSummaryDto })
    async getTrustSummary(@Param('userId', ParseIntPipe) userId: number): Promise<UserTrustSummaryDto> {
        return this.service.getTrustSummary(userId);
    }
}
