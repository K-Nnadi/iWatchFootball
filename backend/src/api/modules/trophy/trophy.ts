import {ApiProperty, PickType} from '@nestjs/swagger';
import {Column, Entity, ManyToOne, OneToOne} from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Competition} from "../competition/competition";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('trophy')
export class Trophy extends BaseDbEntity {
    @EntityColumn({db: {type: "varchar"}})
    name!: string;

    @OptionalEntityColumn({db: {type: "varchar"}})
    description?: string;  // Optional: Description of the trophy

    @OptionalEntityColumn({db: {type: "timestamp"}})
    yearIntroduced?: Date; // Year the trophy was first awarded

    @EntityColumn({db: {type: "int"}})
    competitionId!: number;

    @ApiProperty()
    @ManyToOne(() => Competition, competition => competition.trophies)
    competition!: Competition;
}

export class CreateTrophyDTO extends PickType(Trophy, ['name', 'description', 'yearIntroduced'] as const) {}