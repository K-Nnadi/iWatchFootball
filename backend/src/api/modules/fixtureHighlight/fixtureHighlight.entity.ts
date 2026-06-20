import { PickType } from '@nestjs/swagger';
import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { SecurityFeature } from '../../../auth/decorators/security-feature.decorator';
import { OperationType, createRoleGroup, UserRole } from '../../../auth/types/security.types';
import { FindOptionsWhere } from 'typeorm';
import { Fixture } from '../fixture/fixture.entity';
import { HighlightProvider, HighlightStatus, HighlightType } from '../../enums/fixture-highlight.enum';

@Entity('fixture_highlight')
@SecurityFeature<FixtureHighlight>({
    base: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
            filter: (): FindOptionsWhere<FixtureHighlight> => ({}),
            fields: [
                'id', 'createdAt', 'updatedAt', 'fixtureId', 'provider', 'type',
                'title', 'providerVideoId', 'thumbnailUrl', 'embedUrl', 'sourceUrl',
                'durationSeconds', 'publishedAt', 'isOfficial', 'status', 'channelName',
            ],
        },
        public: {
            filter: (): FindOptionsWhere<FixtureHighlight> => ({}),
            fields: [
                'id', 'createdAt', 'updatedAt', 'fixtureId', 'provider', 'type',
                'title', 'providerVideoId', 'thumbnailUrl', 'embedUrl', 'sourceUrl',
                'durationSeconds', 'publishedAt', 'isOfficial', 'status', 'channelName',
            ],
        },
        default: { filter: (): FindOptionsWhere<FixtureHighlight> => ({ id: -1 }), fields: ['id'] },
    },
    [OperationType.CREATE]: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            fields: [
                'fixtureId', 'provider', 'type', 'title', 'providerVideoId',
                'thumbnailUrl', 'embedUrl', 'sourceUrl', 'durationSeconds',
                'publishedAt', 'isOfficial', 'status', 'channelName',
            ],
        },
        default: { filter: (): FindOptionsWhere<FixtureHighlight> => ({ id: -1 }) },
    },
    [OperationType.UPDATE]: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            fields: [
                'provider', 'type', 'title', 'providerVideoId', 'thumbnailUrl',
                'embedUrl', 'sourceUrl', 'durationSeconds', 'publishedAt',
                'isOfficial', 'status', 'channelName',
            ],
        },
        default: { filter: (): FindOptionsWhere<FixtureHighlight> => ({ id: -1 }) },
    },
    [OperationType.DELETE]: {
        [createRoleGroup(UserRole.ADMIN)]: { fields: [] },
        default: { filter: (): FindOptionsWhere<FixtureHighlight> => ({ id: -1 }) },
    },
})
export class FixtureHighlight extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: { name: 'fixtureId' },
        description: 'Fixture this highlight belongs to',
    })
    fixture!: Promise<Fixture>;

    @EntityEnumColumn({ db: { enum: HighlightProvider } })
    provider!: HighlightProvider;

    @EntityEnumColumn({ db: { enum: HighlightType } })
    type!: HighlightType;

    @EntityColumn({ db: { type: 'varchar' } })
    title!: string;

    @EntityColumn({ db: { type: 'varchar' } })
    providerVideoId!: string;

    @OptionalEntityColumn({ db: { type: 'varchar' } })
    thumbnailUrl?: string;

    @OptionalEntityColumn({ db: { type: 'varchar' } })
    embedUrl?: string;

    @OptionalEntityColumn({ db: { type: 'varchar' } })
    sourceUrl?: string;

    @OptionalEntityColumn({ db: { type: 'int' } })
    durationSeconds?: number;

    @OptionalEntityColumn({ db: { type: 'timestamp' } })
    publishedAt?: Date;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    isOfficial!: boolean;

    @EntityEnumColumn({ db: { enum: HighlightStatus, default: HighlightStatus.PENDING } })
    status!: HighlightStatus;

    @OptionalEntityColumn({ db: { type: 'varchar' } })
    channelName?: string;
}

export class CreateFixtureHighlightDTO extends PickType(FixtureHighlight, [
    'fixtureId',
    'provider',
    'type',
    'title',
    'providerVideoId',
    'thumbnailUrl',
    'embedUrl',
    'sourceUrl',
    'durationSeconds',
    'publishedAt',
    'isOfficial',
    'status',
    'channelName',
] as const) {}
