import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateLogDTO, Log } from './log.entity';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { TrackerModule } from '../../complexModules/tracker/tracker.module';

@Module({
    imports: [TypeOrmModule.forFeature([Log]), forwardRef(() => TrackerModule)],
    controllers: [LogController],
    providers: [LogService],
    exports: [LogService],
})
export class LogModule {}

export { CreateLogDTO, Log, LogService };
