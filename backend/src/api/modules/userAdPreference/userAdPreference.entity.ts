import { Entity, Index } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('userAdPreference')
@Index(['userId'], { unique: true })
export class UserAdPreference extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'FK to user' })
    userId!: number;

    /**
     * Whether the user has opted in to seeing gambling/betting content.
     * Default is FALSE — users must explicitly enable this.
     * Users under 18 are never eligible regardless of this flag.
     */
    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Whether the user has opted in to betting/gambling ad content (default false)' })
    showGamblingContent!: boolean;

    /** Timestamp of when the user explicitly consented to gambling content. */
    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional({ description: 'When the user gave explicit consent to see gambling ads' })
    consentGivenAt?: Date;

    /**
     * Admin-settable self-exclusion flag. When true, gambling content is permanently
     * blocked regardless of user preference or age. Can be used for GamStop integration.
     */
    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Admin-settable self-exclusion — permanently blocks gambling content' })
    selfExcluded!: boolean;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional({ description: 'When self-exclusion was applied' })
    selfExcludedAt?: Date;
}
