import {
    BadRequestException,
    Body,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { MarketplaceCheckoutService } from './marketplaceCheckout.service';
import { PlatformConfigService } from '../../../modules/platformConfig/platformConfig.service';
import { ConfirmMarketplacePurchaseDto } from './marketplaceCheckout.dto';
import { UpdatePlatformConfigDto } from '../../../modules/platformConfig/platformConfig.dto';
import { MarketplaceEnabledGuard } from '../marketplace-enabled.guard';
import { SkipMarketplaceGuard } from '../skip-marketplace-guard.decorator';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number; type?: string } };

@AuthedController('marketplace')
@ApiTags('marketplace')
@UseGuards(MarketplaceEnabledGuard)
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

    @Get('fees')
    @ApiOperation({ summary: 'Public marketplace buyer/seller fee rates' })
    async getFees() {
        return this.checkoutService.getPublicFees();
    }

    @Get('fees/payout-preview')
    @ApiOperation({ summary: 'Seller net payout estimate for an asking price' })
    async getPayoutPreview(@Query('askPrice') askPriceRaw?: string) {
        const askPrice = Number(askPriceRaw);
        if (!Number.isFinite(askPrice) || askPrice <= 0) {
            throw new BadRequestException('askPrice must be a positive number');
        }
        return this.checkoutService.getSellerPayoutPreview(askPrice);
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
            paymentProcessorId: dto.paymentProcessorId,
            providerPaymentRef: dto.providerPaymentRef,
            idempotencyKey: dto.idempotencyKey,
        });
    }

    @Get('listings/:listingId/escrow')
    @ApiOperation({ summary: 'Escrow hold status for a listing the caller is a party to' })
    async getListingEscrow(
        @Param('listingId', ParseIntPipe) listingId: number,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.checkoutService.getEscrowForListing(listingId, userId);
    }

    @Post('payments/release/:transactionId')
    @ApiOperation({ summary: 'Release escrow to the seller after transfer confirmation' })
    async releaseEscrow(
        @Param('transactionId', ParseIntPipe) transactionId: number,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.checkoutService.releaseEscrow(transactionId, userId, req.user?.type === 'ADMIN');
    }

    @Post('payments/refund/:transactionId')
    @ApiOperation({ summary: 'Refund escrow to the buyer (held funds only)' })
    async refundEscrow(
        @Param('transactionId', ParseIntPipe) transactionId: number,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.checkoutService.refundEscrow(transactionId, userId, req.user?.type === 'ADMIN');
    }

    @Patch('config/:key')
    @SkipMarketplaceGuard()
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
