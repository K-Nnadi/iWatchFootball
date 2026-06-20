/**
 * One-off StatsBomb open-data sync (no HTTP / JWT required).
 * Usage: pnpm --filter ./backend exec ts-node --files scripts/run-statsbomb-sync.ts
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { StatsBombAdapterService } from '../src/api/adapters/statsbomb/statsbomb-adapter.service';

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

  // Corporate proxies / dev cert chains often break Node TLS to raw.githubusercontent.com
  if (process.env.STATSBOMB_INSECURE_TLS !== 'false') {
    process.env.STATSBOMB_INSECURE_TLS = 'true';
  }

  const skipLineups = process.argv.includes('--skip-lineups');
  const skipFixtures = process.argv.includes('--skip-fixtures');
  const skipPlayers = process.argv.includes('--skip-players');

  console.log('Starting StatsBomb sync...', {
    skipLineups,
    skipFixtures,
    skipPlayers,
  });

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const adapter = app.get(StatsBombAdapterService);
    await adapter.syncStatsBombData({
      skipLineups,
      skipFixtures,
      skipPlayers,
    });
    console.log('StatsBomb sync completed.');
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('StatsBomb sync failed:', err);
  process.exit(1);
});
