import {PickType} from "@nestjs/swagger";
import {Entity, OneToMany} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {EntityColumn} from "@iWatchFootball/base-tools/decorators/entityColumn.decorator";
import {UserType} from "../../enums/user.enum";
import {Log} from "../log/log";


@Entity('user')

export class User extends BaseDbEntity {
    @EntityColumn()
    firstName!: string

    @EntityColumn()
    lastName!: string

    @EntityColumn()
    userName!: string

    @EntityColumn({
        db: {unique: true},
        api: {format: 'email'}
    })
    email!: string

    @EntityColumn({api: {minLength: 8, maxLength: 32}})
    password!: string

    @EntityColumn({
        db: {default: UserType.USER},
        api: {enum: {user: UserType.USER, admin: UserType.ADMIN}}
    })
    type!: UserType


    @OneToMany(() => Log, log => log.user)
    logs!: Log[]

    @OneToMany(() => Prediction, prediction => prediction.fixture)
    prediction?: prediction;
}

export class CreateUserDTO extends PickType(User, ["firstName", "lastName", "userName", "email", "type"] as const) {
}
