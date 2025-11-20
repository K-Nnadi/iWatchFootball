import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {join} from "path";
const entities = [join(__dirname, '../../', 'src/api/modules/**/*{.ts,.js}')];

@Injectable()
export class ConfigServiceProvider implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}


	createTypeOrmOptions(): TypeOrmModuleOptions {
		const root = __dirname.includes('dist')
			? join(__dirname, '../../') // in compiled build
			: join(__dirname, '../../../'); // in dev

		const typeORMConfig = {
			type: this.configService.get('DATABASE_TYPE'),
			host: this.configService.get('DATABASE_HOST'),
			port: this.configService.get('DATABASE_PORT'),
			username: this.configService.get('DATABASE_USERNAME'),
			autoLoadEntities: true,
			entities: [
				// ✅ backend entities
				join(root, 'src/api/modules/**/*{.ts,.js}'),
				// ✅ shared library entities
				join(root, '../libraries/base/**/*{.ts,.js}'),
			],
			// @ts-ignore
			password: this.configService.get('DATABASE_PASSWORD'),
			database: this.configService.get('DATABASE_NAME'),
			logging: true,
			synchronize: this.configService.get('DATABASE_SYNCHRONIZE') === 'true',
			migrationsRun: true,
			migrations: [`src/shared/migrations/*{.ts,.js}`],
			cli: {
				migrationsDir: 'src/shared/migrations'
			},
			// SSL configuration for remote PostgreSQL connections
			ssl: this.configService.get('DATABASE_SSL') === 'true' ? {
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