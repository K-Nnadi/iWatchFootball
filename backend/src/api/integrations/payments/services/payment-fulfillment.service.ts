import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSession } from '../entities/payment-session.entity';
import { PaymentSessionStatus } from '../../../enums/paymentSession.enum';
import { CheckoutService } from '../../../complexModules/checkout/checkout.service';
import { PaymentMethod } from '../../../enums/payment.enum';

@Injectable()
export class PaymentFulfillmentService {
    private readonly logger = new Logger(PaymentFulfillmentService.name);

    constructor(
        @InjectRepository(PaymentSession)
        private readonly sessionRepo: Repository<PaymentSession>,
        private readonly checkoutService: CheckoutService,
    ) {}

    async fulfillPrimaryCheckout(paymentSessionId: number, providerPaymentRef: string): Promise<void> {
        const session = await this.sessionRepo.findOne({ where: { id: paymentSessionId } });
        if (!session) {
            this.logger.warn(`PaymentSession ${paymentSessionId} not found for fulfillment`);
            return;
        }
        if (session.status === PaymentSessionStatus.COMPLETED) {
            return;
        }
        const ctx = session.checkoutContext;
        if (!ctx) {
            this.logger.warn(`PaymentSession ${paymentSessionId} missing checkoutContext`);
            return;
        }

        await this.checkoutService.confirmPurchase({
            userId: session.userId,
            fixtureId: ctx.fixtureId,
            offerKey: ctx.offerKey,
            holderId: ctx.holderId,
            quantity: ctx.quantity,
            unitPrice: ctx.unitPrice,
            category: ctx.category,
            paymentMethod: PaymentMethod.CREDIT_CARD,
            paymentProcessorId: ctx.paymentProcessorId,
            providerPaymentRef,
            idempotencyKey: session.idempotencyKey,
            discountCodeId: ctx.discountCodeId,
            verifiedPaymentSessionId: session.id,
        });

        session.status = PaymentSessionStatus.COMPLETED;
        session.providerPaymentRef = providerPaymentRef;
        await this.sessionRepo.save(session);
    }

    async markExpired(paymentSessionId: number): Promise<void> {
        const session = await this.sessionRepo.findOne({ where: { id: paymentSessionId } });
        if (!session || session.status !== PaymentSessionStatus.PENDING) return;
        session.status = PaymentSessionStatus.EXPIRED;
        await this.sessionRepo.save(session);
    }
}
