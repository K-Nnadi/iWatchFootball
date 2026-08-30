import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AttendanceRecord } from './attendanceRecord.entity';
import { AttendanceService, AttendanceStorageService } from './attendanceRecord.service';
import { TicketInterestModule } from '../ticketInterest/ticketInterest.module';
import { AttendanceController } from './attendanceRecord.controller';
import { AttendanceTrackingFeatureModule } from '../../complexModules/attendanceTracking/attendance-tracking-feature.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AttendanceRecord]),
        MulterModule.register({ storage: undefined }), // memory storage (buffer in req.file)
        AttendanceTrackingFeatureModule,
        TicketInterestModule,
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService, AttendanceStorageService],
    exports: [AttendanceService],
})
export class AttendanceRecordModule {}
