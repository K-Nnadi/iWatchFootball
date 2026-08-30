# Football Data Providers, Platform State & Import Guide

This document consolidates provider research (via football-docs), the current I Watch Football platform capabilities, recommended additions, and how to import football data today.

---

## 1. Executive summary

| Role | Provider | Rationale (from football-docs) |
|------|----------|--------------------------------|
| **MVP / prototyping** | SportMonks | Documented REST API, free tier, fixtures + events + lineups + standings via includes; good for one-league builds |
| **Long-term production** | Sportradar | Enterprise B2B API with live feeds, coverage metadata, deep stats; subscription-scoped |
| **Low-cost fallback** | TheSportsDB | Free/public tier, live scores and metadata; not event-analytics grade |
| **Deep analytics layer** | StatsBomb | Rich events, lineups, IQ metrics (commercial); open data is selective but already integrated here |

**Current platform:** StatsBomb open data + API-Sports (API-Football v3) + **SportMonks** adapter are wired. Sportradar, TheSportsDB, and FotMob are not integrated.

---

## 2. Provider comparison (football-docs)

### Official vs unofficial

| Provider | Access type |
|----------|-------------|
| SportMonks | Official documented API |
| Sportradar | Official commercial B2B API |
| TheSportsDB | Official public/premium API (crowd-sourced data) |
| StatsBomb | Official commercial API + official open-data GitHub repo |
| FotMob | Unofficial — public web / undocumented consumer endpoints; bridge/corroborator only |

### Capability matrix (documented claims only)

| Capability | SportMonks | Sportradar | TheSportsDB | StatsBomb | FotMob |
|------------|:----------:|:----------:|:-----------:|:---------:|:------:|
| Fixtures & results | Yes | Yes | Yes | Yes (licensed/open selective) | Corroborator |
| Live scores | Paid plans | Yes | Premium v2 | Near-live (commercial) | Implied in public surfaces |
| Competitions & seasons | Yes | Yes | Yes | Yes | Bridge IDs |
| Teams & players | Yes | Yes | Yes | Yes | Bridge IDs |
| League tables | Yes | Yes | Lookup endpoints | Via stats, not primary | Not documented |
| Line-ups | Yes | Yes | Not documented | Yes | Mentioned in matching fields |
| Match events (G/C/S) | Yes | Yes | Not event-grade | Yes | Not documented |
| Player/match statistics | Yes (plan-dependent) | Yes (Extended) | Not advanced | Yes (commercial IQ) | Mentioned |
| Historical data | Plan-dependent | Yes | Broad metadata | Open selective + commercial | Not documented |
| English/European comps | Explicit league IDs in docs | Global, tiered | Multi-sport catalogue | Open-data lists PL/UCL | Not documented |
| Pricing in docs | Free + paid tiers | Commercial only | Free/Premium/Business RPM | Free open + paid license | Not documented |
| Auth documented | Token | `x-api-key` | v1 path key / v2 header | HTTP Basic / none (open) | Not documented |
| Pagination documented | Yes (`page`, `per_page`) | Not in corpus | Not in corpus | Per-endpoint; large mapping streams to file | Not documented |

---

## 3. What the platform has today

### 3.1 Data providers (integrated)

```
StatsBomb (GitHub open data) ──sync──► PostgreSQL entities
API-Sports (v3.football.api-sports.io) ──import/discover──► PostgreSQL (+ live proxy only)
YouTube ──highlights job──► fixtureHighlight
Web UI ──Orval clients──► REST API ──► DB
Mobile ──mock data only
```

| Provider | Integration path | Persisted entities |
|----------|------------------|-------------------|
| **StatsBomb** | `backend/src/api/adapters/statsbomb/` | `competition`, `season`, `team`, `player`, `fixture`, `stadium`, `manager`, `lineUp`, `playerLineUp`, `goal`, `card`, `substitution`, `playerFixtureStat`, derived `fixtureTeamStat` |
| **API-Sports** | `backend/src/api/adapters/api-sports/` | Competitions, seasons, `competitionStanding`, players, fixtures (scores/status), `teamStadium`, `transfer`, `fixtureTeamStat` |
| **YouTube** | `backend/src/api/complexModules/highlights/` | `fixtureHighlight` |

**Not integrated:** Sportradar, TheSportsDB, FotMob.

### 3.2 Cross-provider identity

Entities store external IDs under `metadata.providers.<slug>` (see `libraries/base/entity/entityMetadata.ts`):

- Canonical slugs in use: `apisports`, `statsbomb`
- Fixture correlation: StatsBomb fixtures matched to API-Sports fixtures within ±6h kickoff window

### 3.3 Backend entities (football graph)

| Area | Entities | Ingest status |
|------|----------|---------------|
| Matches | `fixture`, `goal`, `card`, `substitution`, `lineUp`, `playerLineUp`, `fixtureReferee` | Events/lineups mainly from StatsBomb; API-Sports fixtures without separate event entities |
| Competitions | `competition`, `season`, `teamCompetitionSeason`, `competitionStanding` | Both providers |
| Squads | `team`, `player`, `playerTeamStint`, `position`, `manager`, `transfer` | StatsBomb + API-Sports |
| Stats | `playerFixtureStat`, `fixtureTeamStat` | StatsBomb rollups + API-Sports team stats |
| Other | `injury` (schema only), `fixtureHighlight`, `prediction`, `attendanceRecord` | Highlights via YouTube; injuries not synced |

### 3.4 Frontend consumption

| Surface | Status |
|---------|--------|
| Competition, team, match, player pages | API-backed when numeric fixture/entity IDs exist |
| Match detail | Lineups, events, highlights, predictions, AI insights |
| Home + matches list | **Still mock data** (`home.page.tsx`, `matches.page.tsx`) |
| Live scores | No polling worker; `GET /api-sports/discover/fixtures/live` exists but is not consumed in UI |
| Mobile app | UI prototype with `generateMockMatches()`; no API client wired |

### 3.5 Import / sync infrastructure

| Mechanism | Location |
|-----------|----------|
| One-click admin pipeline | `POST /admin/data-sync/run` — see `backend/DATA_SYNC.md` |
| StatsBomb CLI | `backend/scripts/run-statsbomb-sync.ts` |
| Per-provider admin endpoints | `POST /statsbomb/sync`, `POST /api-sports/sync/import/*` |
| Async jobs | BullMQ `data-sync` queue when `REDIS_HOST` is set |
| Job tracking | `sync-job`, `sync-job-step` entities with cursors for resume |

**Pipeline steps** (`data-sync.dto.ts`):

1. `statsbomb` — full open-data sync (free, no API budget)
2. `api_leagues` — competitions + optional standings
3. `api_players` — squad import per league
4. `api_fixtures` — date-window fixture import
5. `api_enrich` — player profile enrichment

---

## 4. Gaps vs I Watch Football product needs

| Need | Current state | Gap |
|------|---------------|-----|
| Live scores end-to-end | API-Sports live discover endpoint only | No worker, no UI polling, home page mocked |
| Broad league coverage (UK/EU) | StatsBomb open data is selective; API-Sports quota-metered | Need predictable multi-league ingest |
| API-Sports lineups/events | Fixtures imported; events not split into `goal`/`card`/`substitution` | Match pages depend on StatsBomb overlap |
| Automated refresh | Admin-triggered only | No daily fixture cron or live polling |
| Mobile real data | Mock matches | Needs shared API client + fixture queries |
| Injuries / sidelined | Entity exists | No adapter |
| SportMonks (MVP candidate) | Not implemented | Would need new adapter + slug `sportmonks` in metadata |
| Enterprise provider (Sportradar) | Not present | Future production option |

---

## 5. Recommendations for the platform

### 5.1 Short term (use what exists)

1. **Wire home and matches pages** to `useGetQueryFixture` (or date-range fixture API) instead of mocks.
2. **Run the data-sync pipeline** for target leagues before launch; resume partial jobs with `resumeJobId`.
3. **Prefer StatsBomb-backed fixtures** for match detail (lineups, events, advanced stats); use API-Sports for schedules, tables, and live status where StatsBomb has no coverage.
4. **Add a lightweight live polling job** that calls `GET /api-sports/discover/fixtures/live`, updates `fixture.status` and scores, and stops when matches finish.

### 5.2 Medium term (SportMonks as secondary/MVP provider)

SportMonks fits a documented, include-based workflow that maps cleanly onto existing entities:

| SportMonks surface | Maps to platform entity |
|--------------------|-------------------------|
| `GET /leagues`, `GET /seasons/{id}` | `competition`, `season` |
| `GET /fixtures/*` + `include=participants;scores` | `fixture` |
| `include=events` | `goal`, `card`, `substitution` |
| `include=lineups` | `lineUp`, `playerLineUp` |
| `include=statistics` | `fixtureTeamStat`, optional `playerFixtureStat` |
| `GET /standings/seasons/{seasonId}` | `competitionStanding` |
| `GET /squads/seasons/{seasonId}/teams/{teamId}` | `player`, `playerTeamStint` |

**Suggested adapter layout** (mirrors existing patterns):

```
backend/src/api/adapters/sportmonks/
  sportmonks.config.ts          # SPORTMONKS_API_TOKEN, base URL
  sportmonks-http.service.ts    # auth, pagination helper (follow has_more)
  sportmonks-adapter.service.ts # map DTOs → entities + metadata.providers.sportmonks
  sportmonks.controller.ts      # admin import endpoints
  sportmonks-adapter.module.ts
```

**Pipeline step addition:** `sportmonks_fixtures` in `data-sync.dto.ts`, optionally before or after API-Sports depending on quota strategy.

### 5.3 Long term (production scale)

- Evaluate **Sportradar** for licensed live timelines, push feeds, and coverage flags when product needs enterprise SLA and global competition packages.
- Keep **StatsBomb** (commercial license) for analytics depth (xG, OBV, event coordinates) on key competitions.
- Use **TheSportsDB** only as a low-cost artwork/metadata/live-score fallback if needed — not as canonical event source.

### 5.4 Do not build on

- **FotMob** as a primary ingest source (undocumented, mutable contract per football-docs). Use only for manual ID corroboration during development.

---

## 6. SportMonks API reference (for future adapter)

Base URL: `https://api.sportmonks.com/v3/football`

### 6.1 Authentication & global query params

| Param | Purpose |
|-------|---------|
| `api_token` or `Authorization` header | Required on all calls |
| `include` | Semicolon-separated expansions; dot notation for nesting (e.g. `lineups.player;events.player`) |
| `select` | Field subset (e.g. `select=id,name,starting_at`) |
| `filters` | Narrow lists (e.g. `fixtureSeasonId:23614`, `fixtureStates:5,7,8`) |
| `page`, `per_page` | Pagination (default 25; max plan-dependent) |
| `timezone` | e.g. `Europe/London` (default UTC) |

Pagination response: `pagination.count`, `per_page`, `current_page`, `next_page`, `has_more` — always follow `has_more`.

### 6.2 Endpoints by domain

#### Leagues & seasons

| Endpoint | Required params |
|----------|-----------------|
| `GET /leagues` | — |
| `GET /leagues/{id}` | `id` |
| `GET /leagues/{id}/seasons` | `id` |
| `GET /seasons/{id}` | `id` |

Key season fields: `id`, `league_id`, `name`, `is_current`, `starting_at`, `ending_at`.

#### Fixtures

| Endpoint | Required params |
|----------|-----------------|
| `GET /fixtures` | Optional `filters`, `include` |
| `GET /fixtures/{id}` | `id` |
| `GET /fixtures/date/{date}` | `date` (`YYYY-MM-DD`) |
| `GET /fixtures/between/{from}/{to}` | `from`, `to` |
| `GET /fixtures/between/{from}/{to}/{teamId}` | `from`, `to`, `teamId` |
| `GET /fixtures/head-to-head/{team1}/{team2}` | `team1`, `team2` |

Key fixture fields: `id`, `league_id`, `season_id`, `round_id`, `state_id`, `starting_at`, `result_info`.

**Finished fixtures filter (documented):** `filters=fixtureSeasons:{seasonId};fixtureStates:5,7,8`

**Live / in-play:** use `state_id` — in-play: `2`, `6`, `9`, `22`; finals: `5`, `7`, `8`. State catalogue: `GET /states`.

Recommended includes:

- Match summary: `events;scores;lineups`
- Full match: `events;lineups;statistics;scores;formations`
- With player objects: `lineups.player;events.player`

#### Teams & players

| Endpoint | Required params |
|----------|-----------------|
| `GET /teams/{id}` | `id` |
| `GET /teams/search/{name}` | `name` |
| `GET /teams/countries/{countryId}` | `countryId` |
| `GET /seasons/{id}/teams` | `id` |
| `GET /players/{id}` | `id` |
| `GET /players/search/{name}` | `name` |
| `GET /squads/teams/{teamId}` | `teamId` |
| `GET /squads/seasons/{seasonId}/teams/{teamId}` | `seasonId`, `teamId` |

#### Standings

| Endpoint | Required params |
|----------|-----------------|
| `GET /standings/seasons/{seasonId}` | `seasonId` |
| `GET /standings/live/leagues/{leagueId}` | `leagueId` |
| `GET /standings/rounds/{roundId}` | `roundId` (include `participant;details`) |

Standing fields: `position`, `points`, `participant_id`, `details[]` (played, won, draw, lost, GF, GA, GD via type IDs).

#### Line-ups (via fixture include)

Lineup `type_id`: `11` = starter, `12` = substitute.

Optional nested stats on lineup: `lineups.details` — type `118` = rating, `119` = minutes played.

#### Match events (via fixture include)

| Event `type_id` | Meaning |
|-----------------|---------|
| 14 | Goal |
| 15 | Own goal |
| 16 | Penalty goal |
| 18 | Substitution (`player_id` on, `related_player_id` off) |
| 19–21 | Yellow / second yellow / red |
| 24 | VAR |

Event fields: `minute`, `extra_minute`, `player_id`, `related_player_id`, `participant_id`, `result`.

#### Statistics (via fixture include)

Structure: `fixture_id`, `type_id`, `participant_id`, optional `player_id`, `data.value`, `location`.

xG/xA (`580`, `581`) are plan-dependent (not on free tier per docs).

### 6.3 Plan constraints (documented)

| Plan | Leagues | History | Live scores | xG |
|------|---------|---------|-------------|-----|
| Free | 1 | Current season only | No | No |
| Básico | 5 | 2 seasons | No | No |
| Standard | 20+ | 5 seasons | Yes | Yes |
| Advanced | 1,400+ | All | Yes | Yes |

Rate limits (RPM): Free 180, Básico 1000, Standard 1500, Advanced 3000.

---

## 7. How to import data today

### 7.1 Prerequisites

Environment variables:

```bash
# API-Sports (required for API-Sports steps)
API_SPORTS_KEY=...
# or APISPORTS_KEY / FOOTBALLAPISPORTS_API_KEY (RapidAPI)

# Optional: async jobs + resume
REDIS_HOST=...

# StatsBomb (optional TLS override for corporate proxies)
STATSBOMB_INSECURE_TLS=false
```

Admin JWT with **ADMIN** role for sync endpoints.

### 7.2 One-click pipeline (recommended)

```http
POST /admin/data-sync/run
Authorization: Bearer <admin-jwt>
Content-Type: application/json
```

Example body (tight window for free API-Sports tier):

```json
{
  "maxApiRequests": 100,
  "async": true,
  "statsbomb": {},
  "apiLeagues": {
    "syncTeamsAndStandings": true,
    "maxStandingsRequests": 10
  },
  "apiPlayers": {
    "maxPages": 2,
    "maxRequestsPerLeague": 5
  },
  "apiFixtures": {
    "from": "2025-08-01",
    "to": "2025-08-14",
    "maxPages": 5,
    "maxRequestsPerLeague": 10
  },
  "apiEnrich": {
    "limit": 50
  }
}
```

Poll job status:

```http
GET /admin/data-sync/jobs/{syncJobId}
```

Resume a partial job:

```json
{
  "resumeJobId": "<previous-sync-job-uuid>",
  "maxApiRequests": 100
}
```

See `backend/DATA_SYNC.md` for quota behaviour and timeout notes.

### 7.3 StatsBomb only (no API quota cost)

**HTTP:**

```http
POST /statsbomb/sync
```

**CLI (no JWT):**

```bash
cd backend
npx ts-node scripts/run-statsbomb-sync.ts
```

**Status:**

```http
GET /statsbomb/status
```

Granular steps: `POST /statsbomb/sync/competitions`, `/sync/teams`, `/sync/fixtures`, plus test endpoints for single-match debugging.

StatsBomb source: `https://raw.githubusercontent.com/statsbomb/open-data/master/data`

Open-data competitions include selective Premier League and Champions League seasons — not full current-season coverage for all UK/EU leagues.

### 7.4 API-Sports granular imports

| Operation | Endpoint |
|-----------|----------|
| Leagues + seasons | `POST /api-sports/sync/import/leagues` |
| Standings | `POST /api-sports/sync/standings` |
| Fixtures (date window) | `POST /api-sports/sync/import/fixtures` |
| Players | `POST /api-sports/sync/import/players` |
| Player enrichment | `POST /api-sports/enrich/players` |
| Team venues | `POST /api-sports/sync/import/team-primary-venues` |
| Transfers | `POST /api-sports/sync/transfers` |
| Fixture team stats | `POST /api-sports/sync/import/fixture-stats` |

**Discover (no DB persist):**

| Operation | Endpoint |
|-----------|----------|
| Live fixtures | `GET /api-sports/discover/fixtures/live` |
| Fixtures by filters | `GET /api-sports/discover/fixtures` |
| Leagues / teams | `GET /api-sports/discover/leagues`, `/discover/teams` |

### 7.5 Highlights

YouTube highlight ingestion runs via the highlights scheduler (BullMQ when Redis is configured). Admin dashboard exposes sync controls at `frontend/ui/src/pages/admin/dashboard.page.tsx`.

### 7.6 Suggested import order for a new environment

1. **StatsBomb full sync** — seeds competitions, teams, players, fixtures, events, lineups, player fixture stats where open data covers your target competitions.
2. **API-Sports leagues** — imports additional competitions and standings for leagues outside StatsBomb coverage.
3. **API-Sports fixtures** — date window covering current season / matchday panel needs.
4. **API-Sports players + enrich** — fills squads and profile fields for teams missing from StatsBomb.
5. **API-Sports fixture-stats** — team-level match statistics for fixtures that lack StatsBomb rollups.
6. **Verify in UI** — competition page, match page (numeric ID), team and player pages.
7. **(Future) SportMonks import** — once adapter exists, use for live scores + single-provider consistency on chosen leagues.

---

## 8. SportMonks import flow (implemented)

Adapter: `backend/src/api/adapters/sportmonks/`

| Step | Endpoint | Maps to |
|------|----------|---------|
| 1 | `POST /sportmonks/sync/import/leagues` | `competition`, `season` |
| 2 | `POST /sportmonks/sync/standings` | `competitionStanding` |
| 3 | `POST /sportmonks/sync/import/fixtures` | `fixture` (+ scores, state) |
| 4 | `POST /sportmonks/sync/fixture-details` | `goal`, `card`, `substitution`, `lineUp`, stats |
| 5 | `POST /sportmonks/sync/run` | Full pipeline under `maxApiRequests` |

Or via one-click job — add `sportmonks` to `POST /admin/data-sync/run`:

```json
{
  "sportmonks": {
    "leagueIds": [8],
    "from": "2025-08-01",
    "to": "2025-08-14",
    "maxApiRequests": 100,
    "syncStandings": true,
    "syncFixtureDetails": true
  }
}
```

**Identity:** `metadata.providers.sportmonks.externalId` on each entity; merges with existing `apisports` / `statsbomb` IDs.

---

## 9. Environment variables checklist

| Variable | Provider / feature |
|----------|-------------------|
| `API_SPORTS_KEY` | API-Sports imports |
| `STATSBOMB_INSECURE_TLS` | StatsBomb GitHub fetch |
| `REDIS_HOST` | Async data-sync + highlights |
| `SPORTMONKS_API_TOKEN` | SportMonks adapter |
| `SPORTRADAR_API_KEY` | *(future)* Sportradar |

---

## 10. Related files

| File | Purpose |
|------|---------|
| `backend/DATA_SYNC.md` | Operational guide for admin pipeline |
| `backend/src/api/complexModules/dataSync/` | Pipeline orchestration |
| `backend/src/api/adapters/statsbomb/` | StatsBomb adapter |
| `backend/src/api/adapters/api-sports/` | API-Sports adapter |
| `backend/src/api/adapters/sportmonks/` | SportMonks adapter |
| `libraries/base/entity/entityMetadata.ts` | Cross-provider ID convention |
| `frontend/ui/src/pages/admin/dashboard.page.tsx` | Admin sync UI |
| `clients/controllers/admin-data-sync.ts` | Generated client for pipeline |

---

## 11. Open questions for product decision

1. **Primary live-score source:** extend API-Sports polling vs add SportMonks Standard plan vs Sportradar production package?
2. **Analytics depth:** stay on StatsBomb open data vs commercial StatsBomb license for IQ metrics?
3. **Mobile launch blocker:** wire `clients/` to mobile with `API_URL` before adding another provider?
4. **League scope for MVP:** which `leagueApiIds` / SportMonks league IDs are must-have for UK + European coverage?

---

*Last updated from football-docs MCP research and codebase audit. Re-run `list_providers` / `get_provider_docs` on the football-docs MCP server when provider documentation changes.*
