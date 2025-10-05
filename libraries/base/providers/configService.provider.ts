import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {join} from "path";
const entities = [join(__dirname, '../../', 'src/api/modules/**/*{.ts,.js}')];

@Injectable()
export class ConfigServiceProvider implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}


	createTypeOrmOptions(): TypeOrmModuleOptions {
		const typeORMConfig = {
			type: this.configService.get('DATABASE_TYPE'),
			host: this.configService.get('DATABASE_HOST'),
			port: this.configService.get('DATABASE_PORT'),
			username: this.configService.get('DATABASE_USERNAME'),
			autoLoadEntities: true,
			entities: [`src/api/modules/**/*{.ts,.js}`],
			// @ts-ignore
			password: this.configService.get('DATABASE_PASSWORD'),
			database: this.configService.get('DATABASE_NAME'),
			logging: true,
			synchronize: this.configService.get('DATABASE_SYNCHRONIZE') === 'true',
			migrationsRun: true,
			migrations: [`src/shared/migrations/*{.ts,.js}`],
			cli: {
				migrationsDir: 'src/shared/migrations'
			}
		}

		// console.log('TypeORM Config:', JSON.stringify(typeORMConfig, null, 2));
		return  typeORMConfig;
	}
}