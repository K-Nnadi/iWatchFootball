import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateLogDTO, Log } from './log.entity';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { TrackerModule } from '../../complexModules/tracker/tracker.module';
import { PlayerFixtureStatModule } from '../playerFixtureStat/playerFixtureStat.module';
import { PlatformConfigModule } from '../platformConfig/platformConfig.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Log]),
        forwardRef(() => TrackerModule),
        PlayerFixtureStatModule,
        PlatformConfigModule,
    ],
    controllers: [LogController],
    providers: [LogService],
    exports: [LogService],
})
export class LogModule {}

export { CreateLogDTO, Log, LogService };
