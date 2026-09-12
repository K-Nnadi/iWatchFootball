const CLUB_SUFFIXES = /\b(fc|afc|cfc|sc|football club|soccer club|calcio|cf)\b/g;

const TEAM_NAME_ALIASES: Record<string, string> = {
  brighton: 'brighton',
  'brighton hove albion': 'brighton',
  'brighton and hove albion': 'brighton',
  liverpool: 'liverpool',
  'liverpool fc': 'liverpool',
  tottenham: 'tottenham',
  'tottenham hotspur': 'tottenham',
  spurs: 'tottenham',
  'manchester city': 'manchester city',
  'man city': 'manchester city',
  'manchester united': 'manchester united',
  'man united': 'manchester united',
  'man utd': 'manchester united',
  'nottingham forest': 'nottingham forest',
  'nottm forest': 'nottingham forest',
  'newcastle united': 'newcastle',
  newcastle: 'newcastle',
  'leeds united': 'leeds',
  leeds: 'leeds',
  'west ham united': 'west ham',
  'west ham': 'west ham',
  'wolverhampton wanderers': 'wolves',
  wolves: 'wolves',
  'leicester city': 'leicester',
  leicester: 'leicester',
  'ipswich town': 'ipswich',
  ipswich: 'ipswich',
  'coventry city': 'coventry',
  coventry: 'coventry',
  'hull city': 'hull',
  hull: 'hull',
  'afc bournemouth': 'bournemouth',
  bournemouth: 'bournemouth',
  'sheffield united': 'sheffield united',
  'sheffield wednesday': 'sheffield wednesday',
};

export function normalizeClubName(name: unknown): string {
  return String(name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(CLUB_SUFFIXES, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function clubNameKey(name: unknown): string {
  const n = normalizeClubName(name);
  return TEAM_NAME_ALIASES[n] ?? n;
}

export function isWomensClubName(name: unknown): boolean {
  const n = ` ${normalizeClubName(name)} `;
  return /\b(wfc|women|ladies|women s|w)\b/.test(n);
}

export function hasExternalProviders(metadata: unknown, extraSlugs: string[] = []): boolean {
  const providers = (metadata as { providers?: Record<string, { externalId?: string }> } | null)?.providers;
  if (!providers) return false;
  const slugs = ['apisports', 'statsbomb', 'sportmonks', ...extraSlugs];
  return slugs.some((s) => providers[s]?.externalId != null);
}

export function isSportApiOnly(metadata: unknown): boolean {
  const providers = (metadata as { providers?: Record<string, { externalId?: string }> } | null)?.providers;
  if (!providers) return false;
  const keys = Object.keys(providers).filter((k) => providers[k]?.externalId != null);
  return keys.length === 1 && keys[0] === 'sportapi';
}

export function providerExternalId(metadata: unknown, slug: string): string | null {
  const v = (metadata as { providers?: Record<string, { externalId?: string }> } | null)?.providers?.[slug]?.externalId;
  return v != null ? String(v) : null;
}

export function scoreCanonicalTeam(row: { name?: string; metadata?: unknown }, sourceName: string): number {
  const sourceKey = clubNameKey(sourceName);
  const rowKey = clubNameKey(row.name);
  if (!sourceKey || rowKey !== sourceKey) return Number.NEGATIVE_INFINITY;
  if (isWomensClubName(sourceName) !== isWomensClubName(row.name)) return Number.NEGATIVE_INFINITY;

  let score = 100;
  if (normalizeClubName(row.name) === normalizeClubName(sourceName)) score += 40;
  const providers = (row.metadata as { providers?: Record<string, { externalId?: string }> } | null)?.providers ?? {};
  if (providers.apisports?.externalId) score += 25;
  if (providers.statsbomb?.externalId) score += 25;
  if (providers.sportmonks?.externalId) score += 15;
  if (isSportApiOnly(row.metadata)) score -= 80;
  return score;
}
