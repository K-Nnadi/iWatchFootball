import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentSession } from '../entities/payment-session.entity';
import { PaymentSessionStatus } from '../../../enums/paymentSession.enum';
import { CheckoutService } from '../../../complexModules/checkout/checkout.service';
import { PaymentMethod } from '../../../enums/payment.enum';

/** Permanent rejection — webhook should ack without retrying. */
export class PaymentFulfillmentRejectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PaymentFulfillmentRejectedError';
    }
}

export interface FulfillPrimaryCheckoutParams {
    paymentSessionId: number;
    providerPaymentRef: string;
    paymentStatus?: string;
    amountTotalCents?: number;
    currency?: string;
}

@Injectable()
export class PaymentFulfillmentService {
    private readonly logger = new Logger(PaymentFulfillmentService.name);

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(PaymentSession)
        private readonly sessionRepo: Repository<PaymentSession>,
        private readonly checkoutService: CheckoutService,
    ) {}

    async fulfillPrimaryCheckout(params: FulfillPrimaryCheckoutParams): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const sessionRepo = manager.getRepository(PaymentSession);
            const session = await sessionRepo
                .createQueryBuilder('s')
                .setLock('pessimistic_write')
                .where('s.id = :id', { id: params.paymentSessionId })
                .getOne();

            if (!session) {
                throw new NotFoundException(`PaymentSession ${params.paymentSessionId} not found`);
            }
            if (session.status === PaymentSessionStatus.COMPLETED) {
                return;
            }
            if (session.status !== PaymentSessionStatus.PENDING) {
                throw new PaymentFulfillmentRejectedError(
                    `PaymentSession ${params.paymentSessionId} is not pending (status=${session.status})`,
                );
            }

            const ctx = session.checkoutContext;
            if (!ctx) {
                await this.markSessionFailed(sessionRepo, session, 'missing checkoutContext');
                throw new PaymentFulfillmentRejectedError(
                    `PaymentSession ${params.paymentSessionId} missing checkoutContext`,
                );
            }

            if (params.paymentStatus != null && params.paymentStatus !== 'paid') {
                await this.markSessionFailed(
                    sessionRepo,
                    session,
                    `payment_status=${params.paymentStatus}`,
                );
                throw new PaymentFulfillmentRejectedError(
                    `Payment not paid (status=${params.paymentStatus})`,
                );
            }

            if (params.amountTotalCents != null) {
                const expectedPence = Math.round(parseFloat(session.amount) * 100);
                if (params.amountTotalCents !== expectedPence) {
                    await this.markSessionFailed(
                        sessionRepo,
                        session,
                        `amount mismatch: stripe=${params.amountTotalCents} expected=${expectedPence}`,
                    );
                    throw new PaymentFulfillmentRejectedError('Stripe amount does not match payment session');
                }
            }

            if (params.currency != null && params.currency.toLowerCase() !== session.currency.toLowerCase()) {
                await this.markSessionFailed(
                    sessionRepo,
                    session,
                    `currency mismatch: stripe=${params.currency} expected=${session.currency}`,
                );
                throw new PaymentFulfillmentRejectedError('Stripe currency does not match payment session');
            }

            const result = await this.checkoutService.confirmPurchase(
                {
                    userId: session.userId,
                    fixtureId: ctx.fixtureId,
                    offerKey: ctx.offerKey,
                    holderId: ctx.holderId,
                    quantity: ctx.quantity,
                    unitPrice: ctx.unitPrice,
                    category: ctx.category,
                    paymentMethod: PaymentMethod.CREDIT_CARD,
                    paymentProcessorId: ctx.paymentProcessorId,
                    providerPaymentRef: params.providerPaymentRef,
                    idempotencyKey: session.idempotencyKey,
                    discountCodeId: ctx.discountCodeId,
                    verifiedPaymentSessionId: session.id,
                },
                { manager, skipSessionAssert: true },
            );

            session.status = PaymentSessionStatus.COMPLETED;
            session.providerPaymentRef = params.providerPaymentRef;
            session.paymentId = result.paymentId;
            session.fulfilledAt = new Date();
            await sessionRepo.save(session);

            this.logger.log(
                JSON.stringify({
                    type: 'payment_fulfillment',
                    paymentSessionId: session.id,
                    paymentId: result.paymentId,
                    idempotent: result.idempotent,
                }),
            );
        });
    }

    async markExpired(paymentSessionId: number): Promise<void> {
        const session = await this.sessionRepo.findOne({ where: { id: paymentSessionId } });
        if (!session || session.status !== PaymentSessionStatus.PENDING) return;
        session.status = PaymentSessionStatus.EXPIRED;
        await this.sessionRepo.save(session);
    }

    private async markSessionFailed(
        repo: Repository<PaymentSession>,
        session: PaymentSession,
        reason: string,
    ): Promise<void> {
        session.status = PaymentSessionStatus.FAILED;
        session.metadata = { ...(session.metadata ?? {}), failureReason: reason };
        await repo.save(session);
        this.logger.warn(
            JSON.stringify({
                type: 'payment_fulfillment_rejected',
                paymentSessionId: session.id,
                reason,
            }),
        );
    }
}
