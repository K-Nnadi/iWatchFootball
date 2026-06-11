import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { PaymentSession } from '../entities/payment-session.entity';
import { PaymentSessionStatus } from '../../../enums/paymentSession.enum';
import { StripeCredentialsService } from './stripe-credentials.service';
import { stripeRetrieveCheckoutSession } from '../stripe/stripe-http.client';
import { PaymentFulfillmentService } from './payment-fulfillment.service';

@Injectable()
export class PaymentReconciliationService {
    private readonly logger = new Logger(PaymentReconciliationService.name);

    constructor(
        @InjectRepository(PaymentSession)
        private readonly sessionRepo: Repository<PaymentSession>,
        private readonly stripeCredentials: StripeCredentialsService,
        private readonly fulfillment: PaymentFulfillmentService,
    ) {}

    @Cron('*/15 * * * *')
    async reconcileStaleSessions(): Promise<void> {
        if (process.env.PAYMENT_RECONCILIATION_ENABLED === 'false') {
            return;
        }

        const graceMs = parseInt(process.env.PAYMENT_RECONCILIATION_GRACE_MS || '120000', 10);
        const cutoff = new Date(Date.now() - graceMs);

        const candidates = await this.sessionRepo.find({
            where: [
                {
                    status: PaymentSessionStatus.PENDING,
                    expiresAt: LessThan(cutoff),
                },
                {
                    status: PaymentSessionStatus.EXPIRED,
                },
            ],
            take: 50,
            order: { updatedAt: 'ASC' },
        });

        const withStripeId = candidates.filter((s) => s.providerSessionId);
        if (withStripeId.length === 0) return;

        let secretKey: string;
        try {
            secretKey = await this.stripeCredentials.getSecretKey();
        } catch {
            this.logger.warn('Payment reconciliation skipped: Stripe not configured');
            return;
        }

        for (const session of withStripeId) {
            try {
                const stripeSession = await stripeRetrieveCheckoutSession(
                    secretKey,
                    session.providerSessionId!,
                );
                const purpose = stripeSession.metadata?.purpose;
                if (purpose && purpose !== 'primary_ticket_checkout') continue;

                if (stripeSession.payment_status !== 'paid') continue;

                const paymentRef = stripeSession.payment_intent ?? stripeSession.id;
                await this.fulfillment.fulfillPrimaryCheckout({
                    paymentSessionId: session.id,
                    providerPaymentRef: String(paymentRef),
                    paymentStatus: stripeSession.payment_status,
                    amountTotalCents: stripeSession.amount_total ?? undefined,
                    currency: stripeSession.currency ?? undefined,
                });

                this.logger.log(
                    JSON.stringify({
                        type: 'payment_reconciliation_fulfilled',
                        paymentSessionId: session.id,
                        providerSessionId: session.providerSessionId,
                    }),
                );
            } catch (e) {
                this.logger.warn(
                    JSON.stringify({
                        type: 'payment_reconciliation_error',
                        paymentSessionId: session.id,
                        message: e instanceof Error ? e.message : String(e),
                    }),
                );
            }
        }
    }
}
