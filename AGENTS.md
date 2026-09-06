# AGENTS.md

## Cursor Cloud specific instructions

Standard commands, ports, and env vars are documented in `README.md`. This section only
captures non-obvious, durable setup/run caveats for this VM.

### Toolchain (important)
- Use the VM's default **Node 22 + pnpm 10** (`node -v` → v22.x, `pnpm -v` → 10.x). The committed
  `pnpm-lock.yaml` is in **pnpm 10 format**, so `pnpm install` under pnpm 10 produces **no lockfile churn**.
- Do NOT switch to pnpm 9 — it rewrites ~15k lines of `pnpm-lock.yaml`. The `pnpm@9.7.1` pin in
  `backend/Dockerfile` is only for the production container build, not for local dev.
- `pnpm install` auto-builds the `base-tools` and `clients` workspace libraries via the `clients`
  package `prepare` script, so no separate lib build step is needed before running.
- pnpm 10 prints `Ignored build scripts: ... esbuild ... @swc/core ...` during install. This is
  **expected and harmless** — Vite uses the prebuilt platform binaries; the frontend builds and runs fine.

### Services (not auto-started — no systemd on this VM)
- **PostgreSQL is required** and must be started manually each session:
  `sudo pg_ctlcluster 16 main start` (cluster: version 16, `main`, port 5432).
  The `iwatchfootball` database + `postgres`/`postgres` role already exist and migrations are applied.
  Migrations also auto-run on backend boot (`MIGRATIONS_RUN=true` in root `.env`); to run manually:
  `cd backend && pnpm migration:run`.
- **Redis is OPTIONAL.** The root `.env` does not set `REDIS_HOST`, so the backend runs without it
  (in-memory rate limits, no BullMQ queues). Only start Redis if you set `REDIS_HOST`, via
  `sudo redis-server --daemonize yes --save "" --appendonly no`. When `REDIS_HOST` is set,
  `/health/ready` then requires Redis.
- If the `postgresql`/`redis-server` binaries are ever missing on a fresh VM:
  `sudo apt-get update && sudo apt-get install -y postgresql redis-server`.

### Running (dev mode)
- Backend: `pnpm run:backend` → NestJS/Fastify on **port 8080** (Swagger at `/api-docs`).
- Frontend: `pnpm run:frontend` → Vite dev server on **port 5173** (NOT 3000 — 3000 is only the
  nginx container port from `docker-compose`). Frontend CORS/`VITE_API_URL` expect the backend on 8080.

### Testing / lint gotchas
- `/health` and `/health/ready` require auth (global auth guard) and return **401 without a token** —
  this is expected, not a failure. Use public `GET /auth/security-questions` as a liveness check.
- `pnpm --filter ./frontend/ui lint` currently reports many **pre-existing** ESLint errors in the
  app source (unused imports, `no-explicit-any`). The lint tooling works; these are existing code
  issues, unrelated to environment setup.
- The backend has no lint script, and `pnpm --filter ./backend test` is a stub (`"No tests configured yet"`).
