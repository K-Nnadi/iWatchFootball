# I Watch Football — Investor appendix & interview script

Companion to the codebase as of repo state when drafted. Sections label **FACT (repo)** vs **POSITIONING (founder narrative — fill in)**.

---

## Part A — One-page investor appendix

### FACT (verified in code)

| Area | Evidence |
|------|----------|
| **Clients** | Web: Vite + React + Mantine (`frontend/ui`). Mobile: Expo Router app (`mobile/`). Shared API types: `clients/` (OpenAPI / orval workflow). |
| **API runtime** | NestJS on **Fastify** (`libraries/base/bootstrap/generic.bootstrap.ts`). |
| **Persistence** | PostgreSQL + TypeORM; migrations under `backend/src/shared/migrations/`. |
| **Queues** | BullMQ registered when `REDIS_HOST` is set (`backend/src/app.module.ts`); used for news aggregation and data sync processors. |
| **Auth** | Email/username + bcrypt → JWT (`fast-jwt` sign, `passport-jwt` validate). Roles modeled as ADMIN / MODERATOR / USER; user `type` on entity. |
| **Primary ticketing** | `Ticket` ties to `Fixture`; checkout in `checkout.service.ts`; Stripe card flow via `PaymentSession` + native `POST /webhooks/stripe` (signature-verified). Legacy `POST /webhooks/payment` relay retired (410). |
| **Wallet projection** | `UserTicketLog` with `active` flag; upsert/deactivate inside same DB transactions as purchase/list/sale. |
| **Marketplace** | `MarketplaceListing`, `MarketplaceTransaction`, admin fee configurable via `PlatformConfigService`; pessimistic listing lock + `TicketHold` for reservation; cron expires stale ACTIVE listings hourly. |
| **Idempotency** | Primary: completed `paymentSession` + `payment.metadata.idempotencyKey` within 24h; atomic session fulfillment. Marketplace: similar on `marketplaceTransaction.metadata`. |
| **Refund scope** | `PrimaryOrderRefundService`: primary-market credit card / PayPal path; **explicitly excludes** Stripe money automation and **blocks** marketplace purchase refunds until reversal/payout logic exists (see service comment). |

### POSITIONING / GAPS TO DISCLOSE (not proven by schema alone)

- **Trust & safety for resale**: Fraud, chargebacks, and “real ticket vs screenshot” require process and often PSP/venue integrations beyond DB rows.
- **Payment webhook model**: Native Stripe signature verification on `/webhooks/stripe` with raw-body hook; reconciliation cron for missed deliveries. Marketplace card path still lacks PSP session parity.
- **Scale limits**: Marketplace search is SQL `QueryBuilder` with filters — fine for moderate load; dense catalog + ranking may warrant search infra later.
- **TicketHold misuse of `fixtureId` for marketplace**: Hold rows use `(fixtureId=listingId, offerKey=marketplace-listing-{id})` — works with unique index but is naming debt for reviewers.

Fill in externally: runway, incorporation, traction, geographic focus, ticketing supply relationships, differentiation vs incumbents.

---

## Part B — Mock interview script

### Elevator pitch (adapt)

**POSITIONING.** “Fans juggle fixtures, ticketing, resale, and club context across fragmented apps and DMs. I Watch Football anchors **matches, primary purchase, wallet, and resale** on one spine so discovery and ownership stay coherent.”

**FACT tie-in.** “We already model **fixture-linked tickets**, a **user wallet**, **marketplace transfer with fees**, and optional **psp completion** via webhook.”

---

### Q: Why will users leave incumbents?

**Answer skeleton.** Narrow the wedge | **POSITIONING**. Example wedges: resale + wallet UX; predictions/stats/news around your matches; loyalty + discounts. Claim only what ships: **FACT** resale + loyalty modules exist — depth varies by feature UI.

---

### Q: Marketplace — double sell / race?

**FACT.** `TicketHold` unique on `(fixtureId, offerKey)` for live rows; concurrent second buyer gets conflict. Listing purchase path uses pessimistic row lock before status → SOLD (`marketplaceCheckout.service.ts`).

**Follow-up you might hear:** “What if PSP confirms twice?” → **FACT** idempotency keys on payment / marketplace txn metadata within 24h window.

---

### Q: Ownership model?

**FACT.** Canonical `ticket` row with optional `userId`; `MarketplaceListing` references `ticketId`; `MarketplaceTransaction` records buyer payment and seller credit linkage; `userTicketLog` is wallet projection with `active`.

---

### Q: Paid but no ticket — debug checklist?

**FACT order.** PSP dashboard → relay logs hitting `POST /webhooks/payment` → DB `payment` by ref/idempotency key → `ticket` by `paymentId` → `user_ticket_log.active` → holds / soft-delete state → marketplace tables if resale.

---

### Q: Marketplace refund if seller flakes after payment?

**FACT.** Primary refund service **rejects** `metadata.type === 'marketplace_purchase'`. Honest reply: **“Marketplace reversal is roadmap; primary refund is partial ledger-only v1.”** Then describe intended design (escrow, Connect, clawback seller credit).

---

### Q: JWT vs sessions?

**FACT.** Stateless Bearer JWT validated by Passport strategy; bcrypt at login/register.

---

### Q: Roles?

**FACT.** Admin / moderator / user in security types; JWT carries `user.type`; some controllers check admin directly (e.g. marketplace config patch).

---

### Q: Scale — what breaks?

**FACT-based honesty.** Postgres transaction hot paths, connection pool saturation, webhook storms, absence of dedicated search tier for dense discovery SQL. Redis optional — if queues matter and Redis is singleton, worker throughput can pinch.

---

### Q: Monetization?

**FACT.** Marketplace seller ask price + configurable admin fee (buyer pays total = ask + fee).

**POSITIONING.** Add subscriptions, listing fees, or insights premium if roadmap — state explicitly.

---

### Q: Nest vs Express, Postgres vs Mongo, Vite vs Next?

**Suggested candid answer.**

- Nest: bounded contexts for football domain + checkout/marketplace; DI and modules at scale.
- Postgres: transactional guarantees and relational ticket/payment graphs.
- Vite SPA: aligns with Mantine client + codegen to API; SSR/SEO tradeoff consciously accepted unless you migrate.

---

### Hard follow-ups to rehearse

1. Prove **PSP parity**: idempotency, reconciliation job, payout holds.
2. Prove **trust**: dispute SLA, seller verification, rate limits — state built vs planned.
3. **Regulatory**: resale rules by jurisdiction — legal deck, not this doc.

---

*End.*
