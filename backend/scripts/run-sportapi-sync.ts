/**
 * One-off RapidAPI SportAPI import (no HTTP / JWT required).
 * Usage: pnpm --filter @iWatchFootball/api exec ts-node --files scripts/run-sportapi-sync.ts
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SportApiAdapterService } from '../src/api/adapters/sportapi/sportapi-adapter.service';
import { SportApiHttpService } from '../src/api/adapters/sportapi/sportapi-http.service';
import { SPORTAPI_CATEGORY, SPORTAPI_UNIQUE_TOURNAMENT } from '../src/api/adapters/sportapi/sportapi.config';

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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  loadDotEnvChain();

  const today = new Date();
  const from = process.env.SPORTAPI_FROM || isoDate(new Date(today.getTime() - 86400000));
  const to = process.env.SPORTAPI_TO || isoDate(new Date(today.getTime() + 86400000));
  const uniqueTournamentIds = [SPORTAPI_UNIQUE_TOURNAMENT.PREMIER_LEAGUE];
  const categoryIds = [SPORTAPI_CATEGORY.ENGLAND];

  console.log('Starting RapidAPI SportAPI import...', { from, to, uniqueTournamentIds, categoryIds });

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const http = app.get(SportApiHttpService);
    if (!http.isConfigured()) {
      throw new Error('RAPIDAPI_SPORTAPI_KEY is not set');
    }

    const adapter = app.get(SportApiAdapterService);
    if (process.argv.includes('--relink-only')) {
      const result = await adapter.relinkToExistingRecords();
      console.log('SportAPI relink completed:', JSON.stringify(result, null, 2));
      return;
    }
    const result = await adapter.runPipeline({
      uniqueTournamentIds,
      categoryIds,
      from,
      to,
      syncStandings: true,
      syncFixtureDetails: false,
      maxApiRequests: 8,
    });
    console.log('RapidAPI SportAPI import completed:', JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('RapidAPI SportAPI import failed:', err);
  process.exit(1);
});
