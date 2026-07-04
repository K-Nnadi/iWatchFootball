# Phase 1 Ticketing Monetisation — I Watch Football

This document is a deep-dive companion to `[ticketing-system-design.md](./ticketing-system-design.md)`.

It covers the full monetisation strategy for Phase 1: official and approved ticket links,
hospitality referrals, matchday affiliates, sponsored placements, premium alerts, and analytics.

No resale marketplace features are designed here. Phase 1 is positioned as:

> **Trusted ticket discovery — not a resale marketplace.**

---

## Codebase Baseline (Phase 1 Relevant)

The following already exists and should be extended rather than rebuilt:


| Existing piece                                                        | Relevance                               |
| --------------------------------------------------------------------- | --------------------------------------- |
| `ticketLink` module + entity + admin page                             | Core affiliate link infrastructure      |
| `ticketLinkClick` table + `POST /ticket-link/:id/click`               | Click tracking already wired            |
| `TicketLinkButton`, `ExternalLinkModal`, `TicketLinkBadge`            | UI components built                     |
| `affiliate_links_enabled` platform config flag                        | Server-side tag appending already works |
| `userSubscription` + `TrackerEntitlementService`                      | Premium tier + entitlement checks       |
| `AdSlot` placeholder components (`rail-left`, `rail-right`, `banner`) | Ad placement hooks                      |
| `ads_enabled` platform config flag + `shouldShowAds()`                | Premium ad suppression                  |
| `commsPreference` entity (all channels)                               | Delivery preferences stored             |
| `userNotification` + `NotificationBell`                               | In-app notification delivery            |
| Premium page + Stripe Checkout + Subscriptions                        | Subscription flow complete              |


**Key gaps to fill:**

- `TicketLinkType` only covers `OFFICIAL_CLUB | COMPETITION | APPROVED_PARTNER | AFFILIATE` — needs hospitality, membership, exchange, and matchday categories
- Click data is stored but never aggregated or surfaced to admin
- Sponsored placement model does not exist (only generic ad placeholders)
- Premium alert types do not exist — no `NotificationType` for ticketing
- No email or push delivery pipeline
- Anonymous click tracking not supported (current endpoint requires auth)

---

## 1. Best Monetisation Strategy for Phase 1

Phase 1 monetisation should follow a **trust-first, revenue-second** sequence.
The platform has no traffic yet. The priority is to become the most useful discovery tool for
match-going fans, not to extract revenue from day one.

### Strategic position

```
Phase 1 = Trusted Ticket Discovery Hub
         + Matchday Planning Hub
         + Premium Fan Alerts
```

Every link on the platform must be:

- Safe (official club, official partner, or explicitly approved)
- Clearly labelled (Official / Partner / Sponsored)
- Non-committal (no availability promises, no payment processing)

This positioning earns user trust that the later marketplace phases will rely on.

### Revenue model stack (in order of maturity)


| Layer                     | What it is                                                   | When it pays                           |
| ------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| **Affiliate commission**  | Revenue share from approved partners per click or conversion | From day one (small)                   |
| **Hospitality referrals** | Higher-value affiliate leads to official hospitality         | From day one (higher AOV than tickets) |
| **Matchday affiliates**   | Commission on travel, hotels, parking, merchandise           | Once traffic grows                     |
| **Sponsored placements**  | Paid placement for trusted matchday partners                 | Once consistent traffic                |
| **Premium alerts**        | Subscription revenue (already exists) — ticket/sale alerts   | Once users rely on the product         |
| **Club/membership leads** | Qualified traffic to membership pages (CPA or flat fee)      | Partnership-dependent                  |


---

## 2. Revenue Streams to Prioritise First

### Priority 1: Hospitality referrals

**Why first:** Official club hospitality is almost always available (unlike standard tickets),
often under-marketed, and has a high order value (£100–£5,000+ per booking).
Hospitality packages typically offer generous affiliate commissions (5–15%).
Even low traffic can generate meaningful revenue.

**What to build:** A dedicated `HOSPITALITY` link type. For each match, show an
"Official Hospitality" CTA linking to the club's or a hospitality partner's enquiry/booking page.

**Partners to target first:**

- Club hospitality pages (direct affiliate or simple referral)
- Keith Prowse, Legends Hospitality, On The Ball (large hospitality aggregators)
- VIP Experience providers

---

### Priority 2: Official ticket affiliate links

**Why second:** Already partially built. Standard tickets have thin margins and most revenue
comes from volume of traffic. Focus on clubs/competitions that run affiliate programmes or
have approved partner schemes.

**Realistic targets:**

- Ticketmaster affiliate programme (Performance Horizon / Awin)
- StubHub — **only if club-authorised** for that competition
- SeatGeek — where officially used
- Club direct affiliate programmes where available
- UEFA / FIFA official ticket platforms

---

### Priority 3: Matchday travel affiliates

**Why third:** Match-going fans travel to every game. Travel is a reliable high-intent conversion.

**Partners:**

- Trainline affiliate programme (AWIN — very accessible)
- National Rail / Avanti / LNER direct
- National Express / Megabus (away day coaches)
- Ryanair / EasyJet (European away days)
- ParkVia / YourParkingSpace / JustPark (stadium parking)
- booking.com / Hotels.com (AWIN/Impact — easy to join)
- Premier Inn (near stadium)

These are entirely legitimate and in no way connected to ticket resale. Low risk.

---

### Priority 4: Premium ticket alerts

**Why fourth:** Once users rely on the match page ticket section, upsell them on alerts.
This turns one-time visitors into recurring premium subscribers.

Gate behind premium because the delivery infrastructure (email/push) has a cost.

---

### Priority 5: Sponsored placements

**Why last of Phase 1:** Needs traffic before partners will pay. Do not accept sponsors
until the team can credibly demonstrate user volumes. When ready, restrict to:

- Official club partners
- Stadium-adjacent businesses (car parks, pubs, fan zones)
- Kit/merchandise partners (club shop, Fanatics)
- Travel partners already in the affiliate stack

---

## 3. Revenue Streams to Avoid in Phase 1


| Stream                                        | Why to avoid                                                    |
| --------------------------------------------- | --------------------------------------------------------------- |
| Viagogo / unofficial resale                   | Brand risk, club hostility, potentially illegal in some markets |
| Random third-party ticket aggregators         | Trust risk; often scrape/inflate prices                         |
| Paid ticket listings from fans                | Phase 4 scope; too early and legally complex                    |
| Any link that "guarantees" availability       | Cannot be verified; creates liability                           |
| CPA deals with unverified hospitality brokers | Fraud risk; reputation damage                                   |
| User data sales / demand data sales           | GDPR risk; destroys trust                                       |
| Fake scarcity CTAs ("Only 3 left!")           | Brand integrity breach                                          |


The rule: **if the link would embarrass the platform if it went wrong, do not add it.**

---

## 4. Match Page Ticket Section Design

### Section structure

The match page ticket section should be a named, collapsible panel rendered below match info.
It replaces (or extends) the current basic "Buy Tickets" button.

```
┌─────────────────────────────────────────────────────┐
│  TICKETS & MATCHDAY                                 │
├─────────────────────────────────────────────────────┤
│  🎟  Official Tickets                               │
│      [Buy from Club]  [Official]                    │
│                                                     │
│  🏥  Away Fans                                      │
│      [Away ticket info]  [Official]                 │
│                                                     │
│  🥂  Official Hospitality                           │
│      [View packages]  [Official]                    │
│                                                     │
│  🪪  Membership Required?                           │
│      [Join membership]  Tickets on sale: TBC        │
│                                                     │
│  🔄  Official Ticket Exchange                       │
│      [Check exchange]  [Official]                   │
├─────────────────────────────────────────────────────┤
│  MATCHDAY PLANNING                          [Beta]  │
│                                                     │
│  🚂  Getting There                                  │
│      [Book train]  [Find parking]                   │
│                                                     │
│  🏨  Hotels Near Stadium                            │
│      [Find hotels]  [Partner]                       │
│                                                     │
│  👕  Club Shop                                      │
│      [Shop online]  [Partner]                       │
├─────────────────────────────────────────────────────┤
│  ⚠  Tickets are sold by the club, competition,     │
│     venue, or approved partner. I Watch Football    │
│     does not sell tickets or guarantee availability.│
└─────────────────────────────────────────────────────┘
```

### Link grouping

Links should be grouped by `linkCategory`, not just `linkType`:


| Category            | Types included                                                 | Shown when                                                     |
| ------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `TICKETS`           | `OFFICIAL_CLUB`, `COMPETITION`, `AWAY_FANS`, `TICKET_EXCHANGE` | Always (if links exist)                                        |
| `HOSPITALITY`       | `HOSPITALITY`, `HOSPITALITY_PARTNER`                           | If hospitality links exist                                     |
| `MEMBERSHIP`        | `MEMBERSHIP`                                                   | If membership link + sale info exists                          |
| `MATCHDAY_PLANNING` | `TRAVEL`, `PARKING`, `HOTEL`, `MERCHANDISE`, `STADIUM_TOUR`    | Gated by `matchday_affiliates_enabled` flag                    |
| `SPONSORED`         | `SPONSORED`                                                    | Gated by `sponsored_placements_enabled` flag; clearly labelled |


### Badge hierarchy

```
[Official]    → linkType is OFFICIAL_CLUB, COMPETITION, or AWAY_FANS and isVerifiedOfficial = true
[Hospitality] → linkType is HOSPITALITY
[Partner]     → linkType is APPROVED_PARTNER or HOSPITALITY_PARTNER
[Sponsored]   → isSponsored = true (always shown when sponsorship exists)
[Affiliate]   → isAffiliate = true and NOT official (subdued style; not shown if admin hides it)
```

### Membership info display

For matches where tickets require membership, show a static info card above the ticket links:

```
ℹ This match may require a club membership to purchase tickets.
  Season ticket holders: priority from [date if set]
  Members:               on sale from [date if set]
  General sale:          on sale from [date if set]
```

This content is admin-editable via the ticket link record's `saleInfo` JSON field.

---

## 5. Affiliate and Referral Tracking

### High-level flow

```
User clicks CTA on match page
    ↓
Frontend fires POST /ticket-link/:id/click (fire-and-forget, auth optional)
    ↓
Backend records click: ticketLinkId, userId (nullable), fixtureId, timestamp, source
    ↓
Backend constructs final URL with affiliate tag appended server-side
    ↓
Frontend receives finalUrl in the API response
    ↓
ExternalLinkModal shows destination domain + trust badge
    ↓
User confirms → window.open(finalUrl)
    ↓
Affiliate network tracks conversion independently
```

### Affiliate URL construction (already implemented — extend)

Current: tag appended as query param. Extend to support different tag formats per partner:


| Format       | Example                                   | Partners               |
| ------------ | ----------------------------------------- | ---------------------- |
| Query param  | `?aff=iwf_123`                            | Most networks          |
| Path segment | `/r/iwf`                                  | Some custom programmes |
| Sub-ID       | `?subid=iwf_fixtureid`                    | Awin, Impact           |
| Redirect URL | `https://track.partner.com/c/iwf?url=...` | CJ, Rakuten            |


Add a `affiliateUrlFormat` field to `TicketLink`: `QUERY_PARAM | PATH_SEGMENT | SUBID | REDIRECT_URL`.

The `TicketLinkService.buildFinalUrl()` method should handle each format.
The raw `affiliateTag` and `affiliateUrlFormat` must never be returned to the frontend.

### Click tracking improvements needed

Current gap: the click endpoint requires auth. Anonymous clicks are not recorded.

Fix: make `userId` truly optional in `ticketLinkClick`:

- If user is authed: record `userId`
- If not authed: record `null` for `userId` but still record `fixtureId`, `linkId`, `source`, `timestamp`

Add `source` field to click record: `WEB | MOBILE | API` — helps attribute mobile vs web traffic.

Add `fixtureId` denormalisation to `ticketLinkClick` (currently absent, needed for reporting).

### Revenue attribution

The platform cannot track conversions server-side without a partner postback URL.
Most affiliate networks provide postback/pixel support.

Build a `POST /affiliate/postback` endpoint:

- Receives conversion notification from affiliate network (query param or webhook)
- Validates signature / secret
- Records `affiliateConversion`: `ticketLinkId`, `userId` (if recoverable), `commissionAmount`, `orderId`, `network`
- No financial transactions on I Watch Football side — record only

Admin dashboard then shows estimated revenue per link/fixture/partner.

---

## 6. Admin Tools Needed

### 6.1 Ticket Links Manager (already partially exists at `/admin/ticket-links`)

Extend with:


| Addition                                    | Why                                                      |
| ------------------------------------------- | -------------------------------------------------------- |
| `linkCategory` selector                     | Group links correctly on match page                      |
| `isSponsored` toggle + `sponsorLabel` field | Sponsored placement labelling                            |
| `saleInfo` JSON editor                      | On-sale dates, membership requirements per match         |
| `affiliateUrlFormat` selector               | Support different tag injection formats                  |
| Bulk import (CSV)                           | Rapidly add links for a full season's fixtures           |
| Clone link to other fixtures                | e.g. copy Club hospitality link across all home fixtures |
| Link health check                           | Warn if URL returns non-200 (background job)             |


### 6.2 Click Analytics Dashboard (new)

The `ticketLinkClick` table has data; it is never aggregated or displayed.

Add an admin section:

```
Ticket Link Performance

[Date range] [Team filter] [Link type filter]

┌────────────────────────────────────────────────────────────┐
│ Link              │ Type         │ Clicks │ Unique │ CTR   │
├────────────────────────────────────────────────────────────┤
│ Arsenal - Buy Now │ OFFICIAL     │ 1,240  │  876   │ 3.2%  │
│ Arsenal - Hosp.   │ HOSPITALITY  │  420   │  380   │ 1.1%  │
│ Trainline - Travel│ TRAVEL       │  310   │  280   │ 0.8%  │
└────────────────────────────────────────────────────────────┘

Top fixtures by ticket clicks: ...
Top link types by clicks: ...
```

Backend endpoints needed:

```
GET /admin/ticket-link-analytics/summary     aggregate clicks by date range
GET /admin/ticket-link-analytics/by-link     per-link click breakdown
GET /admin/ticket-link-analytics/by-fixture  per-fixture click breakdown
GET /admin/ticket-link-analytics/conversions affiliate conversion records
```

### 6.3 Affiliate Partner Manager (new)

A simple registry of affiliate partners, separate from individual links:

```typescript
// AffiliatePartner entity
{
  id, name, network,           // e.g. "Trainline", "Awin"
  defaultAffiliateTag,         // applied when no link-level tag set
  affiliateUrlFormat,
  commissionRate,              // informational only (for admin tracking)
  isActive,
  notes
}
```

Admin CRUD at `/admin/affiliate-partners`. Links reference a `partnerId` (optional).

This avoids duplicating affiliate configuration across hundreds of individual links.

### 6.4 Sponsored Placement Manager (new)

Admin creates sponsored slots tied to a fixture, team, competition, or "global":

```typescript
// SponsoredPlacement entity
{
  id,
  linkId,           // references TicketLink with isSponsored = true
  fixtureId?,
  teamId?,
  competitionId?,
  isGlobal,         // show on all match pages
  startDate, endDate,
  impressionTarget?, // optional cap
  notes
}
```

Admin dashboard: list active placements, start/end, impression counts.

### 6.5 Premium Alert Configuration (new)

Admin configures which alert types are active per team or competition:

```
Alert: "Tickets on sale" for Arsenal home matches
  → Trigger: admin manually sets sale date on ticket link saleInfo
  → Audience: users with Arsenal as favourite team + alerts preference
  → Delivery: in-app + email (if commsPreference allows)
  → Gate: premium users only
```

Admin form: select team/competition → set sale date → preview affected users → send or schedule.

---

## 7. Analytics to Track

### 7.1 Click analytics (extend existing)


| Event                  | Currently tracked      | Gap                                             |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| Ticket link click      | Yes (authed only)      | Anonymous + `source` field + `fixtureId` denorm |
| Modal open             | No                     | Add frontend event                              |
| Modal "Continue" click | Yes (implied by click) | —                                               |
| Modal "Cancel" click   | No                     | Track abandonment                               |
| Link type breakdown    | No reporting           | Admin endpoint needed                           |


### 7.2 Conversion analytics (new)


| Event                       | How                                    |
| --------------------------- | -------------------------------------- |
| Affiliate postback received | `/affiliate/postback` endpoint         |
| Estimated commission        | Stored in `affiliateConversion`        |
| Revenue per fixture         | Aggregated in admin analytics          |
| Revenue per link type       | `HOSPITALITY` vs `TRAVEL` vs `TICKETS` |


### 7.3 Demand signals (feed into Phase 3)


| Signal                                    | Source                                      |
| ----------------------------------------- | ------------------------------------------- |
| Ticket section views per fixture          | Frontend page-view event                    |
| "Looking for ticket" count                | Phase 3 entity (build now, show in Phase 3) |
| Favourite team → ticket click correlation | Join `userFavouriteTeam` + click data       |
| Mobile vs web ticket clicks               | `source` field on click record              |


### 7.4 Premium funnel analytics


| Step                                           | Event                              |
| ---------------------------------------------- | ---------------------------------- |
| Ticket alert CTA seen                          | Impression event                   |
| "Upgrade to Premium" clicked from alert prompt | Funnel event                       |
| Premium subscription started                   | Already tracked via Stripe webhook |
| Alert sent to premium user                     | Notification record                |
| Alert → ticket click                           | Attribution if possible            |


### 7.5 What NOT to track in Phase 1

- Do not track individual user journeys on external sites (no cross-site cookies)
- Do not expose individual user click history to admin (aggregate only)
- Do not sell or share demand data externally in Phase 1

---

## 8. Disclaimers and Trust Messaging

### 8.1 Match page disclaimer (always visible in ticket section)

> Tickets are sold by the club, competition, venue, or approved partner.
> I Watch Football does not sell tickets, process payments, or guarantee availability.
> Always verify you are purchasing from an official source.

This should appear as a subdued footer within the Tickets panel — not a blocking modal.
Short version for mobile: "Sold externally. We don't guarantee availability."

### 8.2 External link warning (ExternalLinkModal — already exists, extend)

Current: "You are leaving I Watch Football."

Add:

- Show destination domain name prominently: "You are going to: **ticketing.arsenal.com**"
- Trust badge for the link type
- One-sentence description of what the destination is: "Arsenal Football Club's official ticketing website"
- "Continue" and "Cancel" buttons
- Soft checkbox: "Don't show this again" (suppress modal for 30 days per user preference)

### 8.3 Sponsored content labelling

Any sponsored placement must include a visible label:

- "Sponsored" — small badge, consistent style
- Must appear on the link card and inside the ExternalLinkModal
- Never styled to look like an editorial recommendation
- Platform advertising policy linked from footer

### 8.4 Affiliate disclosure

For affiliate links, add a small info tooltip or footer line:

> "Some links earn I Watch Football a small commission at no extra cost to you."

This is required by UK ASA/CAP rules and US FTC guidelines.
Should be visible on the match page near the ticket section, not hidden in T&Cs.

### 8.5 Trust badge definitions (for users)

Add a "What do these badges mean?" tooltip or help link near the ticket section:


| Badge     | Meaning shown to user                                     |
| --------- | --------------------------------------------------------- |
| Official  | Sold directly by the club, competition, or official venue |
| Partner   | An approved ticketing or hospitality partner              |
| Sponsored | A paid placement by a trusted partner                     |
| Exchange  | Official club or competition ticket exchange programme    |


Never use the word "Official" for a link that has not been verified.

---

## 9. Free vs Premium Split

### Free tier (all users)

- View all official ticket links on match pages
- View hospitality CTAs
- View matchday planning links (travel, hotels, parking)
- View membership information
- Basic "I'm going" attendance tracking (Phase 2)
- Standard affiliate links included

### Premium tier — ticketing additions


| Feature                                         | Why premium                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Ticket on-sale alerts**                       | Email/push delivery has a cost; high intent feature                                  |
| **Sold-out match alerts**                       | "We'll tell you if tickets come back" — strong retention hook                        |
| **Official exchange alerts**                    | Alert when the club re-opens their exchange                                          |
| **Match reminder with ticket section**          | Notification 48h before kickoff: "Your match is tomorrow — tickets still available?" |
| **Away day planner**                            | Curated matchday planning tool with personalised links                               |
| **Calendar sync**                               | Export attending matches to Google/Apple calendar                                    |
| **Price drop alerts** (if supported by partner) | Only where affiliate partners expose price data                                      |


### Upsell placement

- Within the ticket section: if user is free, show a subdued "Get ticket alerts" CTA
- Click → opens premium upgrade modal with ticketing benefits listed
- Do not block the free experience to force upgrades — only add, never remove

### Premium pricing (existing)

- Monthly: existing `stripe_premium_monthly_price_id` already set up
- Consider adding an annual plan (`stripe_premium_annual_price_id`) as a new platform config key
- No new pricing tiers needed for Phase 1

---

## 10. Suggested Implementation Order

### Sprint 1: Extend the link model (foundation)

1. Add `linkCategory` enum: `TICKETS | HOSPITALITY | MEMBERSHIP | MATCHDAY_PLANNING | SPONSORED`
2. Add `isSponsored`, `sponsorLabel` fields to `TicketLink` entity (migration)
3. Extend `TicketLinkType` enum: add `AWAY_FANS`, `TICKET_EXCHANGE`, `HOSPITALITY`, `HOSPITALITY_PARTNER`, `MEMBERSHIP`, `TRAVEL`, `PARKING`, `HOTEL`, `MERCHANDISE`, `STADIUM_TOUR`
4. Add `affiliateUrlFormat` enum + `buildFinalUrl()` logic
5. Add `saleInfo` JSON field for on-sale dates and membership requirements
6. Add `matchday_affiliates_enabled` + `hospitality_links_enabled` + `sponsored_placements_enabled` platform config flags
7. Migration + update admin form

### Sprint 2: Improve click tracking

1. Make `userId` truly optional in `ticketLinkClick` (allow anonymous)
2. Add `source` (WEB/MOBILE) + `fixtureId` denorm to `ticketLinkClick`
3. Add `POST /affiliate/postback` endpoint for conversion callbacks
4. Add `affiliateConversion` entity

### Sprint 3: Admin analytics

1. Add `GET /admin/ticket-link-analytics/summary` + `by-link` + `by-fixture` endpoints
2. Build analytics widget in admin dashboard
3. Add `AffiliatePartner` entity + admin CRUD at `/admin/affiliate-partners`

### Sprint 4: Match page UI overhaul

1. Redesign ticket section into grouped `linkCategory` panels
2. Add hospitality CTA group
3. Add matchday planning group (gated by `matchday_affiliates_enabled`)
4. Add membership info card with `saleInfo` display
5. Update `ExternalLinkModal` with domain display, suppress-for-30-days preference
6. Add affiliate disclosure footnote

### Sprint 5: Premium alerts foundation

1. Extend `NotificationType` enum: add `TICKET_ON_SALE`, `TICKET_SOLD_OUT`, `TICKET_EXCHANGE_OPEN`, `MATCH_REMINDER`
2. Build `TicketAlertService`:
  - `createTicketOnSaleAlert(fixtureId, saleDate)` — admin triggers
    - `sendToFavouriteTeamFollowers(teamId, alertType)` — fan-out to premium users
    - Premium check via `TrackerEntitlementService.hasPremium()`
    - Comms preference check via `commsPreference.inAppNotifications`
3. Deliver via existing in-app `NotificationService` (no email needed in Sprint 5)
4. Add premium upsell CTA in ticket section for free users

### Sprint 6: Email and push delivery

1. Integrate a transactional email provider (Resend, SendGrid, or Postmark)
2. Build `EmailDispatchService.send()` — respects `commsPreference.emailNotifications`
3. Wire `TicketAlertService` to dispatch email for `IMMEDIATE` / `DAILY` preferences
4. Push notifications deferred to mobile phase

### Sprint 7: Sponsored placements

1. `SponsoredPlacement` entity + admin CRUD
2. `GET /ticket-link/sponsored?fixtureId=` public endpoint
3. Render sponsored slot in match page ticket section
4. Impression tracking (fire-and-forget, same pattern as click)

---

## 11. Risks and Edge Cases

### Affiliate programme risks


| Risk                                                 | Mitigation                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Affiliate network rejects application                | Apply early; maintain alternatives (direct links without tracking)       |
| Club removes affiliate programme                     | Graceful fallback to untracked direct link                               |
| Affiliate link breaks / redirects to wrong page      | Link health check job (HTTP 200 check nightly); admin alert on failure   |
| Duplicate tags on URL (URL already has query params) | `buildFinalUrl()` must handle existing query strings correctly           |
| Affiliate tag exposed in page source                 | Never return `affiliateTag` in API responses; build URL server-side only |


### Trust and brand risks


| Risk                                                | Mitigation                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Club objects to affiliate link using their branding | Use neutral label ("Buy tickets") rather than club logo; remove on request     |
| Sponsored content mistaken for editorial            | Mandatory "Sponsored" badge; platform advertising policy page                  |
| Link goes to a phishing or low-quality site         | Admin-only link creation; URL validation (HTTPS); whitelist partner domains    |
| Price shown externally is different to expectation  | Never show prices — only CTAs; let external site set expectations              |
| Club prohibits third-party ticket links             | `enforceClubRules` check in Phase 7; for now, note in `TicketLink.notes` field |


### Premium alert risks


| Risk                                                 | Mitigation                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Alert sent for wrong fixture                         | Admin confirmation step before broadcast; preview affected user count              |
| Alert for a match where tickets are already sold out | Only trigger on-sale alerts for confirmed sale dates; add `saleStatus` field       |
| User unsubscribes from emails                        | Always respect `commsPreference`; unsubscribe link in every email                  |
| Alert fire-and-forget fails silently                 | BullMQ job with retry logic; dead letter queue for failed sends                    |
| Premium user count is 0 at launch                    | Alerts work anyway; just sends to zero users; still valuable once subscribers grow |


### Click tracking edge cases


| Edge case                          | Handling                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| Bot traffic inflating click counts | Rate limit `POST /ticket-link/:id/click`; agent detection; exclude obvious bots from reporting |
| User clicks same link many times   | Deduplicate in reporting (unique clicks per `userId + linkId + day`)                           |
| Anonymous user with no `userId`    | Record click with `userId: null`; exclude from per-user reporting                              |
| Mobile app not yet wired           | `source: MOBILE` reserved for when mobile is wired; falls back to `WEB`                        |


### Sale info risks


| Risk                                       | Mitigation                                                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Sale date shown is wrong (club changes it) | Add `saleInfoSource: string` field noting "Official club website, checked [date]"; admin must verify before publishing |
| Membership requirement wrong               | Same — `saleInfo` is manually maintained; disclaimer: "Check club website to confirm"                                  |


---

## 12. Evolution Into Phase 2 and Phase 3 Monetisation

### Phase 2 monetisation additions

When attendance tracking launches, Phase 1 links become more valuable:

- **Match page context:** user who clicked "Buy Tickets" but never marked attendance → retarget with "Still going?" prompt → drives premium conversion
- **Attendance streak premium feature:** "Attend 10 matches — Premium discount" — retention + revenue
- **Verified attendance badge:** premium users who buy via an affiliate link and later verify attendance get a badge — incentivises both affiliate clicks and premium

New revenue stream: **Ticket document storage**

- Storing private ticket PDFs requires cloud storage cost → natural justification for premium tier

### Phase 3 monetisation additions

When demand tracking launches, monetisation becomes data-driven:

- **Sell aggregated demand reports to clubs** (privacy-safe, aggregated only) — clubs pay for "X% of your fans on our platform are looking for tickets to this match"
- **Sponsored "demand alert"** — when resale partner's tickets become available, notify interested users → partner pays per click or per conversion
- **Demand-weighted link priority** — links for high-demand fixtures move to top automatically

New revenue stream: **Demand-driven hospitality upsell**

- "Tickets are sold out. Official hospitality is still available." → high-intent conversion moment for hospitality affiliate

### Phase 4 monetisation bridge

When marketplace launches:

- Phase 1 affiliate links stay live as a fallback ("Can't find tickets? Try official links first")
- Phase 1 demand data becomes the audience for Phase 3 notification → Phase 4 resale browse
- Phase 1 affiliate revenue is expected to decline as in-house marketplace grows — that is healthy; the marketplace generates more margin

---

## Data Model Additions Summary

The following additions are needed to the existing `TicketLink` entity (no new entity for the link model itself):

```typescript
// Additions to TicketLink entity
linkCategory: TicketLinkCategory;    // TICKETS | HOSPITALITY | MEMBERSHIP | MATCHDAY_PLANNING | SPONSORED
affiliateUrlFormat: AffiliateUrlFormat; // QUERY_PARAM | PATH_SEGMENT | SUBID | REDIRECT_URL
isSponsored: boolean;               // default false
sponsorLabel?: string;              // "Sponsored by [Partner]"
saleInfo?: {                        // JSON — on-sale dates, membership requirements
  membersSaleDate?: Date;
  generalSaleDate?: Date;
  requiresMembership?: boolean;
  membershipName?: string;
  awayFanProcess?: string;
  notes?: string;
  lastVerified?: Date;
};
partnerId?: number;                 // FK to AffiliatePartner (new entity)
```

New entities needed:

```typescript
// AffiliatePartner
{ id, name, network, defaultAffiliateTag, affiliateUrlFormat, commissionRate, isActive, notes }

// AffiliateConversion
{ id, ticketLinkId, userId?, commissionAmount, orderId, network, receivedAt }

// SponsoredPlacement
{ id, linkId, fixtureId?, teamId?, competitionId?, isGlobal, startDate, endDate, notes }
```

Additions to `ticketLinkClick`:

```typescript
source: 'WEB' | 'MOBILE';   // new field
fixtureId?: string;          // denormalised for faster aggregation
// userId already exists but becomes truly optional
```

---

## New Platform Config Keys


| Key                              | Type    | Default | Purpose                                            |
| -------------------------------- | ------- | ------- | -------------------------------------------------- |
| `hospitality_links_enabled`      | boolean | `false` | Phase 1 — hospitality section on match page        |
| `matchday_affiliates_enabled`    | boolean | `false` | Phase 1 — travel/hotels/parking section            |
| `sponsored_placements_enabled`   | boolean | `false` | Phase 1 — paid placements section                  |
| `ticket_alerts_enabled`          | boolean | `false` | Phase 1 premium — ticket on-sale / sold-out alerts |
| `affiliate_disclosure_enabled`   | boolean | `true`  | Phase 1 — show affiliate disclosure footnote       |
| `stripe_premium_annual_price_id` | string  | `''`    | Premium annual plan (extend existing billing)      |


