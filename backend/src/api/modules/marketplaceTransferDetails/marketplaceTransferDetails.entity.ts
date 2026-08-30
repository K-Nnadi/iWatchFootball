import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty } from '@nestjs/swagger';

/** Encrypted buyer transfer details — never expose raw values in API. */
@Entity('marketplaceTransferDetails')
export class MarketplaceTransferDetails extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    listingId!: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    buyerUserId!: number;

    @EntityColumn({ db: { type: 'text' } })
    @ApiProperty({ description: 'Encrypted club app username, email, etc.' })
    encryptedPayload!: string;

    @EntityColumn({ db: { type: 'varchar', length: 32 } })
    @ApiProperty()
    keyVersion!: string;
}
