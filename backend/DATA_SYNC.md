# One-click data sync (StatsBomb + API-Sports + SportMonks)

Admin API under **`/admin/data-sync`** (JWT + **ADMIN** role):

- **`POST /admin/data-sync/run`** — Runs StatsBomb (optional), API-Sports imports, and/or SportMonks pipeline under configured request budgets. StatsBomb does **not** count toward API-Sports `maxApiRequests`.
- **`GET /admin/data-sync/jobs/:id`** — Job row plus **`syncJobStep`** checkpoints (`status`, `cursor`, `resultSummary`).

## SportMonks (direct adapter)

Admin endpoints under **`/sportmonks`** (JWT + **ADMIN**):

- **`GET /sportmonks/status`** — Whether `SPORTMONKS_API_TOKEN` is set.
- **`POST /sportmonks/sync/import/leagues`** — Import leagues + current seasons.
- **`POST /sportmonks/sync/standings`** — Standings for a local season (SportMonks season id in metadata).
- **`POST /sportmonks/sync/import/fixtures`** — Fixtures for a date window.
- **`POST /sportmonks/sync/fixture-details`** — Goals, cards, subs, lineups for one fixture.
- **`POST /sportmonks/sync/run`** — Full pipeline (leagues → standings → fixtures → details).

Set **`SPORTMONKS_API_TOKEN`** in `backend/.env`. Include a `sportmonks` block in **`POST /admin/data-sync/run`** to run the SportMonks step in the one-click job.

## Quotas and resume

- **API-Football (API-Sports)** is request-metered. Use a conservative **`maxApiRequests`** per run; the pipeline stops with job status **`partial`** when the budget is exhausted mid-step (e.g. partway through **`leagueApiIds`**).
- **Free tier:** expect **multiple runs**. Re-call **`POST /run`** with **`resumeJobId`** after a crash or **`partial`** completion so steps with cursors (players/fixtures) can continue. If the budget is fully consumed (`apiRequestsUsed` ≈ `maxApiRequests`), create a **new** job with a higher **`maxApiRequests`** or wait for the next quota window.
- **Paid tier:** raise **`maxApiRequests`** and optional per-step caps (`maxStandingsRequests`, `maxRequestsPerLeague`, etc.).

## HTTP timeouts vs BullMQ

- Long runs can exceed proxy timeouts. If **`REDIS_HOST`** is set, **`POST /run`** defaults to **`async: true`**: it enqueues a BullMQ job on the **`data-sync`** queue and returns **`syncJobId`** + **`bullJobId`**. Poll **`GET /jobs/:id`** for DB state.
- To force synchronous execution (e.g. local dev), set **`async: false`**.

## Swagger

Open **`DataSyncRunDto`** in Swagger for preset examples (single league vs tight window). Fixture import is also available as **`POST /api-sports/sync/import/fixtures`**.
