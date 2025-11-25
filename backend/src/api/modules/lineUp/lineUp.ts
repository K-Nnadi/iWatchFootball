import {PickType} from '@nestjs/swagger';
import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Fixture} from "../fixture/fixture";
import {Team} from "../team/team";
import {Manager} from "../manager/manager";
import {PlayerLineUp} from "../playerLineUp/playerLineUp";
import {EntityColumn, EntityRelation, OptionalEntityColumn, RelationshipType} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('lineUp')
export class LineUp extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: {name: 'fixtureId'},
        description: 'Fixture for this line-up'
    })
    fixture!: Promise<Fixture>;

    @EntityColumn({db: {type: "int"}})
    teamId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Team,
        joinOptions: {name: 'teamId'},
        description: 'Team for this line-up'
    })
    team?: Promise<Team>;

    @EntityColumn({db: {type: "int"}})
    managerId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Manager,
        joinOptions: {name: 'managerId'},
        description: 'Manager for this line-up'
    })
    manager?: Promise<Manager>;

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => PlayerLineUp,
        inverseSide: (playerLineUp: PlayerLineUp) => playerLineUp.lineup,
        description: 'Player line-ups for this line-up'
    })
    playerLineups?: Promise<PlayerLineUp[]>;

    @OptionalEntityColumn({db: {type: "varchar"}})
    formation?: string; // e.g., 4-4-2, 3-5-2
}

export class CreateLineUpDTO extends PickType(LineUp, ["fixtureId", "teamId", "managerId", "formation", "metadata"] as const) {}
