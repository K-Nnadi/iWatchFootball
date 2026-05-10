import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment } from '../payment/payment.entity';
import { Transaction } from '../transaction/transaction.entity';
import { Ticket } from '../ticket/ticket.entity';
import { TicketHold } from '../ticketHold/ticketHold.entity';
import { Credit } from '../credit/credit.entity';
import { PaymentMethod } from '../../enums/payment.enum';
import { TransactionType } from '../../enums/transaction.enum';
import { TicketOwnershipHistoryService } from '../ticketOwnershipHistory/ticketOwnershipHistory.service';
import { UserTicketLogService } from '../userTicketLog/userTicketLog.service';
import { TicketTransferReason } from '../../enums/marketplace.enum';
import { DiscountCodeService } from '../discountCode/discountCode.service';
import { LoyaltyService } from '../../services/loyalty/loyalty.service';

export interface ConfirmPurchaseParams {
    userId: number;
    fixtureId: number;
    offerKey: string;
    holderId: string;
    quantity: number;
    unitPrice: number;
    category: string;
    paymentMethod: PaymentMethod;
    paymentProviderId?: number;
    providerPaymentRef?: string;
    idempotencyKey?: string;
    discountCodeId?: number;
}

@Injectable()
export class CheckoutService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ownershipHistory: TicketOwnershipHistoryService,
        private readonly userTicketLog: UserTicketLogService,
        private readonly discountCodeService: DiscountCodeService,
        private readonly loyaltyService: LoyaltyService,
    ) {}

    /**
     * Single DB transaction: validate TicketHold → payment → tickets → ledger → consume hold.
     */
    async confirmPurchase(params: ConfirmPurchaseParams): Promise<{
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

        const result = await this.dataSource.transaction(async (manager) => {
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

                // Deduct from credit balance
                const creditRepo = manager.getRepository(Credit);
                const credit = await creditRepo.findOne({ where: { userId: params.userId } });
                const balance = Number(credit?.balance ?? 0);
                if (balance < total) {
                    throw new BadRequestException(
                        `Insufficient credit balance. Available: £${balance.toFixed(2)}, required: £${total.toFixed(2)}`,
                    );
                }
                if (!credit) throw new BadRequestException('No credit account found');
                credit.balance = Math.round((balance - total) * 100) / 100;
                await creditRepo.save(credit);

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
                    paymentProviderId: params.paymentProviderId,
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

            await holdRepo.softDelete({ id: hold.id });

            return { paymentId, ticketIds, idempotent: false };
        });

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
}
