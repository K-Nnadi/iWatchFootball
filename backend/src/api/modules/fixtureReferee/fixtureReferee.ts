import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {RefereeRole} from "../../enums/referee.enum";
import {Fixture} from "../fixture/fixture";
import {Referee} from "../referee/referee";
import {EntityColumn, EntityEnumColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('fixtureReferee')
export class FixtureReferee extends BaseDbEntity {

    @EntityColumn({
        db: { type: 'int'}
    })
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.referees)
    fixture!: Fixture;

    @EntityColumn({
        db: { type: 'int'}
    })
    refereeId!: number;

    @ApiProperty()
    @ManyToOne(() => Referee, referee => referee.fixtures)
    referee!: Referee;

    @EntityEnumColumn({
        db: {enum: RefereeRole, default: RefereeRole.MAIN}
    })
    role!: RefereeRole;
}

export class CreateFixtureRefereeDTO extends PickType(FixtureReferee, ["fixtureId", "refereeId", "role"] as const) {}
