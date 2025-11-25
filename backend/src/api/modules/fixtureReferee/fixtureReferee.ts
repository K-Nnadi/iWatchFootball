import {PickType} from "@nestjs/swagger";
import {Column, Entity} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {RefereeRole} from "../../enums/referee.enum";
import {Fixture} from "../fixture/fixture";
import {Referee} from "../referee/referee";
import {EntityColumn, EntityEnumColumn, EntityRelation, RelationshipType} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('fixtureReferee')
export class FixtureReferee extends BaseDbEntity {

    @EntityColumn({
        db: { type: 'int'}
    })
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: {name: 'fixtureId'},
        description: 'Fixture for this referee assignment'
    })
    fixture!: Promise<Fixture>;

    @EntityColumn({
        db: { type: 'int'}
    })
    refereeId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Referee,
        joinOptions: {name: 'refereeId'},
        description: 'Referee for this fixture'
    })
    referee!: Referee;

    @EntityEnumColumn({
        db: {enum: RefereeRole, default: RefereeRole.MAIN}
    })
    role!: RefereeRole;
}

export class CreateFixtureRefereeDTO extends PickType(FixtureReferee, ["fixtureId", "refereeId", "role", "metadata"] as const) {}
