import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('affiliateConversion')
export class AffiliateConversion extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'Ticket link that generated this conversion' })
    ticketLinkId!: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'User who converted (if recoverable from postback)' })
    userId?: number;

    @OptionalEntityColumn({ db: { type: 'numeric', precision: 10, scale: 2 } })
    @ApiPropertyOptional({ description: 'Commission amount (informational — not a financial record)' })
    commissionAmount?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 10 } })
    @ApiPropertyOptional({ description: 'Currency code, e.g. GBP' })
    currency?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiPropertyOptional({ description: 'Order or transaction ID from the affiliate network' })
    orderId?: string;

    @EntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiProperty({ description: 'Affiliate network that sent the postback, e.g. "Awin"' })
    network!: string;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional({ description: 'Raw postback payload for auditing' })
    rawPayload?: Record<string, unknown>;
}
