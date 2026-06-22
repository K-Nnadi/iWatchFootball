/**
 * Run pending TypeORM migrations without loading entity globs (Windows-safe).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
    require('ts-node/register/transpile-only');
    const dataSourceModule = require('../src/shared/ormconfig.migrations.ts');
    const dataSource = dataSourceModule.default;

    await dataSource.initialize();
    console.log('Running pending migrations…');
    const applied = await dataSource.runMigrations({ transaction: 'each' });
    if (applied.length === 0) {
        console.log('No pending migrations.');
    } else {
        for (const m of applied) {
            console.log('Applied:', m.name);
        }
    }
    await dataSource.destroy();
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
