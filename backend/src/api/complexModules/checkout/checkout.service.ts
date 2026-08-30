import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Payment } from '../../modules/payment/payment.entity';
import { Transaction } from '../../modules/transaction/transaction.entity';
import { Ticket } from '../../modules/ticket/ticket.entity';
import { TicketHold } from '../../modules/ticketHold/ticketHold.entity';
import { Credit } from '../../modules/credit/credit.entity';
import { PaymentMethod } from '../../enums/payment.enum';
import { TransactionType } from '../../enums/transaction.enum';
import { TicketOwnershipHistoryService } from '../../modules/ticketOwnershipHistory/ticketOwnershipHistory.service';
import { UserTicketLogService } from '../../modules/userTicketLog/userTicketLog.service';
import { TicketTransferReason } from '../../enums/marketplace.enum';
import { TicketSource, TicketStatus } from '../../enums/ticket.enum';
import { DiscountCodeService } from '../../modules/discountCode/discountCode.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { assertAndDeductCredit } from '../../modules/credit/creditSpend.util';
import { LogService } from '../../modules/log/log.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentSession } from '../../integrations/payments/entities/payment-session.entity';
import { PaymentSessionStatus } from '../../enums/paymentSession.enum';

export interface ConfirmPurchaseParams {
    userId: number;
    fixtureId: number;
    offerKey: string;
    holderId: string;
    quantity: number;
    unitPrice: number;
    category: string;
    paymentMethod: PaymentMethod;
    paymentProcessorId?: number;
    providerPaymentRef?: string;
    idempotencyKey?: string;
    discountCodeId?: number;
    /** Set only by PaymentFulfillmentService after Stripe webhook verification */
    verifiedPaymentSessionId?: number;
}

export interface ConfirmPurchaseOptions {
    manager?: EntityManager;
    /** When fulfillment already locked and validated the payment session */
    skipSessionAssert?: boolean;
}

@Injectable()
export class CheckoutService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ownershipHistory: TicketOwnershipHistoryService,
        private readonly userTicketLog: UserTicketLogService,
        private readonly discountCodeService: DiscountCodeService,
        private readonly loyaltyService: LoyaltyService,
        private readonly logService: LogService,
        @InjectRepository(PaymentSession)
        private readonly paymentSessionRepo: Repository<PaymentSession>,
    ) {}

    /**
     * Single DB transaction: validate TicketHold → payment → tickets → ledger → consume hold.
     */
    async confirmPurchase(
        params: ConfirmPurchaseParams,
        options?: ConfirmPurchaseOptions,
    ): Promise<{
        paymentId: number;
        ticketIds: number[];
        idempotent: boolean;
    }> {
        if (params.quantity < 1 || params.quantity > 20) {
            throw new BadRequestException('Invalid quantity');
        }
        if (params.unitPrice <= 0) {
            throw new BadRequestException('Invalid price');
        }

        const isExternalCardOrWallet =
            params.paymentMethod === PaymentMethod.CREDIT_CARD ||
            params.paymentMethod === PaymentMethod.PAYPAL;

        if (isExternalCardOrWallet && !params.verifiedPaymentSessionId) {
            throw new BadRequestException(
                'Card and wallet payments must complete through a verified payment session',
            );
        }

        if (params.verifiedPaymentSessionId && !options?.skipSessionAssert) {
            await this.assertVerifiedPaymentSession(params, options?.manager);
        }

        const runInTransaction = async (manager: EntityManager) => {
            const holdRepo = manager.getRepository(TicketHold);
            const paymentRepo = manager.getRepository(Payment);
            const ticketRepo = manager.getRepository(Ticket);
            const txRepo = manager.getRepository(Transaction);

            if (params.idempotencyKey) {
                const existingPay = await paymentRepo
                    .createQueryBuilder('p')
                    .where(`p.metadata->>'idempotencyKey' = :k`, { k: params.idempotencyKey })
                    .andWhere(`p."createdAt" > NOW() - INTERVAL '24 hours'`)
                    .getOne();
                if (existingPay) {
                    const tickets = await ticketRepo.find({
                        where: { paymentId: existingPay.id },
                        order: { id: 'ASC' },
                    });
                    return {
                        paymentId: existingPay.id,
                        ticketIds: tickets.map((t) => t.id),
                        idempotent: true,
                    };
                }
            }

            await holdRepo
                .createQueryBuilder()
                .softDelete()
                .where('"expiresAt" < :now', { now: new Date() })
                .execute();

            const hold = await holdRepo
                .createQueryBuilder('h')
                .setLock('pessimistic_write')
                .where('h.fixtureId = :fid', { fid: params.fixtureId })
                .andWhere('h.offerKey = :ok', { ok: params.offerKey })
                .andWhere('h.holderId = :hid', { hid: params.holderId })
                .andWhere('h.userId = :uid', { uid: params.userId })
                .getOne();

            if (!hold || hold.expiresAt.getTime() <= Date.now()) {
                throw new UnauthorizedException('Invalid or expired ticket hold');
            }

            const baseTotal =
                Math.round(params.unitPrice * params.quantity * 100) / 100;

            const isPlatformCredit = params.paymentMethod === PaymentMethod.PLATFORM_CREDIT;
            let discountAmount = 0;
            let paymentId: number;

            if (isPlatformCredit) {
                // Compute discount first to determine what to charge
                if (params.discountCodeId) {
                    discountAmount = await this.discountCodeService.apply(
                        manager, params.discountCodeId, params.userId, baseTotal,
                    );
                }
                const total = Math.max(0, Math.round((baseTotal - discountAmount) * 100) / 100);

                // Deduct from credit balance (aggregate across all rows for this user)
                const creditRepo = manager.getRepository(Credit);
                await assertAndDeductCredit(creditRepo, params.userId, total);

                // Ledger entry (no Payment row for credit payments)
                const ledger = txRepo.create({
                    type: TransactionType.CREDIT_USAGE,
                    amount: total,
                    description: 'Ticket purchase (platform credit)',
                    userId: params.userId,
                    metadata: { offerKey: params.offerKey, idempotencyKey: params.idempotencyKey },
                });
                await txRepo.save(ledger);
                paymentId = ledger.id;
            } else {
                // Compute discount first to determine what to charge
                if (params.discountCodeId) {
                    discountAmount = await this.discountCodeService.assertEligible(
                        manager,
                        params.discountCodeId,
                        params.userId,
                        baseTotal,
                    );
                }
                const total = Math.max(0, Math.round((baseTotal - discountAmount) * 100) / 100);

                const payment = paymentRepo.create({
                    method: params.paymentMethod,
                    status: 'COMPLETED',
                    amount: total,
                    paymentProcessorId: params.paymentProcessorId,
                    metadata: {
                        idempotencyKey: params.idempotencyKey,
                        providerPaymentRef: params.providerPaymentRef,
                        fixtureId: params.fixtureId,
                        offerKey: params.offerKey,
                        discountAmount: discountAmount || undefined,
                    },
                });
                await paymentRepo.save(payment);

                if (params.discountCodeId) {
                    await this.discountCodeService.recordUsage(
                        manager,
                        params.discountCodeId,
                        params.userId,
                        discountAmount,
                        payment.id,
                    );
                }

                const ledger = txRepo.create({
                    type: TransactionType.CASH_PAYMENT,
                    amount: total,
                    description: 'Ticket purchase',
                    paymentId: payment.id,
                    userId: params.userId,
                    metadata: { offerKey: params.offerKey },
                });
                await txRepo.save(ledger);
                paymentId = payment.id;
            }

            const ticketIds: number[] = [];
            for (let i = 0; i < params.quantity; i++) {
                const ticket = ticketRepo.create({
                    category: params.category,
                    price: params.unitPrice,
                    fixtureId: params.fixtureId,
                    userId: params.userId,
                    paymentId: isPlatformCredit ? undefined : paymentId,
                    status: TicketStatus.AVAILABLE,
                    source: TicketSource.PRIMARY,
                    metadata: { offerKey: params.offerKey, seatIndex: i },
                });
                await ticketRepo.save(ticket);
                ticketIds.push(ticket.id);

                await this.ownershipHistory.record(manager, {
                    ticketId: ticket.id,
                    fromUserId: undefined,
                    toUserId: params.userId,
                    reason: TicketTransferReason.PRIMARY_PURCHASE,
                    paymentId: isPlatformCredit ? undefined : paymentId,
                });

                await this.userTicketLog.upsert(manager, params.userId, ticket.id);
            }

            await this.logService.upsertVerifiedAttendance(manager, params.userId, params.fixtureId, {
                type: 'primary_purchase',
                paymentId: isPlatformCredit ? undefined : paymentId,
            });

            await holdRepo.softDelete({ id: hold.id });

            return { paymentId, ticketIds, idempotent: false };
        };

        const result = options?.manager
            ? await runInTransaction(options.manager)
            : await this.dataSource.transaction(runInTransaction);

        if (
            !result.idempotent &&
            params.paymentMethod !== PaymentMethod.PLATFORM_CREDIT &&
            (params.paymentMethod === PaymentMethod.CREDIT_CARD ||
                params.paymentMethod === PaymentMethod.PAYPAL)
        ) {
            this.loyaltyService.scheduleProcessAfterPurchase(params.userId);
        }

        return result;
    }

    private async assertVerifiedPaymentSession(
        params: ConfirmPurchaseParams,
        manager?: EntityManager,
    ): Promise<void> {
        const repo = manager
            ? manager.getRepository(PaymentSession)
            : this.paymentSessionRepo;
        const session = await repo.findOne({
            where: { id: params.verifiedPaymentSessionId! },
        });
        if (!session || session.userId !== params.userId) {
            throw new UnauthorizedException('Invalid payment session');
        }
        if (session.status !== PaymentSessionStatus.PENDING) {
            throw new BadRequestException('Payment session is not eligible for fulfillment');
        }
        const ctx = session.checkoutContext;
        if (
            !ctx ||
            ctx.fixtureId !== params.fixtureId ||
            ctx.offerKey !== params.offerKey ||
            ctx.holderId !== params.holderId ||
            ctx.quantity !== params.quantity
        ) {
            throw new BadRequestException('Payment session does not match checkout');
        }

        const baseTotal = Math.round(params.unitPrice * params.quantity * 100) / 100;
        let expectedTotal = baseTotal;
        if (params.discountCodeId) {
            const resolveDiscount = async (m: EntityManager) => {
                const discountAmount = await this.discountCodeService.assertEligible(
                    m,
                    params.discountCodeId!,
                    params.userId,
                    baseTotal,
                );
                return Math.max(0, Math.round((baseTotal - discountAmount) * 100) / 100);
            };
            expectedTotal = manager
                ? await resolveDiscount(manager)
                : await this.dataSource.transaction(resolveDiscount);
        }
        const sessionAmount = parseFloat(session.amount);
        if (Math.abs(sessionAmount - expectedTotal) > 0.01) {
            throw new BadRequestException('Payment session amount does not match checkout total');
        }
    }
}
