import { Entity, OneToMany } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncJobStep } from './sync-job-step.entity';

@Entity('syncJob')
export class SyncJob extends BaseDbEntity {
  @EntityColumn({ db: { type: 'varchar', length: 32 } })
  @ApiProperty({ description: 'running | completed | partial | failed' })
  status!: string;

  @OptionalEntityColumn({ db: { type: 'jsonb' } })
  @ApiPropertyOptional({ description: 'Original POST body (preset) for resume' })
  preset?: Record<string, unknown>;

  @EntityColumn({ db: { type: 'int', default: 0 } })
  @ApiProperty({ description: 'API-Sports HTTP calls consumed this job' })
  apiRequestsUsed!: number;

  @OptionalEntityColumn({ db: { type: 'text' } })
  @ApiPropertyOptional()
  lastError?: string;

  @OptionalEntityColumn({ db: { type: 'varchar', length: 64 } })
  @ApiPropertyOptional({ description: 'BullMQ job id when async' })
  bullJobId?: string;

  @OptionalEntityColumn({ db: { type: 'timestamp' } })
  @ApiPropertyOptional()
  startedAt?: Date;

  @OptionalEntityColumn({ db: { type: 'timestamp' } })
  @ApiPropertyOptional()
  finishedAt?: Date;

  @OneToMany(() => SyncJobStep, (s) => s.job)
  steps?: SyncJobStep[];
}
