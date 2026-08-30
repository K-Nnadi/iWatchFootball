import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { MarketplaceListing } from '../../../modules/marketplaceListing/marketplaceListing.entity';
import { MarketplaceTransaction } from '../../../modules/marketplaceListing/marketplaceTransaction.entity';
import { Payment } from '../../../modules/payment/payment.entity';
import { Transaction } from '../../../modules/transaction/transaction.entity';
import { Credit } from '../../../modules/credit/credit.entity';
import { PlatformConfigService } from '../../../modules/platformConfig/platformConfig.service';
import { MarketplaceListingStatus, TicketTransferReason } from '../../../enums/marketplace.enum';
import { PaymentMethod } from '../../../enums/payment.enum';
import { TransactionType } from '../../../enums/transaction.enum';
import { TicketOwnershipHistoryService } from '../../../modules/ticketOwnershipHistory/ticketOwnershipHistory.service';
import { UserTicketLogService } from '../../../modules/userTicketLog/userTicketLog.service';
import { TicketHoldService } from '../../../modules/ticketHold/ticketHold.service';
import { LoyaltyService } from '../../loyalty/loyalty.service';
import { assertAndDeductCredit } from '../../../modules/credit/creditSpend.util';
import { LogService } from '../../../modules/log/log.service';
import { Ticket } from '../../../modules/ticket/ticket.entity';
import { ticketAfterResalePurchase } from '../../../modules/ticket/ticket-state.util';
import { MARKETPLACE_CONFIG, MARKETPLACE_DEFAULTS } from '../marketplace.constants';

const HOLD_MINUTES_CONFIG_KEY = 'ticket_hold_minutes';
const DEFAULT_HOLD_MINUTES = 10;

/** Stable offerKey for a marketplace listing hold */
const offerKey = (listingId: number) => `marketplace-listing-${listingId}`;

@Injectable()
export class MarketplaceCheckoutService {
    constructor(
        @InjectRepository(MarketplaceListing)
        private readonly listingRepo: Repository<MarketplaceListing>,
        private readonly platformConfig: PlatformConfigService,
        private readonly ownershipHistory: TicketOwnershipHistoryService,
        private readonly userTicketLog: UserTicketLogService,
        private readonly dataSource: DataSource,
        private readonly ticketHoldService: TicketHoldService,
        private readonly loyaltyService: LoyaltyService,
        private readonly logService: LogService,
    ) {}

    async holdListing(buyerId: number, listingId: number): Promise<{ expiresAt: string; holderId: string; holdMinutes: number }> {
        const listing = await this.listingRepo.findOne({ where: { id: listingId } });

        if (!listing || listing.status !== MarketplaceListingStatus.ACTIVE) {
            throw new NotFoundException('Listing is not available');
        }
        if (listing.expiresAt <= new Date()) {
            throw new BadRequestException('This listing has expired');
        }
        if (listing.sellerId === buyerId) {
            throw new BadRequestException('You cannot purchase your own listing');
        }

        const holdMinutes = await this.platformConfig.getNumber(HOLD_MINUTES_CONFIG_KEY, DEFAULT_HOLD_MINUTES);
        const holderId = randomUUID();
        const { expiresAt } = await this.ticketHoldService.acquire({
            fixtureId: listingId,
            offerKey: offerKey(listingId),
            holderId,
            userId: buyerId,
            quantity: 1,
            holdMinutes,
        });
        return { expiresAt, holderId, holdMinutes };
    }

    async getFeePreview(listingId: number): Promise<{
        askPrice: number;
        adminFee: number;
        adminFeeRate: number;
        totalBuyerPays: number;
    }> {
        const listing = await this.listingRepo.findOne({ where: { id: listingId } });
        if (!listing) {
            throw new NotFoundException('Listing not found');
        }
        const feeRate = await this.platformConfig.getNumber(
            MARKETPLACE_CONFIG.FEE_RATE,
            MARKETPLACE_DEFAULTS.FEE_RATE,
        );
        const askPrice = Number(listing.askPrice);
        const adminFee = Math.round(askPrice * feeRate * 100) / 100;
        return {
            askPrice,
            adminFee,
            adminFeeRate: feeRate,
            totalBuyerPays: Math.round((askPrice + adminFee) * 100) / 100,
        };
    }

    async confirmPurchase(params: {
        buyerId: number;
        listingId: number;
        holderId: string;
        paymentMethod: PaymentMethod;
        paymentProcessorId?: number;
        providerPaymentRef?: string;
        idempotencyKey?: string;
    }): Promise<{ marketplaceTransactionId: number; ticketId: number }> {
        // Verify the TicketHold is still valid before entering the transaction
        await this.ticketHoldService.verify({
            fixtureId: params.listingId,
            offerKey: offerKey(params.listingId),
            holderId: params.holderId,
            userId: params.buyerId,
        });

        const txnResult = await this.dataSource.transaction(async (manager) => {
            const listingRepo = manager.getRepository(MarketplaceListing);
            const paymentRepo = manager.getRepository(Payment);
            const txRepo = manager.getRepository(Transaction);
            const creditRepo = manager.getRepository(Credit);
            const mktTxRepo = manager.getRepository(MarketplaceTransaction);

            // Idempotency: replay within 24 h
            if (params.idempotencyKey) {
                const existing = await mktTxRepo
                    .createQueryBuilder('mt')
                    .where(`mt.metadata->>'idempotencyKey' = :k`, { k: params.idempotencyKey })
                    .andWhere(`mt."createdAt" > NOW() - INTERVAL '24 hours'`)
                    .getOne();
                if (existing) {
                    const originalListing = await listingRepo.findOne({
                        where: { id: existing.listingId },
                    });
                    return {
                        marketplaceTransactionId: existing.id,
                        ticketId: originalListing?.ticketId ?? 0,
                        idempotent: true as const,
                    };
                }
            }

            // Pessimistic lock on listing
            const listing = await listingRepo
                .createQueryBuilder('l')
                .setLock('pessimistic_write')
                .where('l.id = :id', { id: params.listingId })
                .getOne();

            if (!listing || listing.status !== MarketplaceListingStatus.ACTIVE) {
                throw new ConflictException('This listing is no longer available');
            }
            if (listing.expiresAt <= new Date()) {
                throw new BadRequestException('This listing has expired');
            }

            const feeRate = await this.platformConfig.getNumber(
                MARKETPLACE_CONFIG.FEE_RATE,
                MARKETPLACE_DEFAULTS.FEE_RATE,
            );
            const askPrice = Number(listing.askPrice);
            const adminFee = Math.round(askPrice * feeRate * 100) / 100;
            const totalBuyerPays = Math.round((askPrice + adminFee) * 100) / 100;

            const isPlatformCredit = params.paymentMethod === PaymentMethod.PLATFORM_CREDIT;
            let buyerPaymentId: number;

            if (isPlatformCredit) {
                await assertAndDeductCredit(creditRepo, params.buyerId, totalBuyerPays);

                const buyerLedger = txRepo.create({
                    type: TransactionType.CREDIT_USAGE,
                    amount: totalBuyerPays,
                    description: `Marketplace ticket purchase (listing #${params.listingId}) via platform credit`,
                    userId: params.buyerId,
                    metadata: { listingId: params.listingId, adminFee, feeRate, idempotencyKey: params.idempotencyKey },
                });
                await txRepo.save(buyerLedger);
                buyerPaymentId = buyerLedger.id;
            } else {
                // Create buyer payment record
                const payment = paymentRepo.create({
                    method: params.paymentMethod,
                    status: 'COMPLETED',
                    amount: totalBuyerPays,
                    paymentProcessorId: params.paymentProcessorId,
                    metadata: {
                        idempotencyKey: params.idempotencyKey,
                        providerPaymentRef: params.providerPaymentRef,
                        listingId: params.listingId,
                        type: 'marketplace_purchase',
                    },
                });
                await paymentRepo.save(payment);

                const buyerLedger = txRepo.create({
                    type: TransactionType.CASH_PAYMENT,
                    amount: totalBuyerPays,
                    description: `Marketplace ticket purchase (listing #${params.listingId})`,
                    paymentId: payment.id,
                    userId: params.buyerId,
                    metadata: { listingId: params.listingId, adminFee, feeRate },
                });
                await txRepo.save(buyerLedger);
                buyerPaymentId = payment.id;
            }

            // Transfer ticket ownership to buyer
            await manager.getRepository(Ticket).update(listing.ticketId, ticketAfterResalePurchase(params.buyerId));

            // Mark listing as SOLD
            listing.status = MarketplaceListingStatus.SOLD;
            await listingRepo.save(listing);

            // Record the sale in marketplace_transaction first so we have its id
            // (done after listing update so we can reference it below)

            // Credit seller wallet (get or create Credit record)
            let sellerCredit = await creditRepo.findOne({
                where: { userId: listing.sellerId },
            });
            if (!sellerCredit) {
                sellerCredit = creditRepo.create({ userId: listing.sellerId, balance: 0 });
            }
            sellerCredit.balance = Math.round((Number(sellerCredit.balance) + askPrice) * 100) / 100;
            await creditRepo.save(sellerCredit);

            // Seller wallet ledger entry
            const sellerLedger = txRepo.create({
                type: TransactionType.CREDIT_TOP_UP,
                amount: askPrice,
                description: `Marketplace sale proceeds (listing #${params.listingId})`,
                userId: listing.sellerId,
                metadata: { listingId: params.listingId, buyerId: params.buyerId },
            });
            await txRepo.save(sellerLedger);

            // Record marketplace transaction
            const mktTx = mktTxRepo.create({
                listingId: params.listingId,
                buyerId: params.buyerId,
                buyerPaymentId: buyerPaymentId,
                salePrice: askPrice,
                adminFee,
                adminFeeRate: feeRate,
                sellerCreditId: sellerCredit.id,
                metadata: { idempotencyKey: params.idempotencyKey },
            });
            await mktTxRepo.save(mktTx);

            // Audit: record ticket custody change to buyer
            await this.ownershipHistory.record(manager, {
                ticketId: listing.ticketId,
                fromUserId: undefined,
                toUserId: params.buyerId,
                reason: TicketTransferReason.MARKETPLACE_SOLD,
                listingId: params.listingId,
                marketplaceTransactionId: mktTx.id,
                paymentId: isPlatformCredit ? undefined : buyerPaymentId,
            });

            // Ticket log: buyer gains ticket, seller loses it
            await this.userTicketLog.upsert(manager, params.buyerId, listing.ticketId);
            await this.userTicketLog.deactivate(manager, listing.sellerId, listing.ticketId);

            const ticket = await manager.getRepository(Ticket).findOne({ where: { id: listing.ticketId } });
            if (ticket) {
                await this.logService.upsertVerifiedAttendance(manager, params.buyerId, ticket.fixtureId, {
                    type: 'marketplace_purchase',
                    ticketId: listing.ticketId,
                    paymentId: isPlatformCredit ? undefined : buyerPaymentId,
                });
            }

            // Release the TicketHold
            await this.ticketHoldService.release(params.holderId, params.buyerId);

            return {
                marketplaceTransactionId: mktTx.id,
                ticketId: listing.ticketId,
                idempotent: false as const,
            };
        });

        if (
            !txnResult.idempotent &&
            params.paymentMethod !== PaymentMethod.PLATFORM_CREDIT &&
            (params.paymentMethod === PaymentMethod.CREDIT_CARD ||
                params.paymentMethod === PaymentMethod.PAYPAL)
        ) {
            this.loyaltyService.scheduleProcessAfterPurchase(params.buyerId);
        }

        return {
            marketplaceTransactionId: txnResult.marketplaceTransactionId,
            ticketId: txnResult.ticketId,
        };
    }
}
