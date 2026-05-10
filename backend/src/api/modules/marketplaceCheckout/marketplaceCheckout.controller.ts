import {
    Body,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { MarketplaceCheckoutService } from './marketplaceCheckout.service';
import { PlatformConfigService } from '../platformConfig/platformConfig.service';
import { ConfirmMarketplacePurchaseDto } from './marketplaceCheckout.dto';
import { UpdatePlatformConfigDto } from '../platformConfig/platformConfig.dto';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number; type?: string } };

@AuthedController('marketplace')
@ApiTags('marketplace')
export class MarketplaceCheckoutController {
    constructor(
        private readonly checkoutService: MarketplaceCheckoutService,
        private readonly configService: PlatformConfigService,
    ) {}

    @Post('hold/:listingId')
    @ApiOperation({ summary: 'Reserve a listing exclusively before payment (15 min hold)' })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                expiresAt: { type: 'string', format: 'date-time' },
                holderId: { type: 'string', format: 'uuid', description: 'Pass this back in confirm to prove your hold' },
            },
        },
    })
    async holdListing(
        @Param('listingId', ParseIntPipe) listingId: number,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.checkoutService.holdListing(userId, listingId);
    }

    @Get('listings/:listingId/fee-preview')
    @ApiOperation({ summary: 'Get the fee breakdown for a listing before purchasing' })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                askPrice: { type: 'number' },
                adminFee: { type: 'number' },
                adminFeeRate: { type: 'number' },
                totalBuyerPays: { type: 'number' },
            },
        },
    })
    async getFeePreview(@Param('listingId', ParseIntPipe) listingId: number) {
        return this.checkoutService.getFeePreview(listingId);
    }

    @Post('checkout/confirm')
    @ApiOperation({
        summary: 'Complete a marketplace ticket purchase (atomic: payment + ticket transfer + seller credit)',
    })
    @ApiBody({ type: ConfirmMarketplacePurchaseDto })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                marketplaceTransactionId: { type: 'number' },
                ticketId: { type: 'number' },
            },
        },
    })
    async confirmPurchase(
        @Body() dto: ConfirmMarketplacePurchaseDto,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.checkoutService.confirmPurchase({
            buyerId: userId,
            listingId: dto.listingId,
            holderId: dto.holderId,
            paymentMethod: dto.paymentMethod,
            paymentProviderId: dto.paymentProviderId,
            providerPaymentRef: dto.providerPaymentRef,
            idempotencyKey: dto.idempotencyKey,
        });
    }

    @Patch('config/:key')
    @ApiOperation({ summary: 'Update a platform config value (admin only)' })
    @ApiBody({ type: UpdatePlatformConfigDto })
    async updateConfig(
        @Param('key') key: string,
        @Body() dto: UpdatePlatformConfigDto,
        @Req() req: AuthedRequest,
    ) {
        if (req.user?.type !== 'ADMIN') {
            throw new UnauthorizedException('Admin access required');
        }
        await this.configService.set(key, dto);
        return { ok: true, key, valueType: dto.valueType };
    }
}
