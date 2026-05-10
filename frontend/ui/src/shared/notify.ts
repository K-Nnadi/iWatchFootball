import { notifications } from '@mantine/notifications';

export interface NotifyOptions {
    /** Override the auto-close delay in ms, or false to disable */
    autoClose?: number | false;
    /** Stable id — prevents duplicate toasts for the same event */
    id?: string;
}

const DEFAULT_AUTO_CLOSE = {
    success: 4000,
    error:   5000,
    warning: 6000,
    info:    4000,
} as const;

function success(title: string, message: string, options?: NotifyOptions): void {
    notifications.show({
        title,
        message,
        color: 'green',
        autoClose: DEFAULT_AUTO_CLOSE.success,
        ...options,
    });
}

function error(title: string, message: string, options?: NotifyOptions): void {
    notifications.show({
        title,
        message,
        color: 'red',
        autoClose: DEFAULT_AUTO_CLOSE.error,
        ...options,
    });
}

function warning(title: string, message: string, options?: NotifyOptions): void {
    notifications.show({
        title,
        message,
        color: 'orange',
        autoClose: DEFAULT_AUTO_CLOSE.warning,
        ...options,
    });
}

function info(title: string, message: string, options?: NotifyOptions): void {
    notifications.show({
        title,
        message,
        color: 'blue',
        autoClose: DEFAULT_AUTO_CLOSE.info,
        ...options,
    });
}

export const notify = { success, error, warning, info };
