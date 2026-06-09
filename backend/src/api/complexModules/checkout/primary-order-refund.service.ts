import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment } from '../../modules/payment/payment.entity';
import { Transaction } from '../../modules/transaction/transaction.entity';
import { Ticket } from '../../modules/ticket/ticket.entity';
import { DiscountCodeUsage } from '../../modules/discountCode/discountCodeUsage.entity';
import { DiscountCode } from '../../modules/discountCode/discountCode.entity';
import { PaymentMethod } from '../../enums/payment.enum';
import { TransactionType } from '../../enums/transaction.enum';
import { UserTicketLogService } from '../../modules/userTicketLog/userTicketLog.service';

/**
 * v1: full-order primary-market refund only — ledger reversal + ticket void + discount release.
 * Does not automate Stripe money movement, marketplace resale, wallet-only purchases, or partial refunds.
 */
@Injectable()
export class PrimaryOrderRefundService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly userTicketLog: UserTicketLogService,
    ) {}

    async refundPrimaryPayment(paymentId: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const paymentRepo = manager.getRepository(Payment);
            const payment = await paymentRepo.findOne({ where: { id: paymentId } });
            if (!payment) {
                throw new NotFoundException('Payment not found');
            }

            const meta = payment.metadata as Record<string, unknown> | undefined;
            if (meta?.type === 'marketplace_purchase') {
                throw new BadRequestException(
                    'Marketplace refunds are blocked until payouts and reversal are implemented.',
                );
            }

            if (
                payment.method !== PaymentMethod.CREDIT_CARD &&
                payment.method !== PaymentMethod.PAYPAL
            ) {
                throw new BadRequestException(
                    'Automated refunds are only supported for CreditCard/PayPal primary purchases.',
                );
            }

            if (payment.status === 'REFUNDED') {
                throw new ConflictException('This payment is already refunded.');
            }

            const txRepo = manager.getRepository(Transaction);

            const existingRefund = await txRepo.findOne({
                where: { paymentId: payment.id, type: TransactionType.REFUND },
            });
            if (existingRefund) {
                throw new ConflictException('A refund ledger entry already exists for this payment.');
            }

            const cashLine = await txRepo.findOne({
                where: { paymentId: payment.id, type: TransactionType.CASH_PAYMENT },
            });
            if (!cashLine || Number(cashLine.amount) === 0) {
                throw new BadRequestException(
                    'No qualifying cash payment ledger row found for this payment.',
                );
            }

            const userId = cashLine.userId;
            const refundAmount = Math.round(Math.abs(Number(cashLine.amount)) * 100) / 100;

            const ticketRepo = manager.getRepository(Ticket);
            const tickets = await ticketRepo.find({ where: { paymentId: payment.id } });

            const usageRepo = manager.getRepository(DiscountCodeUsage);
            const usages = await usageRepo.find({ where: { paymentId: payment.id } });

            for (const t of tickets) {
                await ticketRepo.softDelete({ id: t.id });
                await this.userTicketLog.deactivate(manager, userId, t.id);
            }

            const codeRepo = manager.getRepository(DiscountCode);
            for (const u of usages) {
                const code = await codeRepo.findOne({ where: { id: u.discountCodeId } });
                await usageRepo.softDelete({ id: u.id });
                if (code && code.totalUsesCount > 0) {
                    code.totalUsesCount -= 1;
                    await codeRepo.save(code);
                }
            }

            payment.status = 'REFUNDED';
            await paymentRepo.save(payment);

            await txRepo.save(
                txRepo.create({
                    userId,
                    paymentId: payment.id,
                    type: TransactionType.REFUND,
                    amount: refundAmount,
                    description: `Full-order refund (payment #${payment.id})`,
                    metadata: { primaryMarket: true },
                }),
            );
        });
    }
}
