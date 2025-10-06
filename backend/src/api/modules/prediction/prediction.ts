import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {PredictedResult} from "../../enums/prediction.enum";
import {User} from "../user/user";
import {Fixture} from "../fixture/fixture";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('prediction')
export class Prediction extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    userId!: number;

    @ApiProperty()
    @ManyToOne(() => User, user => user.predictions, {lazy: true})
    user!: Promise<User>;

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.predictions, {lazy: true})
    fixture!: Promise<Fixture>;

    @OptionalEntityColumn({db:{enum: PredictedResult}})
    predicted?: PredictedResult;
}

export class CreatePredictionDTO extends PickType(Prediction, ["fixtureId", "userId", "fixture", "user", "predicted", "metadata"] as const) {}