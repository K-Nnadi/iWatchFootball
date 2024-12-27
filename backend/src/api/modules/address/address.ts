import {ApiPropertyOptional, PickType} from '@nestjs/swagger';
import {Entity, OneToOne} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Stadium} from '../stadium/stadium';
import {OptionalEntityColumn} from '@iWatchFootball/base-tools/decorators/entity.decorator';

@Entity('address')
export class Address extends BaseDbEntity {
    @OptionalEntityColumn({
        db: { type: 'varchar', length: 255 },
        api: { description: 'Primary address line', example: '123 Main Street' },
    })
    address1?: string;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 255 },
        api: { description: 'Secondary address line', example: 'Suite 200' },
    })
    address2?: string;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 100 },
        api: { description: 'Town or city', example: 'London' },
    })
    townOrCity?: string;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 20 },
        api: { description: 'Postcode or ZIP code', example: 'SW1A 1AA' },
    })
    postcode?: string;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 100 },
        api: { description: 'Country name', example: 'United Kingdom' },
    })
    country?: string;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 255 },
        api: { description: 'Location description or coordinates', example: '51.509865, -0.118092' },
    })
    location?: string;

    @OptionalEntityColumn({
        db: { type: 'int', nullable: true },
        api: { description: 'Associated stadium ID', example: 5 },
    })
    stadiumId?: number;

    @ApiPropertyOptional({ description: 'Associated stadium entity' })
    @OneToOne(() => Stadium, (stadium) => stadium.address)
    stadium?: Stadium;
}

export class CreateAddressDTO extends PickType(Address, ['address1', 'address2', 'townOrCity', 'postcode', 'location', "stadiumId"] as const) {}
