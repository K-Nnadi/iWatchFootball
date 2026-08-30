import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty } from '@nestjs/swagger';

@Entity('officialInventorySnapshot')
export class OfficialInventorySnapshot extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    fixtureId!: number;

    @EntityColumn({ db: { type: 'varchar', length: 64 } })
    @ApiProperty()
    providerSlug!: string;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiProperty()
    availabilityJson?: Record<string, unknown>;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty()
    syncedAt!: Date;
}
