import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncJob } from './sync-job.entity';

@Entity('syncJobStep')
export class SyncJobStep extends BaseDbEntity {
  @EntityColumn({ db: { type: 'int' } })
  @ApiProperty()
  jobId!: number;

  @ManyToOne(() => SyncJob, (j) => j.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job!: SyncJob;

  @EntityColumn({ db: { type: 'varchar', length: 64 } })
  @ApiProperty({ description: 'e.g. statsbomb, api_leagues, api_players' })
  stepKey!: string;

  @EntityColumn({ db: { type: 'varchar', length: 32 } })
  @ApiProperty({ description: 'pending | running | completed | partial | skipped | failed' })
  status!: string;

  @OptionalEntityColumn({ db: { type: 'jsonb' } })
  @ApiPropertyOptional({ description: 'Resume cursor (e.g. next league index)' })
  cursor?: Record<string, unknown>;

  @OptionalEntityColumn({ db: { type: 'text' } })
  @ApiPropertyOptional()
  stepError?: string;

  @OptionalEntityColumn({ db: { type: 'jsonb' } })
  @ApiPropertyOptional()
  resultSummary?: Record<string, unknown>;
}
