import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, ManyToMany, ManyToOne, OneToMany} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {TeamStadium} from "../teamStadium/teamStadium.entity";
import {TeamCompetitionSeason} from "../teamCompetitionSeason/teamCompetitionSeason.entity";
import {TeamGender, TeamType} from "../../enums/team.enum";
import {Manager} from "../manager/manager.entity";
import {Player} from "../player/player.entity";
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {Fixture} from "../fixture/fixture.entity";
import {Trophy} from "../trophy/trophy.entity";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';


@Entity('team')
@SecurityFeature<Team>({
  base: {
    // READ operations - Public access for teams (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Team> => {
        // All users (including unauthenticated) can see all teams
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'founded', 'managerId',
        'playerIds', 'logoUrl', 'website', 'city', 'country', 'gender', 'type', 'parentId', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Team> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'founded', 'managerId',
        'playerIds', 'logoUrl', 'website', 'city', 'country', 'gender', 'type', 'parentId', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Team> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create teams
      fields: ['name', 'founded', 'managerId', 'playerIds', 'logoUrl', 'website', 'city', 'country', 'gender', 'type', 'parentId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Team> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update teams
      fields: ['name', 'founded', 'managerId', 'playerIds', 'logoUrl', 'website', 'city', 'country', 'gender', 'type', 'parentId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Team> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete teams
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Team> => ({ id: -1 }) },
  },
})
export class Team extends BaseDbEntity {

    @EntityColumn({db: {type: "varchar"}})
    name!: string;

    @OptionalEntityColumn({db: {type: "timestamp"}})
    founded?: Date;

    @ApiPropertyOptional({nullable: true})
    @OneToMany(() => TeamStadium, (ts) => ts.team, { lazy: true })
    teamStadiumLinks?: Promise<TeamStadium[]>;

    @ApiProperty()
    @OneToMany(() => TeamCompetitionSeason, teamCompSeason => teamCompSeason.team)
    teamCompetitionSeasons!: TeamCompetitionSeason[];

    @OptionalEntityColumn({db: {type: "int"}})
    managerId?: number;

    @ApiProperty()
    @ManyToOne(() => Manager, manager => manager.teams, {lazy: true})
    manager?: Promise<Manager>;

    @OptionalEntityColumn({db: {type: "int", array: true}})
    playerIds?: number[]

    @ApiProperty()
    @ManyToMany(() => Player, player => player.teams, {lazy: true})
    players?: Promise<Player[]>

    @OptionalEntityColumn({db: {type: "varchar"}})
    logoUrl?: string;

    @OptionalEntityColumn({db: {type: "varchar"}})
    website?: string;

    @OptionalEntityColumn({db: {type: "int"}})
    city?: string;

    @OptionalEntityColumn({db: {type: "varchar"}})
    country?: string;


    @EntityEnumColumn({
        db: {enum: TeamGender, default: TeamGender.MALE, nullable: true},
        api: {enum: TeamGender, nullable: true}
    })
    gender?: TeamGender;

    @EntityEnumColumn({
        db: {enum: TeamType, default: TeamType.CLUB}
    })
    type!: TeamType;

    @OptionalEntityColumn({db: {type: "int"}})
    parentId?: number;

    @ApiProperty()
    @OneToMany(() => Fixture, (fixture) => fixture.homeTeam, {lazy: true})
    homeFixtures?: Promise<Fixture[]>;

    @ApiProperty()
    @OneToMany(() => Fixture, (fixture) => fixture.awayTeam, {lazy: true})
    awayFixtures?: Promise<Fixture[]>;

    @ApiProperty({nullable: true})
    @OneToMany(() => Trophy, trophy => trophy.player, {lazy: true, nullable: true})
    trophies?: Trophy[];

}

export class CreateTeamDTO extends PickType(Team, ["name", "founded", "managerId", "website", "logoUrl", "city", "country", "type", "parentId", 'metadata'] as const) {
}