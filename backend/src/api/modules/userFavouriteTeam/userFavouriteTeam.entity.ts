import { Entity, Unique } from 'typeorm';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, EntityRelation, RelationshipType } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { User } from '../user/user.entity';
import { Team } from '../team/team.entity';

@Entity('userFavouriteTeam')
@Unique('UQ_userFavouriteTeam_userId_teamId', ['userId', 'teamId'])
export class UserFavouriteTeam extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    userId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: { name: 'userId' },
    })
    user?: Promise<User>;

    @EntityColumn({ db: { type: 'int' } })
    teamId!: number;

    @ApiPropertyOptional()
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Team,
        joinOptions: { name: 'teamId' },
    })
    team?: Promise<Team>;
}
