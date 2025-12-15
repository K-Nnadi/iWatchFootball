import {ApiProperty, PickType} from '@nestjs/swagger';
import {Entity, OneToMany} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {FixtureReferee} from "../fixtureReferee/fixtureReferee.entity";
import {EntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('referee')
export class Referee extends BaseDbEntity {

    @EntityColumn({db:{type: "varchar"}})
    name!: string;

    @EntityColumn({db:{type: "varchar"}})
    nationality!: string;

    @ApiProperty()
    @OneToMany(() => FixtureReferee, fixtureReferee => fixtureReferee.referee)
    fixtures!: FixtureReferee[];
}

export class CreateRefereeDTO extends PickType(Referee, ["name", "nationality", "metadata"] as const) {}
