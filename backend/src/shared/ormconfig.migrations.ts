import { join } from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

/** Lightweight datasource for CLI migrations — avoids loading all entity globs (hangs on Windows). */
export default new DataSource({
    // @ts-ignore
    type: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    // @ts-ignore
    port: process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'monorepo',
    entities: [],
    autoLoadEntities: false,
    migrationsRun: false,
    synchronize: false,
    logging: true,
    migrations: [
        join(__dirname, 'migrations/*.ts'),
        join(__dirname, 'migrations/*.js'),
    ],
    ssl:
        process.env.DATABASE_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
});
