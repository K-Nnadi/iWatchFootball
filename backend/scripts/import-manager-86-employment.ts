/**
 * Import SportAPI-style manager careerHistory onto a local manager.
 * Defaults to manager 86 (José Mourinho) using the checked-in JSON dump.
 * Usage: npx ts-node --files scripts/import-manager-86-employment.ts
 */
import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SportApiAdapterService } from '../src/api/adapters/sportapi/sportapi-adapter.service';
import type { SportApiCareerStint } from '../src/api/adapters/sportapi/sportapi.types';

const MANAGER_ID = Number(process.env.MANAGER_EMPLOYMENT_ID ?? 86);

function loadDotEnvChain(): void {
  let dir = path.resolve(__dirname, '..');
  for (let i = 0; i < 6; i++) {
    const envPath = path.join(dir, '.env');
    if (existsSync(envPath)) config({ path: envPath, override: true });
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

async function main(): Promise<void> {
  loadDotEnvChain();
  const jsonPath = path.join(__dirname, 'data', 'manager-86-career.json');
  const payload = JSON.parse(readFileSync(jsonPath, 'utf8')) as { careerHistory: SportApiCareerStint[] };

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const adapter = app.get(SportApiAdapterService);
    const result = await adapter.importManagerCareer({
      managerId: MANAGER_ID,
      careerHistory: payload.careerHistory ?? [],
    });
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
