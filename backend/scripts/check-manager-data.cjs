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

  const managers = await client.query(
    `SELECT id, name FROM manager WHERE name ILIKE '%Alonso%' LIMIT 5`,
  );
  console.log('managers:', managers.rows);

  for (const m of managers.rows) {
    const emp = await client.query(
      `SELECT id, "teamId", "startDate", "endDate", "isCurrent"
       FROM "managerEmployment" WHERE "managerId" = $1 AND "deletedAt" IS NULL`,
      [m.id],
    );
    const teams = await client.query(
      `SELECT id, name, "managerId" FROM team WHERE "managerId" = $1 AND "deletedAt" IS NULL`,
      [m.id],
    );
    console.log(`\nManager ${m.id} ${m.name}:`);
    console.log('  employments:', emp.rows.length, emp.rows);
    console.log('  teams (managerId):', teams.rows.length, teams.rows);
  }

  const totalEmp = await client.query(
    `SELECT COUNT(*)::int AS c FROM "managerEmployment" WHERE "deletedAt" IS NULL`,
  );
  const teamsWithMgr = await client.query(
    `SELECT COUNT(*)::int AS c FROM team WHERE "managerId" IS NOT NULL AND "deletedAt" IS NULL`,
  );
  console.log('\nTotals:');
  console.log('  managerEmployment rows:', totalEmp.rows[0].c);
  console.log('  teams with managerId:', teamsWithMgr.rows[0].c);

  const sample = await client.query(
    `SELECT id, name, "teamIds" FROM manager WHERE id IN (3, 10)`,
  );
  console.log('\nSample managers teamIds:', sample.rows);

  const clubs = await client.query(
    `SELECT id, name, "managerId" FROM team
     WHERE name ILIKE '%Leverkusen%' OR name ILIKE '%Chelsea%' LIMIT 5`,
  );
  console.log('Sample clubs:', clubs.rows);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
