import { join } from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config(); // This ensures .env variables are loaded early


const entities = [
    join(__dirname, '../../', 'src/api/modules/**/*{.ts,.js}'),
    join(__dirname, '../../../libraries/base/**/*{.ts,.js}')
];
console.log('PATH:',entities);
export default new DataSource({
	// @ts-ignore
	type: process.env.DATABASE_TYPE || 'postgres',
	host: process.env.DATABASE_HOST || 'localhost',
	// @ts-ignore
	port: process.env.DATABASE_PORT || 5432,
	username: process.env.DATABASE_USERNAME || 'postgres',
	password: process.env.DATABASE_PASSWORD || 'postgres',
	database: process.env.DATABASE_NAME || 'monorepo',
	entities,
	autoLoadEntities: false,
	migrationsRun: false,
	synchronize: false,
	logging: true,
	migrations: ['src/shared/migrations/*{.ts,.js}'],
	cli: {
		migrationsDir: 'src/shared/migrations'
	},
	// SSL configuration for remote PostgreSQL connections
	ssl: process.env.DATABASE_SSL === 'true' ? {
		rejectUnauthorized: false
	} : false
});
