import {
    Controller,
    Headers,
    Post,
    Req,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../auth/decorators/public.decorator';
import { StripePaymentWebhookService } from '../services/stripe-payment-webhook.service';
import type { RawBodyRequest } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

@Controller('webhooks/stripe')
@ApiTags('webhooks')
export class StripeWebhookController {
    private readonly logger = new Logger(StripeWebhookController.name);

    constructor(private readonly stripeWebhook: StripePaymentWebhookService) {}

    @Post()
    @Public()
    @ApiOperation({ summary: 'Stripe webhook (ticket payments + subscriptions)' })
    async handleStripeWebhook(
        @Headers('stripe-signature') signature: string | undefined,
        @Req() req: RawBodyRequest<FastifyRequest>,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        const rawBody = req.rawBody;
        if (!rawBody || !Buffer.isBuffer(rawBody)) {
            throw new BadRequestException(
                'Missing raw request body — required for Stripe signature verification',
            );
        }

        const event = await this.stripeWebhook.constructEvent(rawBody, signature);
        this.logger.log(`Stripe webhook received: ${event.type}`);
        await this.stripeWebhook.handleEvent(event);
        return { received: true };
    }
}
