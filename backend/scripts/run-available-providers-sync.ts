/**
 * Import current Premier League data from providers that still have quota.
 * Skips RapidAPI SportAPI (BASIC 50/month already exhausted).
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ApiSportsAdapterService } from '../src/api/adapters/api-sports/api-sports-adapter.service';
import { ApiSportsHttpService } from '../src/api/adapters/api-sports/api-sports-http.service';
import { SportMonksAdapterService } from '../src/api/adapters/sportmonks/sportmonks-adapter.service';
import { SportMonksHttpService } from '../src/api/adapters/sportmonks/sportmonks-http.service';

function loadDotEnvChain(): void {
  let dir = path.resolve(__dirname, '..');
  for (let i = 0; i < 6; i++) {
    const envPath = path.join(dir, '.env');
    if (existsSync(envPath)) {
      config({ path: envPath, override: true });
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

async function main(): Promise<void> {
  loadDotEnvChain();

  const from = process.env.PL_FROM || '2023-08-11';
  const to = process.env.PL_TO || '2024-05-19';
  const seasonYear = Number(process.env.PL_SEASON_YEAR || 2023);

  console.log('Importing Premier League from available providers (skipping SportAPI)…', {
    from,
    to,
    seasonYear,
  });

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const summary: Record<string, unknown> = {};

  try {
    const apiSportsHttp = app.get(ApiSportsHttpService);
    if (apiSportsHttp.isConfigured()) {
      try {
        const apiSports = app.get(ApiSportsAdapterService);
        summary.apiSports = await apiSports.importFixturesFromLeagueWindow({
          leagueApiId: 39,
          seasonYear,
          from,
          to,
          maxRequests: 5,
          syncStandingsAfter: true,
          recomputeStandingsFromFixturesAfter: true,
          fixtureUpsertConcurrency: 16,
        });
      } catch (e: any) {
        summary.apiSports = { error: e?.message || String(e) };
      }
    } else {
      summary.apiSports = { skipped: true, reason: 'API_SPORTS_KEY not set' };
    }

    const sportMonksHttp = app.get(SportMonksHttpService);
    if (sportMonksHttp.isConfigured()) {
      const sportMonks = app.get(SportMonksAdapterService);
      try {
        const leagues = await sportMonks.importLeagues({
          leagueIds: [8],
          currentSeasonOnly: true,
        });
        const chunkEnd = process.env.SPORTMONKS_TO || to;
        const startMs = Date.parse(`${from}T00:00:00Z`);
        const endMs = Date.parse(`${chunkEnd}T00:00:00Z`);
        const maxSpanMs = 99 * 86_400_000;
        const fixtureChunks: unknown[] = [];
        for (let t = startMs; t <= endMs; t += maxSpanMs + 86_400_000) {
          const chunkFrom = new Date(t).toISOString().slice(0, 10);
          const chunkTo = new Date(Math.min(t + maxSpanMs, endMs)).toISOString().slice(0, 10);
          fixtureChunks.push(
            await sportMonks.importFixtures({
              from: chunkFrom,
              to: chunkTo,
              leagueId: 8,
              timezone: 'UTC',
              maxPages: 8,
              maxRequests: 10,
              syncDetailsAfter: false,
              createMissingTeams: true,
            }),
          );
        }
        summary.sportmonks = { leagues, fixtures: fixtureChunks };
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || String(e);
        summary.sportmonks = { error: msg, details: e?.response?.data?.errors };
      }
    } else {
      summary.sportmonks = { skipped: true, reason: 'SPORTMONKS_API_TOKEN not set' };
    }

    console.log('Available-provider import completed:', JSON.stringify(summary, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('Available-provider import failed:', err);
  process.exit(1);
});
