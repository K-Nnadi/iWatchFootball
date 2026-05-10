import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTicketLog } from './userTicketLog.entity';
import { UserTicketLogService } from './userTicketLog.service';
import { UserTicketLogController } from './userTicketLog.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserTicketLog])],
    controllers: [UserTicketLogController],
    providers: [UserTicketLogService],
    exports: [UserTicketLogService],
})
export class UserTicketLogModule {}
