import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Entity, ManyToOne, Unique } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { Player } from '../player/player.entity';
import { Team } from '../team/team.entity';
import { Season } from '../season/season.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { PlayerTeamStintSource } from '../../enums/playerTeamStint.enum';
import { SecurityFeature } from '../../../auth/decorators/security-feature.decorator';
import { OperationType, createRoleGroup, UserRole } from '../../../auth/types/security.types';
import { RequestWithUser } from '../../../auth/types/auth.types';
import { FindOptionsWhere } from 'typeorm';

@Entity('playerTeamStint')
@Unique('UQ_playerTeamStint_player_team_start', ['playerId', 'teamId', 'startDate'])
@SecurityFeature<PlayerTeamStint>({
    base: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
            filter: (): FindOptionsWhere<PlayerTeamStint> => ({}),
            fields: [
                'id',
                'createdAt',
                'updatedAt',
                'playerId',
                'teamId',
                'startDate',
                'endDate',
                'isCurrent',
                'isLoan',
                'kitNumber',
                'seasonId',
                'source',
                'metadata',
            ],
        },
        public: {
            filter: (): FindOptionsWhere<PlayerTeamStint> => ({}),
            fields: [
                'id',
                'createdAt',
                'updatedAt',
                'playerId',
                'teamId',
                'startDate',
                'endDate',
                'isCurrent',
                'isLoan',
                'kitNumber',
                'seasonId',
                'source',
                'metadata',
            ],
        },
        default: { filter: (): FindOptionsWhere<PlayerTeamStint> => ({ id: -1 }), fields: ['id'] },
    },
    [OperationType.CREATE]: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            fields: [
                'playerId',
                'teamId',
                'startDate',
                'endDate',
                'isCurrent',
                'isLoan',
                'kitNumber',
                'seasonId',
                'source',
                'metadata',
            ],
        },
        default: { filter: (): FindOptionsWhere<PlayerTeamStint> => ({ id: -1 }) },
    },
    [OperationType.UPDATE]: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            fields: [
                'startDate',
                'endDate',
                'isCurrent',
                'isLoan',
                'kitNumber',
                'seasonId',
                'source',
                'metadata',
            ],
        },
        default: { filter: (): FindOptionsWhere<PlayerTeamStint> => ({ id: -1 }) },
    },
    [OperationType.DELETE]: {
        [createRoleGroup(UserRole.ADMIN)]: { fields: [] },
        default: { filter: (): FindOptionsWhere<PlayerTeamStint> => ({ id: -1 }) },
    },
})
export class PlayerTeamStint extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    playerId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Player,
        joinOptions: { name: 'playerId' },
    })
    player?: Promise<Player>;

    @EntityColumn({ db: { type: 'int' } })
    teamId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Team,
        joinOptions: { name: 'teamId' },
    })
    team?: Promise<Team>;

    @OptionalEntityColumn({ db: { type: 'timestamp' } })
    startDate?: Date;

    @OptionalEntityColumn({ db: { type: 'timestamp', nullable: true } })
    endDate?: Date | null;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    isCurrent!: boolean;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    isLoan!: boolean;

    @OptionalEntityColumn({ db: { type: 'int' } })
    kitNumber?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    seasonId?: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Season,
        joinOptions: { name: 'seasonId' },
    })
    season?: Promise<Season>;

    @EntityEnumColumn({
        db: { enum: PlayerTeamStintSource, default: PlayerTeamStintSource.MANUAL },
        api: { enum: PlayerTeamStintSource },
    })
    source!: PlayerTeamStintSource;
}

export class CreatePlayerTeamStintDTO extends PickType(PlayerTeamStint, [
    'playerId',
    'teamId',
    'startDate',
    'endDate',
    'isCurrent',
    'isLoan',
    'kitNumber',
    'seasonId',
    'source',
    'metadata',
] as const) {}
