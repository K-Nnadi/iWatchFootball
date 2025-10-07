import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, OneToMany} from "typeorm";
import {UserType} from "../../enums/user.enum";
import {Log} from "../log/log";
import {EntityColumn, EntityEnumColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Prediction} from "../prediction/prediction";


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

    @EntityEnumColumn({
        db: {default: UserType.USER, enum: UserType},
    })
    type!: UserType

    @ApiProperty()
    @OneToMany(() => Log, log => log.user, {lazy: true})
    logs!: Promise<Log[]>

    @ApiPropertyOptional()
    @OneToMany(() => Prediction, prediction => prediction.fixture, {lazy: true})
    predictions?: Promise<Prediction[]>;
}

export class CreateUserDTO extends PickType(User, ["firstName", "lastName", "userName", "email", "type", "metadata"] as const) {
}
