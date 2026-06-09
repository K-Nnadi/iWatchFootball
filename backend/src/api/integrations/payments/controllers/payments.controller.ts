import {
    Body,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../../auth/decorators/public.decorator';
import { PaymentProcessorService } from '../../../modules/paymentProcessor/paymentProcessor.module';
import { StripeCredentialsService } from '../services/stripe-credentials.service';
import { PaymentSessionService } from '../services/payment-session.service';
import { CreatePaymentSessionDto } from '../dto/create-payment-session.dto';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('payments')
@ApiTags('payments')
export class PaymentsController {
    constructor(
        private readonly paymentProcessorService: PaymentProcessorService,
        private readonly stripeCredentials: StripeCredentialsService,
        private readonly paymentSessionService: PaymentSessionService,
    ) {}

    @Get('providers')
    @Public()
    @ApiOperation({ summary: 'Enabled payment processors for checkout UI' })
    @ApiOkResponse({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    type: { type: 'string' },
                    logoUrl: { type: 'string' },
                    publishableKey: { type: 'string' },
                    disabled: { type: 'boolean' },
                },
            },
        },
    })
    async getProviders() {
        const processors = await this.paymentProcessorService.getEnabledProcessors();
        let publishableKey: string | undefined;
        try {
            publishableKey = await this.stripeCredentials.getPublishableKey();
        } catch {
            publishableKey = undefined;
        }

        return processors.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            type: p.type,
            logoUrl: p.logoUrl,
            publishableKey: p.slug === 'stripe' ? publishableKey : undefined,
            disabled: p.slug === 'paypal',
        }));
    }

    @Post('sessions')
    @ApiOperation({ summary: 'Create a PSP checkout session for primary ticket purchase' })
    async createSession(@Body() dto: CreatePaymentSessionDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('Not authenticated');
        }
        return this.paymentSessionService.createSession(userId, dto);
    }

    @Get('sessions/:id')
    @ApiOperation({ summary: 'Poll payment session status after Stripe confirm' })
    async getSession(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('Not authenticated');
        }
        return this.paymentSessionService.getSession(userId, id);
    }
}
