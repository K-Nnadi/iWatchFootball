import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketLinkClick } from '../ticketLink/ticketLinkClick.entity';
import { TicketLink } from '../ticketLink/ticketLink.entity';
import { AffiliateConversion } from '../affiliateConversion/affiliateConversion.entity';
import {
    TicketLinkAnalyticsSummaryDto,
    TicketLinkClicksByFixtureDto,
    TicketLinkClicksByLinkDto,
} from './ticketLinkAnalytics.dto';

@Injectable()
export class TicketLinkAnalyticsService {
    constructor(
        @InjectRepository(TicketLinkClick)
        private readonly clickRepo: Repository<TicketLinkClick>,
        @InjectRepository(TicketLink)
        private readonly linkRepo: Repository<TicketLink>,
        @InjectRepository(AffiliateConversion)
        private readonly conversionRepo: Repository<AffiliateConversion>,
    ) {}

    async getSummary(): Promise<TicketLinkAnalyticsSummaryDto> {
        const now = new Date();
        const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [totalClicks, clicksLast7Days, clicksLast30Days, totalConversions, activeLinks, affiliateLinks] =
            await Promise.all([
                this.clickRepo.count(),
                this.clickRepo
                    .createQueryBuilder('c')
                    .where('c.createdAt >= :day7', { day7 })
                    .getCount(),
                this.clickRepo
                    .createQueryBuilder('c')
                    .where('c.createdAt >= :day30', { day30 })
                    .getCount(),
                this.conversionRepo.count(),
                this.linkRepo
                    .createQueryBuilder('tl')
                    .where('tl.deletedAt IS NULL')
                    .getCount(),
                this.linkRepo
                    .createQueryBuilder('tl')
                    .where('tl.deletedAt IS NULL')
                    .andWhere('tl.isAffiliate = :a', { a: true })
                    .getCount(),
            ]);

        return {
            totalClicks,
            clicksLast7Days,
            clicksLast30Days,
            totalConversions,
            activeLinks,
            affiliateLinks,
        };
    }

    async getByLink(limit = 50): Promise<TicketLinkClicksByLinkDto[]> {
        const rows = await this.clickRepo
            .createQueryBuilder('c')
            .select('c.ticketLinkId', 'ticketLinkId')
            .addSelect('COUNT(*)', 'totalClicks')
            .addSelect(
                `COUNT(*) FILTER (WHERE c.createdAt >= NOW() - INTERVAL '7 days')`,
                'clicksLast7Days',
            )
            .addSelect(
                `COUNT(*) FILTER (WHERE c.createdAt >= NOW() - INTERVAL '30 days')`,
                'clicksLast30Days',
            )
            .leftJoin(TicketLink, 'tl', 'tl.id = c.ticketLinkId')
            .addSelect('tl.label', 'label')
            .groupBy('c.ticketLinkId')
            .addGroupBy('tl.label')
            .orderBy('totalClicks', 'DESC')
            .limit(limit)
            .getRawMany();

        return rows.map((r) => ({
            ticketLinkId: Number(r.ticketLinkId),
            label: r.label ?? undefined,
            totalClicks: Number(r.totalClicks),
            clicksLast7Days: Number(r.clicksLast7Days),
            clicksLast30Days: Number(r.clicksLast30Days),
        }));
    }

    async getByFixture(limit = 50): Promise<TicketLinkClicksByFixtureDto[]> {
        const rows = await this.clickRepo
            .createQueryBuilder('c')
            .select('c.fixtureId', 'fixtureId')
            .addSelect('COUNT(*)', 'totalClicks')
            .groupBy('c.fixtureId')
            .orderBy('totalClicks', 'DESC')
            .limit(limit)
            .getRawMany();

        return rows.map((r) => ({
            fixtureId: r.fixtureId != null ? Number(r.fixtureId) : undefined,
            totalClicks: Number(r.totalClicks),
        }));
    }
}
