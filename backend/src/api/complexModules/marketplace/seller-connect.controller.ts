import { Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { MarketplaceEnabledGuard } from './marketplace-enabled.guard';
import { SellerConnectService } from './seller-connect.service';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('seller/connect')
@ApiTags('seller-connect')
@UseGuards(MarketplaceEnabledGuard)
export class SellerConnectController {
    constructor(private readonly sellerConnect: SellerConnectService) {}

    @Get('status')
    @ApiOperation({ summary: "Seller's Stripe Connect onboarding status" })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                configured: { type: 'boolean' },
                stripeConnectAccountId: { type: 'string', nullable: true },
                onboardingComplete: { type: 'boolean' },
                payoutsEnabled: { type: 'boolean' },
                canList: { type: 'boolean' },
            },
        },
    })
    async status(@Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.sellerConnect.getStatus(userId);
    }

    @Post('onboard')
    @ApiOperation({ summary: 'Start Stripe Connect Express onboarding and return the hosted URL' })
    @ApiOkResponse({
        schema: { type: 'object', properties: { url: { type: 'string' } } },
    })
    async onboard(@Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.sellerConnect.startOnboarding(userId);
    }
}
