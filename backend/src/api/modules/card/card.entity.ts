import {ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {CardType} from "../../enums/card.enum";
import {EntityColumn, EntityRelation, RelationshipType} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {Fixture} from "../fixture/fixture.entity";
import {Player} from "../player/player.entity";

@Entity('card')
export class Card extends BaseDbEntity {

    @EntityColumn({})
    fixtureId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: {name: 'fixtureId'},
        description: 'Fixture where this card was given'
    })
    fixture?: Promise<Fixture>;

    @EntityColumn()
    playerId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Player,
        joinOptions: {name: 'playerId'},
        description: 'Player who received this card'
    })
    player?: Promise<Player>;

    @ApiProperty()
    @Column({ type: 'enum', enum: CardType })
    type!: CardType; // Enum for yellow or red card

    @ApiProperty()
    @Column()
    minute!: number;
}

export class CreateCardDTO extends PickType(Card, ["fixtureId", "playerId", "type", "minute", "metadata"] as const) {}
