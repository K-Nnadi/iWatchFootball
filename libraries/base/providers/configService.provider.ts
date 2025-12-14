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
		
		// In Cloud Run, ALWAYS use Unix socket connection for Cloud SQL (more reliable and secure)
		// Even if DATABASE_HOST is set to an IP, we override it to use the socket
		const cloudSqlSocketPath = '/cloudsql/iwatchfootball:europe-west4:iwatchfootball-db';
		const explicitHost = getEnv('DATABASE_HOST');
		
		// Database host: In Cloud Run, force socket connection; otherwise use explicit or defaults
		const defaultHost = isCloudRun 
			? cloudSqlSocketPath  // Always use socket in Cloud Run
			: (explicitHost || (isDocker ? 'database' : 'localhost'));
		
		// Database name: use explicit, or default to lowercase 'iwatchfootball' in Cloud Run
		// Normalize to lowercase to avoid case-sensitivity issues with PostgreSQL
		const rawDatabaseName = getEnv('DATABASE_NAME') || 
			(isCloudRun ? 'iwatchfootball' : 'monorepo');
		const defaultDatabase = rawDatabaseName.toLowerCase();
		
		// Log if we're overriding DATABASE_HOST in Cloud Run
		if (isCloudRun && explicitHost && explicitHost !== cloudSqlSocketPath) {
			console.warn(`⚠️  DATABASE_HOST is set to "${explicitHost}" but Cloud Run requires socket connection.`);
			console.warn(`Overriding to use Cloud SQL socket: ${cloudSqlSocketPath}`);
			console.warn(`To use socket connection, either:`);
			console.warn(`1. Remove DATABASE_HOST from environment variables, or`);
			console.warn(`2. Set DATABASE_HOST to "${cloudSqlSocketPath}"`);
		}

		// Detect if using Cloud SQL socket connection (Unix domain socket)
		// Socket paths start with /cloudsql/ or contain : (project:region:instance format)
		const isSocketConnection = defaultHost.startsWith('/cloudsql/') || (defaultHost.includes(':') && !defaultHost.includes('.'));
		
		// For socket connections, verify the socket directory exists (Cloud Run requirement)
		if (isSocketConnection && isCloudRun) {
			const socketDir = defaultHost.startsWith('/cloudsql/') 
				? '/cloudsql' 
				: defaultHost.split(':')[0];
			if (!fs.existsSync(socketDir)) {
				console.error(`❌ ERROR: Cloud SQL socket directory not found: ${socketDir}`);
				console.error(`This indicates Cloud SQL connection is not properly configured.`);
				console.error(`Please verify:`);
				console.error(`1. Cloud Run service has --add-cloudsql-instances flag set`);
				console.error(`2. Cloud Run service account has "Cloud SQL Client" IAM role`);
				console.error(`3. Cloud SQL instance name matches: ${defaultHost.replace('/cloudsql/', '')}`);
				console.error(`4. Cloud SQL instance is in the same region as Cloud Run service`);
			} else {
				console.log(`✅ Cloud SQL socket directory found: ${socketDir}`);
				// List available sockets for debugging
				try {
					const sockets = fs.readdirSync(socketDir);
					console.log(`📁 Available Cloud SQL sockets: ${sockets.join(', ') || 'none found'}`);
					if (!sockets.some(s => defaultHost.includes(s))) {
						console.warn(`⚠️  Warning: Expected socket not found in directory.`);
						console.warn(`   Looking for: ${defaultHost}`);
						console.warn(`   Available: ${sockets.join(', ')}`);
					}
				} catch (err) {
					console.warn(`⚠️  Could not read socket directory: ${err}`);
				}
			}
		}
		
		// For socket connections, don't set port (it's not used)
		// For TCP connections, use the provided port or default 5432
		const databasePort = isSocketConnection 
			? undefined 
			: (getEnv('DATABASE_PORT') ? parseInt(getEnv('DATABASE_PORT')!, 10) : 5432);

		const typeORMConfig: TypeOrmModuleOptions = {
			type: (getEnv('DATABASE_TYPE') || 'postgres') as any,
			host: defaultHost,
			...(databasePort !== undefined && { port: databasePort }),
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
			migrationsTransactionMode: 'each', // Run each migration in its own transaction
			synchronize: getEnv('DATABASE_SYNCHRONIZE') === 'true',
			logging: getEnv('NODE_ENV') !== 'production',
			// Socket connections don't use SSL
			ssl: isSocketConnection ? false : (getEnv('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false),
			extra: {
				max: 20,
				min: 5,
				idleTimeoutMillis: 30000,
				// For Cloud SQL socket connections, use longer timeout (socket connections can be slower)
				// For TCP connections, 30s is usually sufficient
				connectionTimeoutMillis: isSocketConnection && isCloudRun ? 60000 : 30000,
				// Reduce retry attempts for Cloud Run to fail faster and provide better error messages
				// TypeORM will still retry internally, but we want to surface errors sooner
				retryAttempts: isCloudRun ? 1 : 3,
				retryDelay: isCloudRun ? 1000 : 3000,
				// For socket connections, ensure we're using the correct connection method
				...(isSocketConnection && {
					// PostgreSQL socket connection specific options
					keepAlive: true,
					keepAliveInitialDelayMillis: 10000,
				}),
			},
		};

		console.log('📊 TypeORM Configuration:');
		console.log(`Environment: ${isCloudRun ? 'Cloud Run' : isDocker ? 'Docker' : 'Local'}`);
		console.log(`Connection Type: ${isSocketConnection ? 'Unix Socket (Cloud SQL)' : 'TCP'}`);
		console.log(`Host: ${typeORMConfig.host}`);
		console.log(`Port: ${databasePort !== undefined ? databasePort : 'N/A (socket connection)'}`);
		console.log(`Database: ${typeORMConfig.database}`);
		console.log(`Username: ${typeORMConfig.username}`);
		console.log(`SSL: ${typeORMConfig.ssl ? 'enabled' : 'disabled'}`);
		console.log(`Connection Timeout: ${typeORMConfig.extra?.connectionTimeoutMillis}ms`);
		console.log(`Migrations: ${typeORMConfig.migrationsRun ? 'enabled' : 'disabled'}`);

		return typeORMConfig;
	}
}