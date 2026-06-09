import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { UserSubscriptionModule } from '../../modules/userSubscription/userSubscription.module';
import { UserModule } from '../../modules/user/user.module';
import { TrackerModule } from '../../complexModules/tracker/tracker.module';
import { IntegrationModule } from '../../modules/integration/integration.module';
import { Integration } from '../../modules/integration/integration.entity';
import { CheckoutModule } from '../../complexModules/checkout/checkout.module';
import { TicketHoldModule } from '../../modules/ticketHold/ticketHold.module';
import { PaymentProcessorModule } from '../../modules/paymentProcessor/paymentProcessor.module';
import { DiscountCodeModule } from '../../modules/discountCode/discountCode.module';
import { PaymentSession } from './entities/payment-session.entity';
import { StripeSubscriptionService } from './services/stripe-subscription.service';
import { StripeConfigBootstrap } from './stripe/stripe-config.bootstrap';
import { SubscriptionController } from './controllers/subscription.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { PaymentsController } from './controllers/payments.controller';
import { StripeCredentialsService } from './services/stripe-credentials.service';
import { StripePaymentAdapter } from './adapters/stripe/stripe-payment.adapter';
import { PaymentIntegrationRegistry } from './registry/payment-integration.registry';
import { PaymentSessionService } from './services/payment-session.service';
import { PaymentFulfillmentService } from './services/payment-fulfillment.service';
import { StripePaymentWebhookService } from './services/stripe-payment-webhook.service';
import { PaymentsIntegrationBootstrap } from './payments-integration.bootstrap';

@Module({
    imports: [
        TypeOrmModule.forFeature([Integration, PaymentSession]),
        PlatformConfigModule,
        UserSubscriptionModule,
        UserModule,
        TrackerModule,
        IntegrationModule,
        CheckoutModule,
        TicketHoldModule,
        PaymentProcessorModule,
        DiscountCodeModule,
    ],
    controllers: [SubscriptionController, StripeWebhookController, PaymentsController],
    providers: [
        StripeSubscriptionService,
        StripeConfigBootstrap,
        StripeCredentialsService,
        StripePaymentAdapter,
        PaymentIntegrationRegistry,
        PaymentSessionService,
        PaymentFulfillmentService,
        StripePaymentWebhookService,
        PaymentsIntegrationBootstrap,
    ],
    exports: [StripeSubscriptionService, StripeCredentialsService],
})
export class PaymentsIntegrationModule {}
