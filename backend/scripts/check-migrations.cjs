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
  const migrations = await client.query(
    'SELECT id, name, timestamp FROM migrations ORDER BY id DESC LIMIT 15',
  );
  console.log('Recent migrations:', migrations.rows);
  const table = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'playerTeamStint'
    ) AS exists
  `);
  console.log('playerTeamStint table:', table.rows[0]);
  const col = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'player' AND column_name = 'currentTeamId'
    ) AS exists
  `);
  console.log('player.currentTeamId:', col.rows[0]);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
