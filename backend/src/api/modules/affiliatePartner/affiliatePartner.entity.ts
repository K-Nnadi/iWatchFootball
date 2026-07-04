import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
    EntityEnumColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateUrlFormat } from '../../enums/ticketLink.enum';

@Entity('affiliatePartner')
export class AffiliatePartner extends BaseDbEntity {
    @EntityColumn({ db: { type: 'varchar', length: 200 } })
    @ApiProperty({ description: 'Display name, e.g. "Trainline"' })
    name!: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiPropertyOptional({ description: 'Affiliate network, e.g. "Awin", "Impact", "Direct"' })
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

    @OptionalEntityColumn({ db: { type: 'text' } })
    @ApiPropertyOptional({ description: 'Internal notes for the admin team' })
    notes?: string;
}
