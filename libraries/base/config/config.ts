import {ConfigServiceProvider} from "../providers/configService.provider";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";

const ENV = process.env.NODE_ENV;

// console.log("PROCESS.ENV", process.env )

export const TYPEORM_CONFIG = TypeOrmModule.forRootAsync({
    useClass: ConfigServiceProvider,
    inject: [ConfigServiceProvider],
});

export const CONFIG = ConfigModule.forRoot({
    envFilePath: ENV === 'development' ? '.env': undefined,
    isGlobal: true
})