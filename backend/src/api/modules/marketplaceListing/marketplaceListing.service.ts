import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketplaceListing } from './marketplaceListing.entity';
import { Fixture } from '../fixture/fixture.entity';
import { Team } from '../team/team.entity';
import { Ticket } from '../ticket/ticket.entity';
import { DeliveryMethod, DisputeStatus, MarketplaceListingStatus, TicketTransferReason, TicketType } from '../../enums/marketplace.enum';
import { TicketOwnershipHistoryService } from '../ticketOwnershipHistory/ticketOwnershipHistory.service';
import { UserTicketLogService } from '../userTicketLog/userTicketLog.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../enums/notification.enum';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const EXPIRY_HOURS_BEFORE_KICKOFF = 24;

type FixtureTeamsRow = {
    fixtureId: number;
    f_date: Date;
    home_team_name: string | null;
    away_team_name: string | null;
    stadium_name: string | null;
};

@Injectable()
export class MarketplaceListingService {
    constructor(
        @InjectRepository(MarketplaceListing)
        private readonly repo: Repository<MarketplaceListing>,
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
        private readonly dataSource: DataSource,
        private readonly ownershipHistory: TicketOwnershipHistoryService,
        private readonly userTicketLog: UserTicketLogService,
        private readonly notificationService: NotificationService,
    ) {}

    /** Adds fixtureLabel, fixtureDate (kick-off ISO), stadiumName onto each nested ticket for API consumers. */
    private async enrichListingsWithFixtureLabels(listings: MarketplaceListing[]): Promise<void> {
        const fixtureIds = [
            ...new Set(
                listings
                    .map((l) => l.ticket?.fixtureId)
                    .map((id) => (id == null ? NaN : Number(id)))
                    .filter((id): id is number => Number.isFinite(id)),
            ),
        ];
        if (fixtureIds.length === 0) {
            return;
        }

        const rows: FixtureTeamsRow[] = await this.dataSource.query(
            `SELECT
                f.id AS "fixtureId",
                f.date AS "f_date",
                ht.name AS "home_team_name",
                at.name AS "away_team_name",
                st.name AS "stadium_name"
             FROM fixture f
             LEFT JOIN team ht ON ht.id = f."homeTeamId"
             LEFT JOIN team at ON at.id = f."awayTeamId"
             LEFT JOIN stadium st ON st.id = f."stadiumId"
             WHERE f.id = ANY($1::int[])`,
            [fixtureIds],
        );

        const byFixtureId = new Map<number, FixtureTeamsRow>(
            rows.map((r) => [Number(r.fixtureId), r]),
        );

        for (const listing of listings) {
            const fid =
                listing.ticket?.fixtureId != null ? Number(listing.ticket.fixtureId) : NaN;
            if (!listing.ticket || !Number.isFinite(fid)) {
                continue;
            }
            const r = byFixtureId.get(fid);
            const home = r?.home_team_name?.trim() || '';
            const away = r?.away_team_name?.trim() || '';
            const fixtureLabel =
                home && away
                    ? `${home} vs ${away}`
                    : home || away
                      ? `${home || 'TBC'} vs ${away || 'TBC'}`
                      : `Fixture #${fid}`;
            const fixtureDate = r?.f_date ? new Date(r.f_date).toISOString() : undefined;
            const stadiumName = r?.stadium_name?.trim() || undefined;
            Object.assign(listing.ticket as object, { fixtureLabel, fixtureDate, stadiumName });
        }
    }

    async createListing(params: {
        sellerId: number;
        ticketId: number;
        askPrice: number;
    }): Promise<MarketplaceListing> {
        if (params.askPrice <= 0) {
            throw new BadRequestException('Ask price must be greater than zero');
        }

        const listingId = await this.dataSource.transaction(async (manager) => {
            const ticketRepo = manager.getRepository(Ticket);
            const listingRepo = manager.getRepository(MarketplaceListing);

            const ticket = await ticketRepo.findOne({ where: { id: params.ticketId } });

            if (!ticket) {
                throw new NotFoundException('Ticket not found');
            }

            if (ticket.userId !== params.sellerId) {
                throw new ForbiddenException('You do not own this ticket');
            }

            const existing = await listingRepo.findOne({
                where: { ticketId: params.ticketId, status: MarketplaceListingStatus.ACTIVE },
            });
            if (existing) {
                throw new ConflictException('This ticket is already listed on the marketplace');
            }

            const fixtureRows = await manager.query<Array<{ date: string }>>(
                `SELECT date FROM fixture WHERE id = $1 LIMIT 1`,
                [ticket.fixtureId],
            );
            if (!fixtureRows.length) {
                throw new NotFoundException('Fixture not found for this ticket');
            }

            const kickOffTime = new Date(fixtureRows[0].date);
            const expiresAt = new Date(
                kickOffTime.getTime() - EXPIRY_HOURS_BEFORE_KICKOFF * 60 * 60 * 1000,
            );

            if (expiresAt <= new Date()) {
                throw new BadRequestException(
                    `Cannot list a ticket less than ${EXPIRY_HOURS_BEFORE_KICKOFF} hours before kick-off`,
                );
            }

            // Transfer ticket to platform custody
            await manager.query(`UPDATE ticket SET "userId" = NULL WHERE id = $1`, [
                params.ticketId,
            ]);

            const listing = listingRepo.create({
                ticketId: params.ticketId,
                sellerId: params.sellerId,
                askPrice: params.askPrice,
                status: MarketplaceListingStatus.ACTIVE,
                expiresAt,
            });
            await listingRepo.save(listing);

            await this.ownershipHistory.record(manager, {
                ticketId: params.ticketId,
                fromUserId: params.sellerId,
                toUserId: undefined,
                reason: TicketTransferReason.MARKETPLACE_LISTED,
                listingId: listing.id,
            });

            // Ticket goes into platform custody — remove from seller's wallet
            await this.userTicketLog.deactivate(manager, params.sellerId, params.ticketId);

            return listing.id;
        });

        // Use join query (not find + relations): ManyToOne relations are lazy in base decorators,
        // so findOne({ relations }) can leave ticket unset and the API loses category/fixture fields.
        const full = await this.repo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.ticket', 'ticket')
            .where('l.id = :id', { id: listingId })
            .getOne();
        if (!full) {
            throw new InternalServerErrorException('Listing created but could not be loaded');
        }
        await this.enrichListingsWithFixtureLabels([full]);
        return full;
    }

    async cancelListing(listingId: number, userId: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const listingRepo = manager.getRepository(MarketplaceListing);

            const listing = await listingRepo.findOne({ where: { id: listingId } });

            if (!listing) {
                throw new NotFoundException('Listing not found');
            }
            if (listing.sellerId !== userId) {
                throw new ForbiddenException('You can only cancel your own listings');
            }
            if (listing.status !== MarketplaceListingStatus.ACTIVE) {
                throw new BadRequestException('Only active listings can be cancelled');
            }

            listing.status = MarketplaceListingStatus.CANCELLED;
            await listingRepo.save(listing);

            // Return ticket to seller
            await manager.query(`UPDATE ticket SET "userId" = $1 WHERE id = $2`, [
                userId,
                listing.ticketId,
            ]);

            await this.ownershipHistory.record(manager, {
                ticketId: listing.ticketId,
                fromUserId: undefined,
                toUserId: userId,
                reason: TicketTransferReason.MARKETPLACE_CANCELLED,
                listingId: listing.id,
            });

            // Ticket returned to seller — reactivate in their wallet
            await this.userTicketLog.upsert(manager, userId, listing.ticketId);
        });
    }

    async getActiveListings(params: {
        fixtureId?: number;
        maxPrice?: number;
        /** Case-insensitive match on either home or away team name */
        team?: string;
        page?: number;
        limit?: number;
    }): Promise<{ listings: MarketplaceListing[]; total: number }> {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(50, params.limit ?? 20);

        const qb = this.repo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.ticket', 'ticket')
            .where('l.status = :status', { status: MarketplaceListingStatus.ACTIVE })
            .andWhere('l.expiresAt > :now', { now: new Date() });

        const teamNeedle =
            typeof params.team === 'string' && params.team.trim().length > 0
                ? params.team.trim().slice(0, 100).toLowerCase()
                : undefined;
        if (teamNeedle !== undefined) {
            qb.innerJoin(Fixture, 'mf', 'mf.id = ticket.fixtureId')
                .leftJoin(Team, 'mf_home', 'mf_home.id = mf.homeTeamId')
                .leftJoin(Team, 'mf_away', 'mf_away.id = mf.awayTeamId')
                .andWhere(
                    '(strpos(lower(coalesce(mf_home.name, \'\')), :teamNeedle) > 0 OR strpos(lower(coalesce(mf_away.name, \'\')), :teamNeedle) > 0)',
                    { teamNeedle },
                );
        }

        if (params.fixtureId != null) {
            qb.andWhere('ticket.fixtureId = :fixtureId', { fixtureId: params.fixtureId });
        }
        if (params.maxPrice != null) {
            qb.andWhere('l.askPrice <= :maxPrice', { maxPrice: params.maxPrice });
        }

        qb.orderBy('l.askPrice', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [listings, total] = await qb.getManyAndCount();
        await this.enrichListingsWithFixtureLabels(listings);
        return { listings, total };
    }

    async getSellerListings(sellerId: number): Promise<MarketplaceListing[]> {
        const listings = await this.repo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.ticket', 'ticket')
            .where('l.sellerId = :sellerId', { sellerId })
            .orderBy('l.createdAt', 'DESC')
            .getMany();
        await this.enrichListingsWithFixtureLabels(listings);
        return listings;
    }

    async getBuyerPurchases(buyerId: number): Promise<MarketplaceListing[]> {
        const listings = await this.repo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.ticket', 'ticket')
            .where('l.buyerId = :buyerId', { buyerId })
            .orderBy('l.createdAt', 'DESC')
            .getMany();
        await this.enrichListingsWithFixtureLabels(listings);
        return listings;
    }

    async submitForReview(listingId: number, sellerId: number): Promise<MarketplaceListing> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.sellerId !== sellerId) throw new ForbiddenException('Not your listing');
        if (listing.status !== MarketplaceListingStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT listings can be submitted for review');
        }
        listing.status = MarketplaceListingStatus.PENDING_REVIEW;
        return this.repo.save(listing);
    }

    async adminApproveListing(listingId: number): Promise<MarketplaceListing> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.status !== MarketplaceListingStatus.PENDING_REVIEW) {
            throw new BadRequestException('Only PENDING_REVIEW listings can be approved');
        }
        listing.status = MarketplaceListingStatus.ACTIVE;
        const saved = await this.repo.save(listing);

        await this.notificationService.createIfAllowed({
            userId: listing.sellerId,
            type: NotificationType.LISTING_APPROVED,
            title: 'Your listing is live',
            message: 'Your ticket listing has been approved and is now visible on the marketplace.',
            metadata: { listingId: listing.id },
        });

        return saved;
    }

    async adminRejectListing(listingId: number, reason: string): Promise<MarketplaceListing> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.status !== MarketplaceListingStatus.PENDING_REVIEW) {
            throw new BadRequestException('Only PENDING_REVIEW listings can be rejected');
        }
        listing.status = MarketplaceListingStatus.REJECTED;
        listing.rejectionReason = reason;
        const saved = await this.repo.save(listing);

        // Return ticket to seller on rejection
        await this.dataSource.query(`UPDATE ticket SET "userId" = $1 WHERE id = $2`, [
            listing.sellerId, listing.ticketId,
        ]);
        await this.ownershipHistory.record(this.dataSource.createQueryRunner().manager as never, {
            ticketId: listing.ticketId,
            fromUserId: undefined,
            toUserId: listing.sellerId,
            reason: TicketTransferReason.MARKETPLACE_REJECTED,
            listingId: listing.id,
        });

        await this.notificationService.createIfAllowed({
            userId: listing.sellerId,
            type: NotificationType.LISTING_REJECTED,
            title: 'Listing not approved',
            message: `Your ticket listing was not approved. Reason: ${reason}`,
            metadata: { listingId: listing.id },
        });

        return saved;
    }

    async uploadProofDocument(
        listingId: number,
        sellerId: number,
        file: { originalname: string; buffer: Buffer; size: number },
    ): Promise<void> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.sellerId !== sellerId) throw new ForbiddenException('Not your listing');
        if (file.size > 10 * 1024 * 1024) throw new BadRequestException('File must be under 10 MB');

        const baseDir = process.env.MARKETPLACE_DOCS_DIR ?? path.join(process.cwd(), 'uploads', 'marketplace-proof');
        const dir = path.join(baseDir, String(listingId));
        fs.mkdirSync(dir, { recursive: true });
        const ext = path.extname(file.originalname).toLowerCase() || '.bin';
        const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
        await fs.promises.writeFile(path.join(dir, filename), file.buffer);

        listing.proofDocumentPath = path.join(String(listingId), filename);
        await this.repo.save(listing);
    }

    async getAdminProofDocument(listingId: number): Promise<{ buffer: Buffer; ext: string }> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (!listing.proofDocumentPath) throw new NotFoundException('No proof document uploaded');

        const baseDir = process.env.MARKETPLACE_DOCS_DIR ?? path.join(process.cwd(), 'uploads', 'marketplace-proof');
        const fullPath = path.join(baseDir, listing.proofDocumentPath);
        if (!fs.existsSync(fullPath)) throw new NotFoundException('Proof file not found on disk');
        const buffer = await fs.promises.readFile(fullPath);
        return { buffer, ext: path.extname(listing.proofDocumentPath).toLowerCase() };
    }

    async requestPurchase(listingId: number, buyerId: number): Promise<MarketplaceListing> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.status !== MarketplaceListingStatus.ACTIVE) {
            throw new BadRequestException('Listing is not available for purchase');
        }
        if (listing.sellerId === buyerId) throw new BadRequestException('You cannot buy your own listing');

        listing.buyerId = buyerId;
        listing.status = MarketplaceListingStatus.SOLD;
        const saved = await this.repo.save(listing);

        await this.notificationService.createIfAllowed({
            userId: listing.sellerId,
            type: NotificationType.PURCHASE_REQUESTED,
            title: 'Someone wants your ticket!',
            message: 'A buyer has requested to purchase your ticket. Please initiate the transfer.',
            metadata: { listingId: listing.id },
        });

        return saved;
    }

    async confirmTransfer(listingId: number, sellerId: number): Promise<MarketplaceListing> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.sellerId !== sellerId) throw new ForbiddenException('Not your listing');
        if (listing.status !== MarketplaceListingStatus.SOLD) {
            throw new BadRequestException('Listing is not in SOLD state');
        }

        listing.transferInitiatedAt = new Date();
        const saved = await this.repo.save(listing);

        if (listing.buyerId) {
            await this.notificationService.createIfAllowed({
                userId: listing.buyerId,
                type: NotificationType.TRANSFER_INITIATED,
                title: 'Seller has initiated ticket transfer',
                message: 'The seller says they\'ve transferred the ticket. Please confirm receipt once you have it.',
                metadata: { listingId: listing.id },
            });
        }

        return saved;
    }

    async confirmReceipt(listingId: number, buyerId: number): Promise<MarketplaceListing> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.buyerId !== buyerId) throw new ForbiddenException('Not your purchase');
        if (!listing.transferInitiatedAt) {
            throw new BadRequestException('Seller has not yet confirmed the transfer');
        }

        listing.receiptConfirmedAt = new Date();
        const saved = await this.repo.save(listing);

        await this.notificationService.createIfAllowed({
            userId: listing.sellerId,
            type: NotificationType.TRANSFER_CONFIRMED,
            title: 'Buyer confirmed receipt',
            message: 'The buyer has confirmed they received the ticket. Your payout is being processed.',
            metadata: { listingId: listing.id },
        });

        return saved;
    }

    async raiseDispute(listingId: number, userId: number, reason: string, details: string): Promise<{ ok: boolean }> {
        const listing = await this.repo.findOne({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.sellerId !== userId && listing.buyerId !== userId) {
            throw new ForbiddenException('You are not a party to this listing');
        }

        await this.notificationService.createIfAllowed({
            userId: userId === listing.sellerId ? (listing.buyerId ?? userId) : listing.sellerId,
            type: NotificationType.DISPUTE_RAISED,
            title: 'A dispute has been raised',
            message: `A dispute has been raised on listing #${listing.id}. Admin will review.`,
            metadata: { listingId: listing.id, reason },
        });

        return { ok: true };
    }

    async getPendingReviewListings(): Promise<MarketplaceListing[]> {
        const listings = await this.repo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.ticket', 'ticket')
            .where('l.status = :status', { status: MarketplaceListingStatus.PENDING_REVIEW })
            .orderBy('l.createdAt', 'ASC')
            .getMany();
        await this.enrichListingsWithFixtureLabels(listings);
        return listings;
    }

    async getListing(listingId: number): Promise<MarketplaceListing> {
        const listing = await this.repo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.ticket', 'ticket')
            .where('l.id = :id', { id: listingId })
            .getOne();
        if (!listing) {
            throw new NotFoundException('Listing not found');
        }
        await this.enrichListingsWithFixtureLabels([listing]);
        return listing;
    }

    @Cron(CronExpression.EVERY_HOUR)
    async expireStaleListings(): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const listingRepo = manager.getRepository(MarketplaceListing);

            const stale = await listingRepo
                .createQueryBuilder('l')
                .where('l.status = :status', { status: MarketplaceListingStatus.ACTIVE })
                .andWhere('l.expiresAt <= :now', { now: new Date() })
                .getMany();

            for (const listing of stale) {
                listing.status = MarketplaceListingStatus.EXPIRED;
                await listingRepo.save(listing);

                // Return ticket to seller
                await manager.query(`UPDATE ticket SET "userId" = $1 WHERE id = $2`, [
                    listing.sellerId,
                    listing.ticketId,
                ]);

                await this.ownershipHistory.record(manager, {
                    ticketId: listing.ticketId,
                    fromUserId: undefined,
                    toUserId: listing.sellerId,
                    reason: TicketTransferReason.MARKETPLACE_EXPIRED,
                    listingId: listing.id,
                });

                // Ticket returned to seller on expiry — reactivate in their wallet
                await this.userTicketLog.upsert(manager, listing.sellerId, listing.ticketId);
            }
        });
    }
}
