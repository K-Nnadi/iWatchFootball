import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, OneToMany, OneToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Address} from "../address/address.entity";
import {TeamStadium} from "../teamStadium/teamStadium.entity";
import {Fixture} from "../fixture/fixture.entity";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';


@Entity('stadium')
@SecurityFeature<Stadium>({
  base: {
    // READ operations - Public access for stadiums (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Stadium> => {
        // All users (including unauthenticated) can see all stadiums
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'country', 'opened', 'capacity', 'addressId', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Stadium> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'country', 'opened', 'capacity', 'addressId', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Stadium> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create stadiums
      fields: ['name', 'country', 'opened', 'capacity', 'addressId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Stadium> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update stadiums
      fields: ['name', 'country', 'opened', 'capacity', 'addressId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Stadium> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete stadiums
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Stadium> => ({ id: -1 }) },
  },
})
export class Stadium extends BaseDbEntity{

    @EntityColumn({db: {type: "varchar"}})
    name!: string


    @EntityColumn({db: {type: "varchar"}})
    country!: string

    @OptionalEntityColumn({db: {type: "timestamp"}})
    opened?: Date

    @ApiPropertyOptional()
    @OneToMany(() => TeamStadium, (ts) => ts.stadium, {lazy: true})
    teamStadiumLinks?: Promise<TeamStadium[]>

    @OptionalEntityColumn({db: {type: "int"}})
    capacity?: number

    @OptionalEntityColumn({db: {type: "int"}})
    addressId?: number

    @ApiPropertyOptional()
    // @ts-ignore
    @OneToOne(() => Address, (address) => address.stadium)
    address?: Address;


    @ApiPropertyOptional()
    @OneToMany(() => Fixture, fixture => fixture.stadium, {lazy: true})
    fixtures?: Promise<Fixture[]>
}

export class CreateStadiumDTO extends PickType(Stadium, ["name", "country", "opened", "capacity", "addressId", 'metadata'] as const){}