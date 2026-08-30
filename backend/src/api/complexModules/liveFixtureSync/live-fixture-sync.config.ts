/** Cron for live fixture polling (default: every 2 minutes). */
export const LIVE_FIXTURE_SYNC_CRON = process.env.LIVE_FIXTURE_SYNC_CRON ?? '*/2 * * * *';

/** Hard kill-switch via environment (when set to false/0/off). */
export function isLiveFixtureSyncEnabledByEnv(): boolean {
  const raw = process.env.LIVE_FIXTURE_SYNC_ENABLED;
  if (raw == null || raw === '') {
    return true;
  }
  return !['0', 'false', 'no', 'off'].includes(raw.trim().toLowerCase());
}
