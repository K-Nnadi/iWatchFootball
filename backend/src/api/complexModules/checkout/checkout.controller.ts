import { Body, Param, ParseIntPipe, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CheckoutService } from './checkout.service';
import { ConfirmCheckoutDto } from './checkout.dto';
import type { Request } from 'express';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { PrimaryOrderRefundService } from './primary-order-refund.service';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('checkout')
@ApiTags('checkout')
export class CheckoutController {
    constructor(
        private readonly checkoutService: CheckoutService,
        private readonly primaryRefundService: PrimaryOrderRefundService,
    ) {}

    @Post('confirm')
    @ApiOperation({
        summary: 'Confirm ticket purchase (atomic payment + tickets + hold release)',
    })
    @ApiBody({ type: ConfirmCheckoutDto })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                paymentId: { type: 'number' },
                ticketIds: { type: 'array', items: { type: 'number' } },
                idempotent: { type: 'boolean' },
            },
        },
    })
    async confirm(@Body() dto: ConfirmCheckoutDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('Not authenticated');
        }
        return this.checkoutService.confirmPurchase({
            userId,
            fixtureId: dto.fixtureId,
            offerKey: dto.offerKey,
            holderId: dto.holderId,
            quantity: dto.quantity,
            unitPrice: dto.unitPrice,
            category: dto.category,
            paymentMethod: dto.paymentMethod,
            paymentProcessorId: dto.paymentProcessorId,
            providerPaymentRef: dto.providerPaymentRef,
            idempotencyKey: dto.idempotencyKey,
            discountCodeId: dto.discountCodeId,
        });
    }

    @Post('refund/:paymentId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    @ApiOperation({
        summary:
            'Full primary-market refund (admin): VOID tickets + REFUND ledger + release discount usage',
        description:
            'Does not initiate Stripe/card network refunds or marketplace reversals.',
    })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async refundPrimary(@Param('paymentId', ParseIntPipe) paymentId: number) {
        await this.primaryRefundService.refundPrimaryPayment(paymentId);
        return { ok: true };
    }
}
