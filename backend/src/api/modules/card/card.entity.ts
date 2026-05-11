import {ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {CardType} from "../../enums/card.enum";
import {EntityColumn, EntityRelation, OptionalEntityColumn, RelationshipType} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {Fixture} from "../fixture/fixture.entity";
import {Player} from "../player/player.entity";
import {Team} from "../team/team.entity";

@Entity('card')
export class Card extends BaseDbEntity {

    @EntityColumn({ db: { type: 'int' } })
    fixtureId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: {name: 'fixtureId'},
        description: 'Fixture where this card was given'
    })
    fixture?: Promise<Fixture>;

    @EntityColumn({ db: { type: 'int' } })
    playerId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Player,
        joinOptions: {name: 'playerId'},
        description: 'Player who received this card'
    })
    player?: Promise<Player>;

    @ApiPropertyOptional({ description: 'Team whose player received the card' })
    @OptionalEntityColumn({ db: { type: 'int' } })
    teamId?: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Team,
        joinOptions: { name: 'teamId' },
        description: 'Team whose player received the card',
    })
    team?: Promise<Team>;

    @ApiProperty()
    @Column({ type: 'enum', enum: CardType })
    type!: CardType; // Enum for yellow or red card

    @ApiProperty()
    @Column({ type: 'int' })
    minute!: number;
}

export class CreateCardDTO extends PickType(Card, ["fixtureId", "playerId", "teamId", "type", "minute", "metadata"] as const) {}
