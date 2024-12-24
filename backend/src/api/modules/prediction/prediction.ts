import {PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {PredictedResult} from "../../enums/prediction.enum";
import {User} from "../user/user";
import {Fixture} from "../fixture/fixture";

@Entity('prediction')
export class Prediction extends BaseDbEntity {
    
    @Column()
    userId!: number;

    @ManyToOne(() => User, user => user.predictions)
    user!: User;

    @Column()
    fixtureId!: number;

    @ManyToOne(() => Fixture, fixture => fixture.predictions)
    fixture!: Fixture;

    @Column({nullable : true})
    predicted?: PredictedResult;
}

export class CreatePredictionDTO extends PickType(Prediction, ["fixtureId", "userId", "fixture", "user", "predicted"] as const) {}