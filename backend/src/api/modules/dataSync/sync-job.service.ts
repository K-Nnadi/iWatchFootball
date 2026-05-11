import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncJob } from './sync-job.entity';
import { SyncJobStep } from './sync-job-step.entity';
import { buildDataSyncStepKeys, DataSyncRunDto } from './data-sync.dto';

@Injectable()
export class SyncJobService {
  constructor(
    @InjectRepository(SyncJob)
    private readonly jobRepo: Repository<SyncJob>,
    @InjectRepository(SyncJobStep)
    private readonly stepRepo: Repository<SyncJobStep>,
  ) {}

  async findOneOrFail(id: number): Promise<SyncJob> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException(`sync job ${id}`);
    return job;
  }

  async getJobWithSteps(id: number): Promise<{ job: SyncJob; steps: SyncJobStep[] }> {
    const job = await this.findOneOrFail(id);
    const steps = await this.stepRepo.find({
      where: { jobId: id },
      order: { id: 'ASC' },
    });
    return { job, steps };
  }

  async createWithSteps(dto: DataSyncRunDto): Promise<SyncJob> {
    const preset = stripResumeFields(dto);
    const job = await this.jobRepo.save({
      status: 'running',
      preset: preset as Record<string, unknown>,
      apiRequestsUsed: 0,
      startedAt: new Date(),
      lastError: undefined,
      finishedAt: undefined,
      bullJobId: undefined,
    } as Partial<SyncJob>);

    for (const stepKey of buildDataSyncStepKeys(dto)) {
      await this.stepRepo.save({
        jobId: job.id,
        stepKey,
        status: 'pending',
        cursor: undefined,
        stepError: undefined,
        resultSummary: undefined,
      } as Partial<SyncJobStep>);
    }
    return this.findOneOrFail(job.id);
  }

  async markRunning(jobId: number): Promise<void> {
    await this.jobRepo.update(
      { id: jobId },
      {
        status: 'running',
        lastError: undefined,
        finishedAt: undefined,
      } as any,
    );
  }

  async setBullJobId(jobId: number, bullJobId: string): Promise<void> {
    await this.jobRepo.update({ id: jobId }, { bullJobId } as any);
  }

  async addApiRequests(jobId: number, delta: number): Promise<void> {
    if (delta <= 0) return;
    await this.jobRepo.increment({ id: jobId }, 'apiRequestsUsed', delta);
  }

  async finishJob(
    jobId: number,
    status: 'completed' | 'partial' | 'failed',
    lastError?: string,
  ): Promise<void> {
    await this.jobRepo.update(
      { id: jobId },
      {
        status,
        finishedAt: new Date(),
        lastError,
      } as any,
    );
  }

  async patchStep(
    stepId: number,
    patch: Partial<Pick<SyncJobStep, 'status' | 'cursor' | 'stepError' | 'resultSummary'>>,
  ): Promise<void> {
    await this.stepRepo.update({ id: stepId }, patch as any);
  }
}

function stripResumeFields(dto: DataSyncRunDto): Record<string, unknown> {
  const { resumeJobId: _r, ...rest } = dto;
  return JSON.parse(JSON.stringify(rest)) as Record<string, unknown>;
}
