import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { TicketLink } from './ticketLink.entity';
import { TicketLinkClick } from './ticketLinkClick.entity';
import { CreateTicketLinkDto, TicketLinkQueryDto, TicketLinkResponseDto, UpdateTicketLinkDto } from './ticketLink.dto';
import { AffiliateUrlFormat, TicketLinkCategory } from '../../enums/ticketLink.enum';
import { TicketLinksFeatureService } from '../../complexModules/ticketLinks/ticket-links-feature.service';
import type { ClickSource } from '../../enums/ticketLink.enum';

@Injectable()
export class TicketLinkService {
    constructor(
        @InjectRepository(TicketLink)
        private readonly repo: Repository<TicketLink>,
        @InjectRepository(TicketLinkClick)
        private readonly clickRepo: Repository<TicketLinkClick>,
        private readonly ticketLinksFeature: TicketLinksFeatureService,
    ) {}

    async create(dto: CreateTicketLinkDto): Promise<TicketLinkResponseDto> {
        const link = this.repo.create({
            fixtureId: dto.fixtureId,
            teamId: dto.teamId,
            competitionId: dto.competitionId,
            url: dto.url,
            label: dto.label,
            linkType: dto.linkType,
            linkCategory: dto.linkCategory ?? TicketLinkCategory.TICKETS,
            isAffiliate: dto.isAffiliate,
            affiliateTag: dto.affiliateTag,
            affiliateUrlFormat: dto.affiliateUrlFormat,
            partnerId: dto.partnerId,
            isSponsored: dto.isSponsored ?? false,
            sponsorLabel: dto.sponsorLabel,
            badgeText: dto.badgeText,
            priority: dto.priority ?? 0,
            expiresAt: dto.expiresAt,
            saleInfo: dto.saleInfo,
        });
        const saved = await this.repo.save(link);
        return this.toResponseDto(saved, false);
    }

    async update(id: number, dto: UpdateTicketLinkDto): Promise<TicketLinkResponseDto> {
        const link = await this.repo.findOne({ where: { id } });
        if (!link) throw new NotFoundException('Ticket link not found');

        Object.assign(link, {
            ...(dto.fixtureId !== undefined && { fixtureId: dto.fixtureId }),
            ...(dto.teamId !== undefined && { teamId: dto.teamId }),
            ...(dto.competitionId !== undefined && { competitionId: dto.competitionId }),
            ...(dto.url !== undefined && { url: dto.url }),
            ...(dto.label !== undefined && { label: dto.label }),
            ...(dto.linkType !== undefined && { linkType: dto.linkType }),
            ...(dto.linkCategory !== undefined && { linkCategory: dto.linkCategory }),
            ...(dto.isAffiliate !== undefined && { isAffiliate: dto.isAffiliate }),
            ...(dto.affiliateTag !== undefined && { affiliateTag: dto.affiliateTag }),
            ...(dto.affiliateUrlFormat !== undefined && { affiliateUrlFormat: dto.affiliateUrlFormat }),
            ...(dto.partnerId !== undefined && { partnerId: dto.partnerId }),
            ...(dto.isSponsored !== undefined && { isSponsored: dto.isSponsored }),
            ...(dto.sponsorLabel !== undefined && { sponsorLabel: dto.sponsorLabel }),
            ...(dto.badgeText !== undefined && { badgeText: dto.badgeText }),
            ...(dto.priority !== undefined && { priority: dto.priority }),
            ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt }),
            ...(dto.saleInfo !== undefined && { saleInfo: dto.saleInfo }),
        });

        const saved = await this.repo.save(link);
        return this.toResponseDto(saved, false);
    }

    async remove(id: number): Promise<void> {
        const link = await this.repo.findOne({ where: { id } });
        if (!link) throw new NotFoundException('Ticket link not found');
        await this.repo.softDelete(id);
    }

    async findOne(id: number): Promise<TicketLinkResponseDto> {
        const link = await this.repo.findOne({ where: { id } });
        if (!link) throw new NotFoundException('Ticket link not found');
        const affiliateEnabled = await this.ticketLinksFeature.isAffiliateEnabled();
        return this.toResponseDto(link, affiliateEnabled);
    }

    async query(dto: TicketLinkQueryDto): Promise<TicketLinkResponseDto[]> {
        const now = new Date();
        const affiliateEnabled = await this.ticketLinksFeature.isAffiliateEnabled();

        const qb = this.repo
            .createQueryBuilder('tl')
            .where('tl.deletedAt IS NULL')
            .andWhere(
                new Brackets((qb2) => {
                    qb2.where('tl.expiresAt IS NULL').orWhere('tl.expiresAt > :now', { now });
                }),
            );

        if (dto.fixtureId != null || dto.teamId != null || dto.competitionId != null) {
            const orConditions: string[] = [];
            const params: Record<string, unknown> = {};

            if (dto.fixtureId != null) {
                orConditions.push('tl.fixtureId = :fixtureId');
                params.fixtureId = dto.fixtureId;
            }
            if (dto.teamId != null) {
                orConditions.push('tl.teamId = :teamId');
                params.teamId = dto.teamId;
            }
            if (dto.competitionId != null) {
                orConditions.push('tl.competitionId = :competitionId');
                params.competitionId = dto.competitionId;
            }

            qb.andWhere(
                new Brackets((qb2) => {
                    orConditions.forEach((cond, i) => {
                        if (i === 0) qb2.where(cond, params);
                        else qb2.orWhere(cond, params);
                    });
                }),
            );
        }

        qb.orderBy('tl.priority', 'ASC').addOrderBy('tl.createdAt', 'ASC');

        const links = await qb.getMany();
        return links.map((l) => this.toResponseDto(l, affiliateEnabled));
    }

    /** Admin-only: list all links without expiry/scope filter. */
    async adminListAll(): Promise<TicketLinkResponseDto[]> {
        const links = await this.repo.find({
            order: { priority: 'ASC', createdAt: 'ASC' },
        });
        return links.map((l) => this.toResponseDto(l, true));
    }

    /** Fire-and-forget click tracking. Errors are swallowed — must not impact the redirect. */
    async recordClick(
        ticketLinkId: number,
        opts: { userId?: number; fixtureId?: number; source?: ClickSource },
    ): Promise<void> {
        try {
            const exists = await this.repo.findOne({ where: { id: ticketLinkId } });
            if (!exists) return;
            await this.clickRepo.save(
                this.clickRepo.create({
                    ticketLinkId,
                    userId: opts.userId,
                    fixtureId: opts.fixtureId ?? exists.fixtureId,
                    source: opts.source ?? 'WEB',
                }),
            );
        } catch {
            // intentional no-op
        }
    }

    /**
     * Build the final URL by injecting the affiliate tag according to the configured format.
     * The raw affiliateTag and affiliateUrlFormat are NEVER returned to clients.
     */
    static buildFinalUrl(url: string, tag: string, format?: AffiliateUrlFormat): string {
        const fmt = format ?? AffiliateUrlFormat.QUERY_PARAM;
        switch (fmt) {
            case AffiliateUrlFormat.QUERY_PARAM: {
                const sep = url.includes('?') ? '&' : '?';
                return `${url}${sep}${tag}`;
            }
            case AffiliateUrlFormat.SUBID: {
                const sep = url.includes('?') ? '&' : '?';
                return `${url}${sep}subid=${encodeURIComponent(tag)}`;
            }
            case AffiliateUrlFormat.PATH_SEGMENT: {
                // tag is a path segment to append, e.g. "/r/iwf"
                const base = url.replace(/\/$/, '');
                const segment = tag.startsWith('/') ? tag : `/${tag}`;
                return `${base}${segment}`;
            }
            case AffiliateUrlFormat.REDIRECT_URL: {
                // tag is a template URL with {url} placeholder
                return tag.replace('{url}', encodeURIComponent(url));
            }
            default:
                return url;
        }
    }

    private toResponseDto(link: TicketLink, affiliateEnabled: boolean): TicketLinkResponseDto {
        let resolvedUrl = link.url;
        if (affiliateEnabled && link.isAffiliate && link.affiliateTag) {
            resolvedUrl = TicketLinkService.buildFinalUrl(link.url, link.affiliateTag, link.affiliateUrlFormat);
        }

        return {
            id: link.id,
            fixtureId: link.fixtureId,
            teamId: link.teamId,
            competitionId: link.competitionId,
            url: resolvedUrl,
            label: link.label,
            linkType: link.linkType,
            linkCategory: link.linkCategory ?? TicketLinkCategory.TICKETS,
            isAffiliate: link.isAffiliate,
            isSponsored: link.isSponsored ?? false,
            sponsorLabel: link.sponsorLabel,
            badgeText: link.badgeText,
            priority: link.priority,
            expiresAt: link.expiresAt,
            saleInfo: link.saleInfo,
            createdAt: link.createdAt,
            updatedAt: link.updatedAt,
        };
    }
}
