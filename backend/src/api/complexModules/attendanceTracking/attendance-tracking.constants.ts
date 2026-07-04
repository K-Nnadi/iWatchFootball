export const ATTENDANCE_TRACKING_CONFIG = {
    ENABLED: 'attendance_tracking_enabled',
    DOCUMENT_UPLOAD_ENABLED: 'ticket_document_upload_enabled',
} as const;

export const ATTENDANCE_TRACKING_DEFAULTS = {
    ENABLED: false,
    DOCUMENT_UPLOAD_ENABLED: false,
} as const;
