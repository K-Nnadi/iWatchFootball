import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty } from '@nestjs/swagger';

@Entity('entityExternalId')
export class EntityExternalId extends BaseDbEntity {
    @EntityColumn({ db: { type: 'varchar', length: 64 } })
    @ApiProperty({ description: 'Provider slug, e.g. statsbomb, api-sports' })
    provider!: string;

    @EntityColumn({ db: { type: 'varchar', length: 32 } })
    @ApiProperty({ description: 'Entity type, e.g. team, fixture, player' })
    entityType!: string;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    localId!: number;

    @EntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiProperty()
    externalId!: string;
}
