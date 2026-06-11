# Stripe ticket checkout (Phase 1)

Primary ticket checkout uses **Stripe Checkout Sessions** (`ui_mode: custom`) with the embedded **Payment Element**. Platform credit checkout is unchanged.

## Credentials

Store in the `integration` row with slug `stripe-primary` (`config` JSON), or use env vars:

| Key / variable | Purpose |
|----------------|---------|
| `secretKey` / `STRIPE_SECRET_KEY` | Server-side API |
| `publishableKey` / `STRIPE_PUBLISHABLE_KEY` | Payment Element |
| `webhookSecret` / `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `premiumMonthlyPriceId` | Premium subscription price (separate flow) |

Example `integration.config`:

```json
{
  "secretKey": "sk_test_...",
  "publishableKey": "pk_test_...",
  "webhookSecret": "whsec_...",
  "premiumMonthlyPriceId": "price_..."
}
```

## Payment processor seed

Migration `1767300000000-SeedStripePaymentProcessor` inserts a `paymentProcessor` row for Stripe (`slug: stripe`, `type: CARD`). No API key is stored on this row — credentials live in `integration.config`. PayPal remains disabled in Phase 1.

## Local webhooks (Stripe CLI)

Stripe CLI is installed via:

```powershell
winget install Stripe.StripeCli --source winget
```

### One-time: link CLI to your Stripe account

Either add test keys to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
```

Or run `stripe login` in a terminal (browser auth).

### Get the webhook secret

From repo root:

```bash
pnpm run:stripe-webhook-secret
```

Copy the `whsec_...` line into `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart the backend — `StripeConfigBootstrap` copies env vars into `integration.config` on boot.

### Forward webhooks while developing

Terminal 1 — backend:

```bash
pnpm run:backend
```

Terminal 2 — webhook forwarder (leave running):

```bash
pnpm run:stripe-webhook
```

Complete Premium checkout with test card `4242 4242 4242 4242`. The CLI shows events forwarded to `http://localhost:8080/webhooks/stripe`.

## Webhooks (Dashboard — production)

Register in Stripe Dashboard (test mode first):

- **URL:** `{API_URL}/webhooks/stripe`
- **Events:** `checkout.session.completed`, `checkout.session.expired`, plus subscription events for premium

Local forwarding:

```bash
stripe listen --forward-to localhost:8080/webhooks/stripe
```

Use the CLI `whsec_...` signing secret as `webhookSecret` when testing locally.

The webhook route uses a Fastify `preParsing` hook (in `generic.bootstrap.ts`) to capture the raw body for signature verification — no extra plugin required.

## API flow

1. `GET /payments/providers` — public list (includes Stripe `publishableKey` when configured)
2. `POST /payments/sessions` — authenticated; validates ticket hold, computes amount server-side, creates Stripe session
3. Frontend confirms via Stripe.js (`actions.confirm()`)
4. Stripe webhook → `PaymentFulfillmentService` → `CheckoutService.confirmPurchase`
5. `GET /payments/sessions/:id` — poll until `status: COMPLETED`

Direct `POST /checkout/confirm` with `CreditCard` / `PayPal` is **rejected** unless tied to a verified payment session (webhook path only). `PlatformCredit` still uses direct confirm.

## Cloud Run / CI

Add `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` to Secret Manager and wire them in the deploy workflow (same pattern as `JWT_SECRET`).

## Manual test

1. Run migrations (`paymentSession` + Stripe processor seed)
2. `stripe listen --forward-to localhost:8080/webhooks/stripe`
3. Checkout with test card `4242 4242 4242 4242`
4. Replay webhook — tickets must not duplicate (idempotent via completed `paymentSession` + `payment.metadata.idempotencyKey`)

## Webhook fulfillment

- Replay safety: completed `paymentSession` short-circuits; payment-level idempotency key within 24h.
- Primary fulfillment runs in a **single DB transaction**: lock `paymentSession` → validate `payment_status` and amount → `confirmPurchase` → mark session `COMPLETED` with `paymentId` / `fulfilledAt`.
- Validation failures (wrong amount, not paid) set session `FAILED` and ack the webhook (no infinite Stripe retries).
- Transient errors return **500** so Stripe retries.

## Reconciliation (missed webhooks)

When `PAYMENT_RECONCILIATION_ENABLED` is not `false` (default on), a cron every 15 minutes:

1. Finds stale `PENDING` (past expiry + grace) or `EXPIRED` sessions with `providerSessionId`
2. Retrieves the Stripe Checkout Session
3. Fulfills if `payment_status === paid`

Env:

```env
PAYMENT_RECONCILIATION_ENABLED=true
PAYMENT_RECONCILIATION_GRACE_MS=120000
```

## Legacy relay (retired)

`POST /webhooks/payment` (shared-secret relay) returns **410 Gone** unless `LEGACY_PAYMENT_WEBHOOK_ENABLED=true`. Card checkout requires `POST /webhooks/stripe`.
