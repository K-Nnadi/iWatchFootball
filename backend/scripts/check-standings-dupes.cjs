const pg = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  const client = new pg.Client({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'iwatchfootball',
  });
  await client.connect();

  const dup = await client.query(`
    SELECT t.name, tcs."competitionId", tcs."seasonId", COUNT(*) cnt,
           array_agg(tcs.id ORDER BY tcs.id) tcs_ids,
           array_agg(cs.id ORDER BY cs.id) cs_ids,
           array_agg(cs.form ORDER BY cs.id) forms
    FROM "competitionStanding" cs
    JOIN "teamCompetitionSeason" tcs ON tcs.id = cs."teamCompetitionSeasonId"
    JOIN team t ON t.id = tcs."teamId"
    WHERE cs."deletedAt" IS NULL
    GROUP BY t.name, tcs."competitionId", tcs."seasonId"
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 15
  `);
  console.log('Duplicate standings by team name:', dup.rows);

  const dupTcs = await client.query(`
    SELECT t.name, tcs."competitionId", tcs."seasonId", COUNT(*) cnt, array_agg(tcs.id) ids
    FROM "teamCompetitionSeason" tcs
    JOIN team t ON t.id = tcs."teamId"
    WHERE tcs."deletedAt" IS NULL
    GROUP BY t.name, tcs."competitionId", tcs."seasonId"
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 15
  `);
  console.log('Duplicate TCS rows:', dupTcs.rows);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
