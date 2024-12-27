import {ApiProperty, PickType} from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {CardType} from "../../enums/card.enum";
import {EntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('card')
export class Card extends BaseDbEntity {

    @EntityColumn({})
    fixtureId!: number;

    @EntityColumn()
    playerId!: number;

    @ApiProperty()
    @Column({ type: 'enum', enum: CardType })
    type!: CardType; // Enum for yellow or red card

    @ApiProperty()
    @Column()
    minute!: number;
}

export class CreateCardDTO extends PickType(Card, ["fixtureId", "playerId", "type", "minute"] as const) {}
