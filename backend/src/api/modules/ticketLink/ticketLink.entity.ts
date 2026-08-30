import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
    EntityRelation,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateUrlFormat, TicketLinkCategory, TicketLinkType } from '../../enums/ticketLink.enum';
import { AffiliatePartner } from '../affiliatePartner/affiliatePartner.entity';

/** Structured on-sale info stored as JSONB — manually maintained by admin. */
export interface SaleInfo {
    requiresMembership?: boolean;
    membershipName?: string;
    membersSaleDate?: string;       // ISO date string
    generalSaleDate?: string;       // ISO date string
    awayFanProcess?: string;        // free-text description
    notes?: string;
    lastVerified?: string;          // ISO date string — when admin last checked
}

@Entity('ticketLink')
export class TicketLink extends BaseDbEntity {
    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Fixture this link applies to' })
    fixtureId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Team whose home matches this link applies to' })
    teamId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Competition this link applies to' })
    competitionId?: number;

    @EntityColumn({ db: { type: 'varchar', length: 2048 } })
    @ApiProperty({ description: 'Target URL (HTTPS). Affiliate tag is appended server-side if applicable.' })
    url!: string;

    @EntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiProperty({ description: 'Display label shown on the CTA button, e.g. "Buy Official Tickets"' })
    label!: string;

    @EntityEnumColumn({ db: { type: 'varchar', length: 30 } })
    @ApiProperty({ enum: TicketLinkType })
    linkType!: TicketLinkType;

    @EntityEnumColumn({ db: { type: 'varchar', length: 30 } })
    @ApiProperty({ enum: TicketLinkCategory, description: 'Display group this link belongs to' })
    linkCategory!: TicketLinkCategory;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Whether this is an affiliate link' })
    isAffiliate!: boolean;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiPropertyOptional({ description: 'Affiliate tag appended to URL server-side (never exposed to clients)' })
    affiliateTag?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 30 } })
    @ApiPropertyOptional({ enum: AffiliateUrlFormat, description: 'How the affiliate tag is injected into the URL' })
    affiliateUrlFormat?: AffiliateUrlFormat;

    /** FK to AffiliatePartner — optional; provides fallback tag/format defaults. */
    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Optional reference to an affiliate partner registry entry' })
    partnerId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => AffiliatePartner,
        joinOptions: { name: 'partnerId' },
        description: 'Affiliate partner registry entry',
    })
    partner?: AffiliatePartner;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Whether this link is from an officially verified source' })
    isVerifiedOfficial!: boolean;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty({ description: 'Admin soft-disable without delete' })
    isActive!: boolean;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty({ description: 'Set false by nightly health check when URL is unreachable' })
    isHealthy!: boolean;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    lastHealthCheckAt?: Date;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional({ description: 'Admin-facing health check error message' })
    healthCheckError?: string;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Whether this is a paid sponsored placement' })
    isSponsored!: boolean;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 200 } })
    @ApiPropertyOptional({ description: 'Sponsor attribution text, e.g. "Sponsored by Trainline"' })
    sponsorLabel?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 50 } })
    @ApiPropertyOptional({ description: 'Badge text shown next to the link, e.g. "Official"' })
    badgeText?: string;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'Display priority — lower numbers appear first' })
    priority!: number;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional({ description: 'Link auto-hides after this timestamp (e.g. shortly after kick-off)' })
    expiresAt?: Date;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional({ description: 'On-sale dates and membership requirements (manually maintained)' })
    saleInfo?: SaleInfo;
}
