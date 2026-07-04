import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { ATTENDANCE_TRACKING_CONFIG, ATTENDANCE_TRACKING_DEFAULTS } from './attendance-tracking.constants';

@Injectable()
export class AttendanceTrackingFeatureService {
    constructor(private readonly platformConfig: PlatformConfigService) {}

    async isEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            ATTENDANCE_TRACKING_CONFIG.ENABLED,
            ATTENDANCE_TRACKING_DEFAULTS.ENABLED,
        );
    }

    async isDocumentUploadEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            ATTENDANCE_TRACKING_CONFIG.DOCUMENT_UPLOAD_ENABLED,
            ATTENDANCE_TRACKING_DEFAULTS.DOCUMENT_UPLOAD_ENABLED,
        );
    }

    async assertEnabled(): Promise<void> {
        if (!(await this.isEnabled())) {
            throw new ServiceUnavailableException('Attendance tracking is not enabled');
        }
    }

    async assertDocumentUploadEnabled(): Promise<void> {
        if (!(await this.isDocumentUploadEnabled())) {
            throw new ServiceUnavailableException('Ticket document upload is not enabled');
        }
    }
}
