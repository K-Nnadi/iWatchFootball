/**
 * Cross-entity convention for `metadata` JSON on {@link BaseDbEntity} (and any other JSON metadata columns).
 *
 * **Multiple external APIs:** store each vendor under `metadata.providers.<slug>` so ids and payloads from
 * API-Football, StatsBomb, etc. can coexist on one row. Merge **by provider key** (deep-merge objects per slug);
 * never wipe the whole `providers` map when syncing a single source.
 *
 * **Matching:** use `metadata.providers[slug].externalId` as the canonical string id for that vendor where applicable.
 *
 * Legacy top-level keys (e.g. `metadata.apisports`, `metadata.statsbombId`) may still exist on old rows until migrated;
 * readers should prefer `providers` and fall back to legacy fields when ingesting.
 */

/** One external data vendor / API namespace (e.g. `apisports`, `statsbomb`). */
export type ExternalProviderSlug = string;

/**
 * Per-provider payload. Keep `externalId` when this vendor exposes a stable primary identifier.
 * Additional vendor-specific fields are allowed (sync times, sub-ids, small snapshots).
 */
export interface ExternalProviderMetadata {
  externalId?: string;
  [extra: string]: unknown;
}

/**
 * Standard shape for entity `metadata` JSON. Extra top-level keys are allowed (legacy + custom).
 */
export interface EntityMetadataCore {
  /**
   * Broad origin hint (e.g. `api-sports`, `statsbomb`, `manual`). Does not replace per-provider entries
   * when multiple sources are linked.
   */
  source?: string;
  /**
   * One entry per external system; multiple can be present on the same entity.
   * @example { apisports: { externalId: '33' }, statsbomb: { externalId: '964' } }
   */
  providers?: Partial<Record<ExternalProviderSlug, ExternalProviderMetadata>>;
  /** Optional labels for filtering or UI (e.g. competition tags). */
  tags?: string[];
}

/**
 * Entity metadata as stored in JSONB: documented core fields plus any extra keys (legacy blobs, feature flags).
 */
export type EntityMetadata = EntityMetadataCore & Record<string, unknown>;

/** Canonical `metadata.providers` keys — use these slugs for new writes. */
export const ENTITY_METADATA_PROVIDER = {
  APISPORTS: 'apisports',
  STATSBOMB: 'statsbomb',
  SPORTMONKS: 'sportmonks',
} as const;

export type KnownMetadataProviderSlug = (typeof ENTITY_METADATA_PROVIDER)[keyof typeof ENTITY_METADATA_PROVIDER];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
}

function shallowClonePlain(base: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!isPlainObject(base)) return {};
  return { ...base };
}

/**
 * Deep-merge JSON-like metadata: nested plain objects recurse; arrays and non-objects are replaced by the patch value.
 * `undefined` in the patch skips that key; `null` sets null. Use for combining vendor / sync payloads without dropping other providers.
 */
export function deepMergeEntityMetadata(
  base: Record<string, unknown> | null | undefined,
  patch: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (patch == null || typeof patch !== 'object' || Array.isArray(patch)) {
    return shallowClonePlain(base);
  }
  const result = shallowClonePlain(base);

  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    if (pv === undefined) continue;
    if (pv === null) {
      result[key] = null;
      continue;
    }
    if (Array.isArray(pv)) {
      result[key] = pv.slice();
      continue;
    }
    if (pv instanceof Date) {
      result[key] = pv;
      continue;
    }
    if (isPlainObject(pv)) {
      const bv = result[key];
      const baseSub = isPlainObject(bv) ? bv : {};
      result[key] = deepMergeEntityMetadata(baseSub, pv);
      continue;
    }
    result[key] = pv;
  }
  return result;
}
