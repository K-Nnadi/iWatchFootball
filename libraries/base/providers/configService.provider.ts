import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {join} from "path";

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

		// Get values from ConfigService, fallback to process.env, then to defaults
		const getEnv = (key: string, defaultValue?: string): string | undefined => {
			const configValue = this.configService.get<string>(key);
			const envValue = process.env[key];
			const result = configValue || envValue || defaultValue;
			// Debug logging for DATABASE_TYPE
			if (key === 'DATABASE_TYPE' && !result) {
				console.log(`⚠️  ${key} not found - configService: ${configValue}, process.env: ${envValue}, default: ${defaultValue}`);
			}
			return result;
		};

		const typeORMConfig = {
			type: getEnv('DATABASE_TYPE', 'postgres') as any,
			host: getEnv('DATABASE_HOST', 'localhost'),
			port: parseInt(getEnv('DATABASE_PORT', '5432') || '5432', 10),
			username: getEnv('DATABASE_USERNAME', 'postgres'),
			autoLoadEntities: true,
			entities: [
				// ✅ backend entities (compiled to .js in production)
				join(appRoot, 'backend', isDist ? 'dist/src/api/modules/**/*.js' : 'src/api/modules/**/*{.ts,.js}'),
				// ✅ shared library entities (if any)
				join(appRoot, 'libraries', 'base', isDist ? 'dist/entity/**/*.js' : 'entity/**/*{.ts,.js}'),
			],
			// @ts-ignore
			password: getEnv('DATABASE_PASSWORD', 'postgres'),
			database: getEnv('DATABASE_NAME', 'monorepo'),
			logging: true,
			synchronize: (getEnv('DATABASE_SYNCHRONIZE') || 'false') === 'true',
			migrationsRun: true,
			migrations: [join(appRoot, 'backend', isDist ? 'dist/src/shared/migrations/*.js' : 'src/shared/migrations/*{.ts,.js}')],
			cli: {
				migrationsDir: join(appRoot, 'backend', 'src/shared/migrations')
			},
			// SSL configuration for remote PostgreSQL connections
			ssl: (getEnv('DATABASE_SSL') || 'false') === 'true' ? {
				rejectUnauthorized: false
			} : false
		}

		console.log('📊 TypeORM Configuration:');
		console.log(`   Type: ${typeORMConfig.type || 'not set'}`);
		console.log(`   Host: ${typeORMConfig.host ? '***set***' : 'not set'}`);
		console.log(`   Port: ${typeORMConfig.port || 'not set'}`);
		console.log(`   Database: ${typeORMConfig.database ? '***set***' : 'not set'}`);
		console.log(`   Username: ${typeORMConfig.username ? '***set***' : 'not set'}`);
		console.log(`   Password: ${typeORMConfig.password ? '***set***' : 'not set'}`);
		console.log(`   SSL: ${typeORMConfig.ssl ? 'enabled' : 'disabled'}`);
		console.log(`   Synchronize: ${typeORMConfig.synchronize}`);
		console.log(`   Migrations Run: ${typeORMConfig.migrationsRun}`);
		console.log(`   Entity paths:`, typeORMConfig.entities);
		
		return  typeORMConfig;
	}
}