import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {join} from "path";
import * as fs from "fs";

@Injectable()
export class ConfigServiceProvider implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}


	createTypeOrmOptions(): TypeOrmModuleOptions {
		// In Docker/production: __dirname is /app/libraries/base/dist/providers
		// In dev: __dirname is /app/libraries/base/providers
		const isDist = __dirname.includes('dist');
		const appRoot = isDist
			? join(__dirname, '../../../../') // /app (from /app/libraries/base/dist/providers -> ../../../../ = /app)
			: join(__dirname, '../../../'); // /app (from /app/libraries/base/providers -> ../../../ = /app)

		// Clean fallback: ConfigService -> process.env -> smart defaults
		const getEnv = (key: string, defaultValue?: string): string | undefined => {
			return this.configService.get<string>(key) || process.env[key] || defaultValue;
		};

		// Smart environment detection with clean fallbacks
		const isCloudRun = !!(process.env.K_SERVICE || process.env.GAE_SERVICE);
		const isDocker = !!(process.env.DOCKER_ENV === 'true' || fs.existsSync('/.dockerenv'));
		
		// Database host fallback: explicit env var -> Cloud Run -> Docker -> localhost
		const defaultHost = getEnv('DATABASE_HOST') || 
			(isCloudRun ? '/cloudsql/iwatchfootball:europe-west4:iwatchfootball-db' : 
			 (isDocker ? 'database' : 'localhost'));
		
		// Database name fallback: explicit env var -> Cloud Run -> monorepo
		const defaultDatabase = getEnv('DATABASE_NAME') || 
			(isCloudRun ? 'iwatchfootball' : 'monorepo');

		const typeORMConfig: TypeOrmModuleOptions = {
			type: (getEnv('DATABASE_TYPE') || 'postgres') as any,
			host: defaultHost,
			port: parseInt(getEnv('DATABASE_PORT') || '5432', 10),
			username: getEnv('DATABASE_USERNAME') || 'postgres',
			password: getEnv('DATABASE_PASSWORD') || 'postgres',
			database: defaultDatabase,
			autoLoadEntities: true,
			entities: [
				join(appRoot, 'backend', isDist ? 'dist/src/api/modules/**/*.js' : 'src/api/modules/**/*{.ts,.js}'),
				join(appRoot, 'libraries', 'base', isDist ? 'dist/entity/**/*.js' : 'entity/**/*{.ts,.js}'),
			],
			migrations: [join(appRoot, 'backend', isDist ? 'dist/src/shared/migrations/*.js' : 'src/shared/migrations/*{.ts,.js}')],
			migrationsRun: true,
			synchronize: getEnv('DATABASE_SYNCHRONIZE') === 'true',
			logging: getEnv('NODE_ENV') !== 'production',
			ssl: getEnv('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
			extra: {
				max: 20,
				min: 5,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 10000,
			},
		};

		console.log('📊 TypeORM Configuration:');
		console.log(`   Environment: ${isCloudRun ? 'Cloud Run' : isDocker ? 'Docker' : 'Local'}`);
		console.log(`   Host: ${typeORMConfig.host}`);
		console.log(`   Port: ${typeORMConfig.port}`);
		console.log(`   Database: ${typeORMConfig.database}`);
		console.log(`   Username: ${typeORMConfig.username}`);
		console.log(`   SSL: ${typeORMConfig.ssl ? 'enabled' : 'disabled'}`);

		return typeORMConfig;
	}
}