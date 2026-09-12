import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EscrowHold } from '../../modules/escrowHold/escrowHold.entity';
import { EscrowHoldStatus } from '../../enums/escrowHold.enum';
import { MarketplaceTransaction } from '../../modules/marketplaceListing/marketplaceTransaction.entity';
import { MarketplaceListing } from '../../modules/marketplaceListing/marketplaceListing.entity';
import { Credit } from '../../modules/credit/credit.entity';
import { Transaction } from '../../modules/transaction/transaction.entity';
import { TransactionType } from '../../enums/transaction.enum';
import { SellerProfile } from '../../modules/sellerProfile/sellerProfile.entity';
import { FeeService } from './fee.service';
import { StripeCredentialsService } from '../../integrations/payments/services/stripe-credentials.service';
import {
    stripeCreateRefund,
    stripeCreateTransfer,
} from '../../integrations/payments/stripe/stripe-http.client';

@Injectable()
export class EscrowService {
    private readonly logger = new Logger(EscrowService.name);

    constructor(
        @InjectRepository(EscrowHold)
        private readonly holdRepo: Repository<EscrowHold>,
        @InjectRepository(MarketplaceTransaction)
        private readonly mktTxRepo: Repository<MarketplaceTransaction>,
        @InjectRepository(MarketplaceListing)
        private readonly listingRepo: Repository<MarketplaceListing>,
        @InjectRepository(SellerProfile)
        private readonly sellerProfileRepo: Repository<SellerProfile>,
        private readonly feeService: FeeService,
        private readonly stripeCredentials: StripeCredentialsService,
    ) {}

    async createHold(
        manager: EntityManager,
        params: { marketplaceTransactionId: number; amount: number; currency?: string },
    ): Promise<EscrowHold> {
        const repo = manager.getRepository(EscrowHold);
        const hold = repo.create({
            marketplaceTransactionId: params.marketplaceTransactionId,
            amount: params.amount,
            currency: params.currency ?? 'GBP',
            status: EscrowHoldStatus.HELD,
            heldAt: new Date(),
        });
        return repo.save(hold);
    }

    async getHoldForListing(listingId: number, userId: number): Promise<EscrowHold | null> {
        const listing = await this.listingRepo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.sellerId !== userId && listing.buyerId !== userId) {
            throw new ForbiddenException('Not a party to this listing');
        }
        const tx = await this.mktTxRepo.findOne({ where: { listingId } });
        if (!tx) return null;
        return this.holdRepo.findOne({ where: { marketplaceTransactionId: tx.id } });
    }

    async releaseByListingId(listingId: number, actorUserId: number, isAdmin = false): Promise<EscrowHold | null> {
        const tx = await this.mktTxRepo.findOne({ where: { listingId } });
        if (!tx) return null;
        return this.release(tx.id, actorUserId, isAdmin);
    }

    async release(marketplaceTransactionId: number, actorUserId: number, isAdmin = false): Promise<EscrowHold> {
        const { hold, listing, tx } = await this.loadHeld(marketplaceTransactionId);
        if (!isAdmin && listing.buyerId !== actorUserId) {
            throw new ForbiddenException('Only the buyer (or an admin) can release escrow');
        }

        const payout = await this.feeService.calculateSellerPayout(Number(tx.salePrice));
        const listingForSeller = listing;

        await this.holdRepo.manager.transaction(async (manager) => {
            const holdRepo = manager.getRepository(EscrowHold);
            const creditRepo = manager.getRepository(Credit);
            const txRepo = manager.getRepository(Transaction);

            const locked = await holdRepo.findOne({ where: { id: hold.id } });
            if (!locked || locked.status !== EscrowHoldStatus.HELD) {
                throw new BadRequestException('Escrow is no longer held');
            }

            const profile = await manager.getRepository(SellerProfile).findOne({
                where: { userId: listingForSeller.sellerId },
            });
            const stripeRef = this.readStripePaymentRef(tx);
            let stripeTransferId: string | undefined;

            if (profile?.payoutsEnabled && profile.stripeConnectAccountId && stripeRef) {
                try {
                    const secretKey = await this.stripeCredentials.getSecretKey();
                    const transfer = await stripeCreateTransfer(secretKey, {
                        amountPence: Math.round(payout.netPayout * 100),
                        currency: (locked.currency || 'GBP').toLowerCase(),
                        destination: profile.stripeConnectAccountId,
                        transferGroup: `mkt-tx-${tx.id}`,
                    });
                    stripeTransferId = transfer.id;
                } catch (e) {
                    this.logger.warn(`Stripe Connect transfer failed for tx ${tx.id}: ${String(e)}`);
                }
            }

            if (!stripeTransferId) {
                let sellerCredit = await creditRepo.findOne({
                    where: { userId: listingForSeller.sellerId },
                });
                if (!sellerCredit) {
                    sellerCredit = creditRepo.create({ userId: listingForSeller.sellerId, balance: 0 });
                }
                sellerCredit.balance =
                    Math.round((Number(sellerCredit.balance) + payout.netPayout) * 100) / 100;
                await creditRepo.save(sellerCredit);

                await txRepo.save(
                    txRepo.create({
                        type: TransactionType.CREDIT_TOP_UP,
                        amount: payout.netPayout,
                        description: `Marketplace escrow release (listing #${listing.id})`,
                        userId: listingForSeller.sellerId,
                        metadata: {
                            listingId: listing.id,
                            marketplaceTransactionId: tx.id,
                            sellerFee: payout.platformFee,
                        },
                    }),
                );

                await manager.getRepository(MarketplaceTransaction).update(tx.id, {
                    sellerCreditId: sellerCredit.id,
                } as any);
            }

            locked.status = EscrowHoldStatus.RELEASED;
            locked.releasedAt = new Date();
            locked.metadata = {
                ...((locked.metadata as Record<string, unknown>) ?? {}),
                releasedBy: actorUserId,
                sellerFee: payout.platformFee,
                netPayout: payout.netPayout,
                stripeTransferId: stripeTransferId ?? null,
            } as any;
            await holdRepo.save(locked);
        });

        const updated = await this.holdRepo.findOne({ where: { id: hold.id } });
        if (!updated) throw new NotFoundException('Escrow hold missing after release');
        return updated;
    }

    async refund(marketplaceTransactionId: number, actorUserId: number, isAdmin = false): Promise<EscrowHold> {
        const { hold, listing, tx } = await this.loadHeld(marketplaceTransactionId);
        if (!isAdmin && listing.buyerId !== actorUserId && listing.sellerId !== actorUserId) {
            throw new ForbiddenException('Only a party to the sale (or an admin) can refund escrow');
        }

        await this.holdRepo.manager.transaction(async (manager) => {
            const holdRepo = manager.getRepository(EscrowHold);
            const creditRepo = manager.getRepository(Credit);
            const txRepo = manager.getRepository(Transaction);
            const locked = await holdRepo.findOne({ where: { id: hold.id } });
            if (!locked || locked.status !== EscrowHoldStatus.HELD) {
                throw new BadRequestException('Escrow is no longer held');
            }

            const totalBuyerPays = Number(tx.salePrice) + Number(tx.adminFee);
            const stripeRef = this.readStripePaymentRef(tx);
            let stripeRefundId: string | undefined;

            if (stripeRef) {
                try {
                    const secretKey = await this.stripeCredentials.getSecretKey();
                    const refund = await stripeCreateRefund(secretKey, {
                        paymentIntentId: stripeRef,
                        amountPence: Math.round(totalBuyerPays * 100),
                    });
                    stripeRefundId = refund.id;
                } catch (e) {
                    this.logger.warn(`Stripe refund failed for tx ${tx.id}: ${String(e)}`);
                }
            }

            if (!stripeRefundId) {
                let buyerCredit = await creditRepo.findOne({ where: { userId: listing.buyerId } });
                if (!buyerCredit) {
                    buyerCredit = creditRepo.create({ userId: listing.buyerId!, balance: 0 });
                }
                buyerCredit.balance =
                    Math.round((Number(buyerCredit.balance) + totalBuyerPays) * 100) / 100;
                await creditRepo.save(buyerCredit);
                await txRepo.save(
                    txRepo.create({
                        type: TransactionType.CREDIT_REFUND,
                        amount: totalBuyerPays,
                        description: `Marketplace escrow refund (listing #${listing.id})`,
                        userId: listing.buyerId,
                        metadata: { listingId: listing.id, marketplaceTransactionId: tx.id },
                    }),
                );
            }

            locked.status = EscrowHoldStatus.REFUNDED;
            locked.refundedAt = new Date();
            locked.metadata = {
                ...((locked.metadata as Record<string, unknown>) ?? {}),
                refundedBy: actorUserId,
                stripeRefundId: stripeRefundId ?? null,
            } as any;
            await holdRepo.save(locked);
        });

        const updated = await this.holdRepo.findOne({ where: { id: hold.id } });
        if (!updated) throw new NotFoundException('Escrow hold missing after refund');
        return updated;
    }

    private async loadHeld(marketplaceTransactionId: number): Promise<{
        hold: EscrowHold;
        listing: MarketplaceListing;
        tx: MarketplaceTransaction;
    }> {
        const tx = await this.mktTxRepo.findOne({ where: { id: marketplaceTransactionId } });
        if (!tx) throw new NotFoundException('Marketplace transaction not found');
        const listing = await this.listingRepo.findOne({ where: { id: tx.listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        const hold = await this.holdRepo.findOne({ where: { marketplaceTransactionId: tx.id } });
        if (!hold) throw new NotFoundException('No escrow hold for this transaction');
        if (hold.status !== EscrowHoldStatus.HELD) {
            throw new BadRequestException(`Escrow is already ${hold.status}`);
        }
        return { hold, listing, tx };
    }

    private readStripePaymentRef(tx: MarketplaceTransaction): string | undefined {
        const meta = (tx.metadata ?? {}) as Record<string, unknown>;
        const ref = meta.providerPaymentRef ?? meta.stripePaymentIntentId;
        return typeof ref === 'string' && ref.trim() ? ref.trim() : undefined;
    }
}
