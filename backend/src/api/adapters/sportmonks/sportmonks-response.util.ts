import type { SportMonksListResponse, SportMonksPagination } from './sportmonks.types';

/** SportMonks list/single responses use `{ data: ... }`; some paths may return the entity directly. */
export function extractSportMonksEntity<T extends { id?: number }>(body: unknown): T | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (o.data != null && typeof o.data === 'object' && !Array.isArray(o.data)) {
    const inner = o.data as T;
    if (inner.id != null) return inner;
  }
  if (o.id != null) return o as T;
  return null;
}

export function extractSportMonksList<T>(body: unknown): T[] {
  if (body == null || typeof body !== 'object') return [];
  const o = body as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as T[];
  if (Array.isArray(body)) return body as T[];
  return [];
}

export function sportMonksResponseHint(body: unknown): string {
  if (body == null) return 'null body';
  if (typeof body !== 'object') return String(body);
  const o = body as Record<string, unknown>;
  if (o.message != null) return String(o.message);
  if (o.error_code != null) return `error_code ${o.error_code}`;
  const keys = Object.keys(o).slice(0, 8).join(', ');
  return `keys: ${keys}`;
}

export type { SportMonksListResponse, SportMonksPagination };
