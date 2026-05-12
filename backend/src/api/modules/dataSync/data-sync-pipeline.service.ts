import { Injectable, Logger } from '@nestjs/common';
import { SyncJobStep } from './sync-job-step.entity';
import { SyncJobService } from './sync-job.service';
import { DataSyncRunDto, isApiSportsPipelineEnabled, SYNC_STEP } from './data-sync.dto';
import { StatsBombAdapterService } from '../../adapters/statsbomb/statsbomb-adapter.service';
import { ApiSportsAdapterService } from '../../adapters/api-sports/api-sports-adapter.service';

@Injectable()
export class DataSyncPipelineService {
  private readonly logger = new Logger(DataSyncPipelineService.name);

  constructor(
    private readonly syncJobService: SyncJobService,
    private readonly statsBombAdapterService: StatsBombAdapterService,
    private readonly apiSportsAdapterService: ApiSportsAdapterService,
  ) {}

  async execute(jobId: number): Promise<{
    jobId: number;
    apiRequestsRemaining: number;
    stepSummaries: Record<string, Record<string, unknown>>;
  }> {
    const { job, steps } = await this.syncJobService.getJobWithSteps(jobId);
    const dto = job.preset as DataSyncRunDto;
    if (!dto) {
      await this.syncJobService.finishJob(jobId, 'failed', 'Job preset missing');
      throw new Error('Job preset missing');
    }

    const apiOn = isApiSportsPipelineEnabled(dto);
    const budgetTotal = apiOn ? Math.max(0, Number(dto.apiSports!.maxApiRequests) || 0) : 0;
    let remaining = Math.max(0, budgetTotal - (job.apiRequestsUsed ?? 0));
    let jobOutcome: 'completed' | 'partial' = 'completed';
    let budgetAborted = false;
    const stepSummaries: Record<string, Record<string, unknown>> = {};

    try {
      for (const step of steps) {
        if (step.status === 'completed' || step.status === 'skipped') continue;

        if (budgetAborted && this.isBudgetedApiStep(step.stepKey, dto)) {
          if (step.status === 'pending' || step.status === 'partial') {
            await this.syncJobService.patchStep(step.id, {
              status: 'skipped',
              resultSummary: { reason: 'api budget exhausted earlier in pipeline' },
            });
          }
          continue;
        }

        await this.syncJobService.patchStep(step.id, { status: 'running', stepError: undefined });

        try {
          switch (step.stepKey) {
            case SYNC_STEP.STATS_BOMB:
              await this.runStatsBomb(dto, step, stepSummaries);
              break;
            case SYNC_STEP.API_LEAGUES:
              remaining = await this.runApiLeagues(jobId, dto, step, remaining, stepSummaries);
              break;
            case SYNC_STEP.API_PLAYERS: {
              const r = await this.runApiPlayers(jobId, dto, step, remaining, stepSummaries);
              remaining = r.remaining;
              if (r.partial) {
                jobOutcome = 'partial';
                budgetAborted = true;
              }
              break;
            }
            case SYNC_STEP.API_FIXTURES: {
              const r = await this.runApiFixtures(jobId, dto, step, remaining, stepSummaries);
              remaining = r.remaining;
              if (r.partial) {
                jobOutcome = 'partial';
                budgetAborted = true;
              }
              break;
            }
            case SYNC_STEP.API_ENRICH:
              remaining = await this.runApiEnrich(jobId, dto, step, remaining, stepSummaries);
              break;
            default:
              await this.syncJobService.patchStep(step.id, {
                status: 'skipped',
                resultSummary: { reason: `unknown step ${step.stepKey}` },
              });
          }
        } catch (e: any) {
          const msg = e instanceof Error ? e.message : String(e);
          await this.syncJobService.patchStep(step.id, { status: 'failed', stepError: msg });
          await this.syncJobService.finishJob(jobId, 'failed', msg);
          throw e;
        }
      }

      await this.syncJobService.finishJob(jobId, jobOutcome);
      return { jobId, apiRequestsRemaining: remaining, stepSummaries };
    } catch (e) {
      this.logger.error(`data-sync job ${jobId} failed`, e instanceof Error ? e.stack : e);
      throw e;
    }
  }

  private isBudgetedApiStep(stepKey: string, dto: DataSyncRunDto): boolean {
    if (stepKey === SYNC_STEP.STATS_BOMB) return false;
    return isApiSportsPipelineEnabled(dto);
  }

  private async runStatsBomb(
    dto: DataSyncRunDto,
    step: SyncJobStep,
    stepSummaries: Record<string, Record<string, unknown>>,
  ): Promise<void> {
    await this.statsBombAdapterService.syncStatsBombData(dto.statsbombOptions as any);
    const summary = { ok: true };
    stepSummaries[step.stepKey] = summary;
    await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
  }

  private async runApiLeagues(
    jobId: number,
    dto: DataSyncRunDto,
    step: SyncJobStep,
    remaining: number,
    stepSummaries: Record<string, Record<string, unknown>>,
  ): Promise<number> {
    const api = dto.apiSports;
    if (!api?.country || api.season == null) {
      const summary = { skipped: true, reason: 'country and season required for league import' };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
      return remaining;
    }
    if (remaining < 1) {
      const summary = { skipped: true, reason: 'no API budget for GET /leagues' };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'skipped', resultSummary: summary });
      return remaining;
    }

    const maxStandingsCap = api.leagues?.maxStandingsRequests ?? 20;
    const maxStandings = Math.min(maxStandingsCap, Math.max(0, remaining - 1));

    const result = await this.apiSportsAdapterService.importLeaguesFromDiscover({
      country: String(api.country),
      season: Number(api.season),
      standingsSeasonYear: Number(api.season),
      syncTeamsAndStandings: api.leagues?.syncTeamsAndStandings,
      onlyStandingsCoverage: api.leagues?.onlyStandingsCoverage,
      onlyLeagueType: api.leagues?.onlyLeagueType,
      maxStandingsRequests: maxStandings,
    });

    const used = result.apiRequestsUsed ?? 0;
    await this.syncJobService.addApiRequests(jobId, used);
    const nextRemaining = Math.max(0, remaining - used);
    const summary = { ...result, apiRequestsUsed: used };
    stepSummaries[step.stepKey] = summary as Record<string, unknown>;
    await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary as any });
    return nextRemaining;
  }

  private async runApiPlayers(
    jobId: number,
    dto: DataSyncRunDto,
    step: SyncJobStep,
    remaining: number,
    stepSummaries: Record<string, Record<string, unknown>>,
  ): Promise<{ remaining: number; partial: boolean }> {
    const api = dto.apiSports!;
    const leagues = api.leagueApiIds ?? [];
    if (!leagues.length) {
      const summary = { skipped: true, reason: 'leagueApiIds empty' };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
      return { remaining, partial: false };
    }

    let startIdx =
      step.status === 'partial' && step.cursor?.nextLeagueIndex != null
        ? Number(step.cursor.nextLeagueIndex)
        : 0;
    if (startIdx < 0) startIdx = 0;
    if (startIdx >= leagues.length) {
      const summary = { skipped: true, reason: 'cursor past end' };
      await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
      return { remaining, partial: false };
    }

    const perLeagueDefault = api.players?.maxRequestsPerLeague ?? 10;
    const maxPages = api.players?.maxPages ?? 2;
    const skipOnAmbiguousName = api.players?.skipOnAmbiguousName;
    const season = Number(api.season);
    const perLeagueResults: Record<string, unknown>[] = [];
    let partial = false;

    for (let i = startIdx; i < leagues.length; i += 1) {
      if (remaining <= 0) {
        await this.syncJobService.patchStep(step.id, {
          status: 'partial',
          cursor: { nextLeagueIndex: i },
          resultSummary: { perLeagueResults, stopped: 'budget' },
        });
        partial = true;
        break;
      }
      const cap = Math.min(perLeagueDefault, remaining);
      const r = await this.apiSportsAdapterService.importPlayersFromLeagueSeason({
        league: leagues[i],
        season,
        maxPages,
        maxRequests: cap,
        skipOnAmbiguousName,
      });
      await this.syncJobService.addApiRequests(jobId, r.requests);
      remaining = Math.max(0, remaining - r.requests);
      perLeagueResults.push({ league: leagues[i], ...r });
      await this.syncJobService.patchStep(step.id, {
        cursor: { nextLeagueIndex: i + 1 },
        resultSummary: { perLeagueResults },
      });
    }

    if (!partial) {
      const summary = { perLeagueResults };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
    } else {
      stepSummaries[step.stepKey] = { perLeagueResults, partial: true };
    }

    return { remaining, partial };
  }

  private async runApiFixtures(
    jobId: number,
    dto: DataSyncRunDto,
    step: SyncJobStep,
    remaining: number,
    stepSummaries: Record<string, Record<string, unknown>>,
  ): Promise<{ remaining: number; partial: boolean }> {
    const api = dto.apiSports!;
    const leagues = api.leagueApiIds ?? [];
    const fx = api.fixtures;
    if (!fx?.from || !fx?.to) {
      const summary = { skipped: true, reason: 'fixtures.from / fixtures.to not set' };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
      return { remaining, partial: false };
    }
    if (!leagues.length) {
      const summary = { skipped: true, reason: 'leagueApiIds empty' };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
      return { remaining, partial: false };
    }

    let startIdx =
      step.status === 'partial' && step.cursor?.nextLeagueIndex != null
        ? Number(step.cursor.nextLeagueIndex)
        : 0;
    if (startIdx < 0) startIdx = 0;

    const seasonYear = Number(api.season);
    const perLeagueCap = fx.maxRequestsPerLeague ?? 50;
    const maxPages = fx.maxPages ?? 20;
    const allPages = fx.allPages !== false;
    const perLeagueResults: Record<string, unknown>[] = [];
    let partial = false;

    for (let i = startIdx; i < leagues.length; i += 1) {
      if (remaining <= 0) {
        await this.syncJobService.patchStep(step.id, {
          status: 'partial',
          cursor: { nextLeagueIndex: i },
          resultSummary: { perLeagueResults, stopped: 'budget' },
        });
        partial = true;
        break;
      }
      const cap = Math.min(perLeagueCap, remaining);
      const r = await this.apiSportsAdapterService.importFixturesFromLeagueWindow({
        leagueApiId: leagues[i],
        seasonYear,
        from: String(fx.from),
        to: String(fx.to),
        allPages,
        maxPages,
        maxRequests: cap,
      });
      const fixtureReq = r.apiRequests;
      const standingsReq = r.standingsApiRequests ?? 0;
      const primaryVenuesReq = r.primaryVenuesApiRequests ?? 0;
      const totalUsed = fixtureReq + standingsReq + primaryVenuesReq;
      await this.syncJobService.addApiRequests(jobId, totalUsed);
      remaining = Math.max(0, remaining - totalUsed);
      perLeagueResults.push({ league: leagues[i], ...r });
      await this.syncJobService.patchStep(step.id, {
        cursor: { nextLeagueIndex: i + 1 },
        resultSummary: { perLeagueResults },
      });
    }

    if (!partial) {
      const summary = { perLeagueResults };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
    } else {
      stepSummaries[step.stepKey] = { perLeagueResults, partial: true };
    }

    return { remaining, partial };
  }

  private async runApiEnrich(
    jobId: number,
    dto: DataSyncRunDto,
    step: SyncJobStep,
    remaining: number,
    stepSummaries: Record<string, Record<string, unknown>>,
  ): Promise<number> {
    const api = dto.apiSports!;
    const enrich = api.enrich;
    if (!enrich) {
      const summary = { skipped: true };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'skipped', resultSummary: summary });
      return remaining;
    }
    if (remaining < 1) {
      const summary = { skipped: true, reason: 'no API budget' };
      stepSummaries[step.stepKey] = summary;
      await this.syncJobService.patchStep(step.id, { status: 'skipped', resultSummary: summary });
      return remaining;
    }

    const maxReq = Math.min(enrich.maxRequests ?? remaining, remaining);
    const r = await this.apiSportsAdapterService.enrichPlayers({
      limit: enrich.limit,
      season: enrich.season,
      maxRequests: maxReq,
    });
    await this.syncJobService.addApiRequests(jobId, r.apiRequests);
    remaining = Math.max(0, remaining - r.apiRequests);
    const summary = { ...r };
    stepSummaries[step.stepKey] = summary;
    await this.syncJobService.patchStep(step.id, { status: 'completed', resultSummary: summary });
    return remaining;
  }
}
