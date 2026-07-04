import { Module } from '@nestjs/common';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { AttendanceTrackingFeatureService } from './attendance-tracking-feature.service';

@Module({
    imports: [PlatformConfigModule],
    providers: [AttendanceTrackingFeatureService],
    exports: [AttendanceTrackingFeatureService],
})
export class AttendanceTrackingFeatureModule {}
