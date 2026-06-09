import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentIntegrationRegistry } from './registry/payment-integration.registry';
import { StripePaymentAdapter } from './adapters/stripe/stripe-payment.adapter';

@Injectable()
export class PaymentsIntegrationBootstrap implements OnModuleInit {
    constructor(
        private readonly registry: PaymentIntegrationRegistry,
        private readonly stripePaymentAdapter: StripePaymentAdapter,
    ) {}

    onModuleInit(): void {
        this.registry.register(this.stripePaymentAdapter);
    }
}
