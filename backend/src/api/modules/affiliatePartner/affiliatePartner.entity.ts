import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
    EntityEnumColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateUrlFormat } from '../../enums/ticketLink.enum';
import { PartnerType, PlacementType } from '../../enums/partner.enum';

@Entity('affiliatePartner')
export class AffiliatePartner extends BaseDbEntity {
    @EntityColumn({ db: { type: 'varchar', length: 200 } })
    @ApiProperty({ description: 'Display name, e.g. "Trainline" or "bet365"' })
    name!: string;

    @EntityEnumColumn({ db: { type: 'varchar', length: 30, default: PartnerType.OTHER } })
    @ApiProperty({ enum: PartnerType, description: 'Category of partner — GAMBLING triggers stricter eligibility rules' })
    partnerType!: PartnerType;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiPropertyOptional({ description: 'Affiliate network, e.g. "Awin", "Income Access", "Direct"' })
    network?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiPropertyOptional({ description: 'Default affiliate tag applied when a link has no link-level tag' })
    defaultAffiliateTag?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 30 } })
    @ApiPropertyOptional({ enum: AffiliateUrlFormat, description: 'Default URL format for this partner' })
    affiliateUrlFormat?: AffiliateUrlFormat;

    @OptionalEntityColumn({ db: { type: 'numeric', precision: 5, scale: 2 } })
    @ApiPropertyOptional({ description: 'Indicative commission rate as a percentage (informational only)' })
    commissionRatePercent?: number;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty({ description: 'Whether this partner is currently active' })
    isActive!: boolean;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional({ description: 'Campaign start date — partner is hidden before this date' })
    campaignStartDate?: Date;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional({ description: 'Campaign end date — partner is hidden after this date' })
    campaignEndDate?: Date;

    @OptionalEntityColumn({ db: { type: 'text' } })
    @ApiPropertyOptional({ description: 'Internal notes for the admin team' })
    notes?: string;

    // ─── Gambling-specific compliance fields ──────────────────────────────────

    /**
     * Minimum age required to see placements from this partner.
     * Defaults to 18 for GAMBLING partners. Ignored for non-gambling partners.
     */
    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Minimum user age to see this partner (default 18 for gambling)' })
    minimumAge?: number;

    /**
     * ISO 3166-1 alpha-2 country codes where this partner is allowed.
     * Empty array = no restriction (all countries allowed).
     * For gambling partners, this must be explicitly set.
     */
    @OptionalEntityColumn({ db: { type: 'simple-array' } })
    @ApiPropertyOptional({ description: 'ISO-3166 alpha-2 codes where this partner is permitted (empty = all)', type: [String] })
    allowedCountries?: string[];

    /**
     * ISO 3166-1 alpha-2 country codes explicitly blocked for this partner.
     * Takes precedence over allowedCountries.
     */
    @OptionalEntityColumn({ db: { type: 'simple-array' } })
    @ApiPropertyOptional({ description: 'ISO-3166 alpha-2 codes explicitly blocked', type: [String] })
    blockedCountries?: string[];

    /** Whether users must have explicitly opted in to gambling content to see this partner. */
    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Require user opt-in consent before showing placements' })
    requiresUserConsent!: boolean;

    /** Whether responsible gambling messaging must be displayed alongside this partner. */
    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Always show responsible gambling message with placements' })
    requiresRGMessage!: boolean;

    /**
     * Disclosure text shown with every placement from this partner.
     * e.g. "18+ | T&Cs apply | Please gamble responsibly | begambleaware.org"
     */
    @OptionalEntityColumn({ db: { type: 'text' } })
    @ApiPropertyOptional({ description: 'Responsible gambling / disclosure text shown with every placement' })
    disclosureText?: string;

    /**
     * Which page/surface types this partner is allowed to appear on.
     * Empty = no restriction (use with care for gambling partners).
     */
    @OptionalEntityColumn({ db: { type: 'simple-array' } })
    @ApiPropertyOptional({ description: 'Allowed placement surfaces for this partner', type: [String], enum: PlacementType })
    allowedPlacements?: PlacementType[];
}
