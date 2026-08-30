---

name: Ticketing System Design
overview: Design and implement the I Watch Football ticketing system across 7 phases — from simple external ticket links through to official club API integrations — building on the existing NestJS/Fastify backend, React web frontend, and Expo mobile app.
todos:

- id: phase1-backend
content: "Phase 1: Create ticket-link module (entity, service, controller, DTOs), public query endpoint, click tracking, admin CRUD"
status: completed
- id: phase1-frontend
content: "Phase 1: Build TicketLinkButton, ExternalLinkModal, TicketLinkBadge components; wire into match.page.tsx and team.page.tsx"
status: completed
- id: phase1-admin
content: "Phase 1: Add ticket links admin table to admin dashboard"
status: completed
- id: phase2-backend
content: "Phase 2: Create attendance module (upsert, aggregate count), private document upload with signed URL retrieval"
status: pending
- id: phase2-frontend
content: "Phase 2: Build ImGoingButton, AttendanceModal, AttendanceHistoryPage, TicketUploadPanel, AttendanceCount components"
status: pending
- id: phase3-backend
content: "Phase 3: Create ticket-interest module (CRUD, demand aggregation, bulk notification trigger), auto-cancel on attendance creation"
status: pending
- id: phase3-frontend
content: "Phase 3: Build LookingForTicketCTA, TicketInterestForm, DemandCounter, MyInterestsPage"
status: pending
- id: phase4-backend
content: "Phase 4: Extend marketplace with state machine, proof upload, admin approve/reject, transfer confirmation, dispute, auto-release BullMQ job"
status: pending
- id: phase4-frontend
content: "Phase 4: Build BuyerDashboardPage, DisputeButton, TransferConfirmationScreen, AdminListingReviewQueue; extend SellerDashboardPage"
status: pending
- id: phase5-backend
content: "Phase 5: Stripe Connect seller onboarding, FeeService, EscrowService, release/refund endpoints, Rating module, TrustScoreService"
status: pending
- id: phase5-frontend
content: "Phase 5: SellerOnboarding page, CheckoutPage fee breakdown, SellerPayoutEstimate, TrustBadge, RatingsPanel, RefundDisputeUI"
status: pending
- id: phase6-backend
content: "Phase 6: Encrypted buyer transfer details, masked seller view, transfer initiation + BullMQ escalation timer, club transfer guide module"
status: pending
- id: phase6-frontend
content: "Phase 6: TransferChecklist, BuyerTransferDetailsForm, TransferStatusTracker components"
status: pending
- id: phase7-backend
content: "Phase 7: TicketingProviderAdapter interface, availability sync job, official-inventory endpoint, ticket validation, club ticket rules enforcement"
status: pending
- id: phase7-frontend
content: "Phase 7: OfficialTicketInventory component, VerifiedTicketBadge, ClubTicketRules, integration health admin dashboard"
status: pending
isProject: false

---

# I Watch Football — Ticketing System Design

## Codebase Baseline

The platform already has significant ticketing infrastructure. Each phase maps against this:


| Existing                                    | Phase relevance        |
| ------------------------------------------- | ---------------------- |
| `Ticket` entity + CRUD + checkout flow      | Phase 2/4/5 foundation |
| `MarketplaceListing` + marketplace checkout | Phase 4/5 foundation   |
| `TicketHold` reservation system             | Phase 4/5              |
| `UserTicketLog` wallet projection           | Phase 2                |
| `Log` entity (attendance tracker)           | Phase 2                |
| Stripe integration + webhooks               | Phase 5                |
| Seats.io seatmap UI                         | Phase 2/4              |
| Admin dashboard + `RequireAdmin` guard      | All phases             |


**Gaps:** No external ticket link concept (Phase 1), no demand/interest entity (Phase 3), no club transfer workflow (Phase 6), no official partner API layer (Phase 7).

---

## Platform Config / Feature Flags

Each phase is independently gated by a boolean `platformConfig` key so features can be enabled selectively. The existing pattern is:

1. Seed a row in `platformConfig` (migration)
2. Add a constants file + domain service with `isEnabled()` / `assertEnabled()`
3. Expose the flag on `GET /platform-config/features` in `platformConfig.controller.ts`
4. Frontend: add to `PlatformFeatures` interface → Zustand store → route wrapper or component check
5. Add key to `FEATURE_FLAG_KEYS` in `PlatformConfigSection.tsx` so admin saves refresh the store

### New flags by phase


| Key                              | Type    | Default | Controls                                                                   |
| -------------------------------- | ------- | ------- | -------------------------------------------------------------------------- |
| `ticket_links_enabled`           | boolean | `false` | Phase 1 — external ticket link CTAs                                        |
| `affiliate_links_enabled`        | boolean | `false` | Phase 1 — affiliate URL tracking                                           |
| `attendance_tracking_enabled`    | boolean | `false` | Phase 2 — "I'm going" / ticket ownership                                   |
| `ticket_document_upload_enabled` | boolean | `false` | Phase 2 — private ticket proof upload                                      |
| `ticket_demand_enabled`          | boolean | `false` | Phase 3 — "Looking for a ticket" demand tracking                           |
| `marketplace_enabled`            | boolean | `false` | Phase 4/5 — **already exists**; fan-to-fan resale                          |
| `marketplace_seller_fee_rate`    | number  | `0.05`  | Phase 5 — seller-side fee (buyer fee uses existing `marketplace_fee_rate`) |
| `club_transfer_enabled`          | boolean | `false` | Phase 6 — guided club app transfer flow                                    |
| `official_inventory_enabled`     | boolean | `false` | Phase 7 — official club/provider ticket inventory                          |


### Important defaults

All new flags default to `false` — features are **opt-in**, not opt-out. The admin toggles each on when the team is ready to launch that capability.

### Frontend route wrappers needed (new)


| Wrapper                          | Flag                          | Routes guarded                                      |
| -------------------------------- | ----------------------------- | --------------------------------------------------- |
| `TicketLinksFeatureRoute`        | `ticket_links_enabled`        | Ticket link CTAs (component-level, not full routes) |
| `AttendanceTrackingFeatureRoute` | `attendance_tracking_enabled` | `/attendance`                                       |
| `TicketDemandFeatureRoute`       | `ticket_demand_enabled`       | `/ticket-interests`                                 |
| `ClubTransferFeatureRoute`       | `club_transfer_enabled`       | Transfer checklist screens                          |
| `OfficialInventoryFeatureRoute`  | `official_inventory_enabled`  | Official inventory tab on match page                |


### Backend guard pattern

Each phase introduces a `*FeatureService` following the existing `MarketplaceFeatureService` pattern:

```typescript
// Example: ticket-links.feature.service.ts
@Injectable()
export class TicketLinksFeatureService {
  constructor(private readonly platformConfig: PlatformConfigService) {}
  async isEnabled() { return this.platformConfig.getBoolean(TICKET_LINKS_ENABLED_KEY, false); }
  async assertEnabled() {
    if (!(await this.isEnabled())) throw new ServiceUnavailableException('Ticket links are not enabled');
  }
}
```

Applied as a guard or called at the top of controller methods — identical to `MarketplaceEnabledGuard`.

---

## Phase 1: Official Ticket Links

> Full monetisation strategy, match page design, affiliate tracking, analytics, trust messaging,
> and free/premium split are documented in the companion file:
> `**[phase-1-ticketing-monetisation.md](./phase-1-ticketing-monetisation.md)**`

### Product Goal

Surface a trusted ticket discovery section on match and club pages that directs users to
official or approved external sites. I Watch Football earns through affiliate commissions,
hospitality referrals, matchday travel affiliates, sponsored placements, and premium ticket alerts.
The platform never touches a ticket, payment, or availability promise.

### User Flow

```
Match page → Tickets & Matchday panel:
  ├─ Official Tickets group   (OFFICIAL_CLUB, COMPETITION, AWAY_FANS, TICKET_EXCHANGE links)
  ├─ Hospitality group        (HOSPITALITY, HOSPITALITY_PARTNER links)
  ├─ Membership info card     (saleInfo: on-sale dates, membership requirements)
  └─ Matchday Planning group  (TRAVEL, PARKING, HOTEL, MERCHANDISE links)

Any CTA → ExternalLinkModal (domain + badge + disclaimer) → user confirms → external site
```

### Frontend Pages / Components

- `**TicketsMatchdayPanel**` — full grouped ticket section; replaces basic `TicketLinkButton`
- `**TicketLinkGroup**` — renders one `linkCategory` group (Tickets / Hospitality / Matchday Planning)
- `**TicketLinkCard**` — individual link row with badge, label, and CTA button
- `**MembershipInfoCard**` — on-sale dates + membership requirement display (from `saleInfo`)
- `**ExternalLinkModal**` — extended: shows domain, badge, "don't show again" checkbox
- `**TicketAlertUpsell**` — free-user upsell CTA within the ticket panel ("Get ticket alerts — Premium")
- `**AffiliateDisclosure**` — small footnote in panel ("Some links earn us a small commission")
- No new page needed for Phase 1 core; components slot into `match.page.tsx` and `team.page.tsx`

### Backend Responsibilities

- CRUD for `TicketLink` entity (new module `ticket-link`)
- `TicketLinkService.getForFixture(fixtureId)` — returns grouped links sorted by `linkCategory` then `priority`
- `TicketLinkService.buildFinalUrl(link)` — constructs affiliate URL server-side per `affiliateUrlFormat`
- Public read endpoint scoped to `fixtureId`, `teamId`, or `competitionId`
- Admin-only create/update/delete
- Click tracking: `POST /ticket-link/:id/click` (auth optional; records `userId`, `source`, `fixtureId`)
- Affiliate conversion postback: `POST /affiliate/postback`
- Link health check: nightly job validates all active links return HTTP 200

### API Endpoints

```
POST   /ticket-link                        (admin) create link
GET    /ticket-link/query                  (public) filter by fixtureId, teamId, competitionId
GET    /ticket-link/:id                    (public)
PATCH  /ticket-link/:id                    (admin) update
DELETE /ticket-link/:id                    (admin) delete
POST   /ticket-link/:id/click              (public, auth optional) record click
POST   /affiliate/postback                 (internal) conversion callback from affiliate network
GET    /admin/ticket-link-analytics/summary       (admin) aggregate click stats
GET    /admin/ticket-link-analytics/by-link       (admin) per-link breakdown
GET    /admin/ticket-link-analytics/by-fixture    (admin) per-fixture breakdown
GET    /admin/ticket-link-analytics/conversions   (admin) affiliate conversion records
```

### DTOs

```typescript
// CreateTicketLinkDTO
{
  fixtureId?: string;
  teamId?: string;
  competitionId?: string;
  url: string;                         // HTTPS only
  label: string;                       // "Buy Official Tickets"
  linkType: TicketLinkType;
  // OFFICIAL_CLUB | COMPETITION | AWAY_FANS | TICKET_EXCHANGE
  // | HOSPITALITY | HOSPITALITY_PARTNER | MEMBERSHIP
  // | TRAVEL | PARKING | HOTEL | MERCHANDISE | STADIUM_TOUR
  // | APPROVED_PARTNER | AFFILIATE | SPONSORED
  linkCategory: TicketLinkCategory;    // TICKETS | HOSPITALITY | MEMBERSHIP | MATCHDAY_PLANNING | SPONSORED
  isAffiliate: boolean;
  affiliateTag?: string;               // server-side only, never returned
  affiliateUrlFormat?: AffiliateUrlFormat; // QUERY_PARAM | PATH_SEGMENT | SUBID | REDIRECT_URL
  partnerId?: number;                  // FK to AffiliatePartner
  isSponsored: boolean;
  sponsorLabel?: string;               // "Sponsored by Partner Name"
  badgeText?: string;
  priority: number;
  expiresAt?: Date;
  saleInfo?: {                         // on-sale dates + membership info (JSON)
    membersSaleDate?: Date;
    generalSaleDate?: Date;
    requiresMembership?: boolean;
    membershipName?: string;
    awayFanProcess?: string;
    notes?: string;
    lastVerified?: Date;
  };
}

// TicketLinkResponseDTO (never exposes affiliateTag or affiliateUrlFormat)
{
  id, fixtureId, teamId, competitionId,
  finalUrl,        // built server-side with affiliate tag applied
  label, linkType, linkCategory,
  isAffiliate, isSponsored, sponsorLabel,
  badgeText, priority, expiresAt, saleInfo
}

// AffiliatePostbackDTO
{
  network: string;
  orderId: string;
  commissionAmount: number;
  subId?: string;  // used to correlate back to ticketLinkId
  signature: string;
}
```

### Service-Layer Logic

- `getForFixture(fixtureId)` — collects own links + team home links + competition links; groups by `linkCategory`; sorts by `priority`; filters expired
- `buildFinalUrl(link)` — constructs affiliate URL per `affiliateUrlFormat`; must handle existing query strings on base URL; never leaks raw tag
- `recordClick(linkId, userId?, source, fixtureId?)` — upserts click record; rate-limited; bots filtered
- `receivePostback(dto)` — validates signature, records `AffiliateConversion`
- Nightly `TicketLinkHealthJob` — HTTP HEAD check on all active links; marks `isHealthy = false` on non-200; alerts admin

### Security

- `@Public()` on GET and click endpoints
- Admin role required for all write operations
- `affiliateTag` and `affiliateUrlFormat` never returned in any response
- `url` validated as HTTPS (`@IsUrl({ require_tls: true })`)
- Postback endpoint validates HMAC signature from affiliate network
- Click endpoint rate-limited per IP (5 clicks/minute) to reduce bot inflation
- Sponsored placements only creatable by admin; `isSponsored` not settable by non-admin via any DTO

### Admin Tools

- Ticket Links Manager: full CRUD, `linkCategory` + `isSponsored` fields, `saleInfo` editor, bulk import, clone-to-fixtures, link health indicator
- Click analytics dashboard: clicks by date, by link, by fixture, by category
- Affiliate Partner registry: partner CRUD with default tag + format
- Sponsored Placement manager: active slots, date ranges, impression counts
- Premium alert configuration: select team/competition, set sale date, preview audience, schedule or send

### Edge Cases

- Fixture not yet announced: team-level and competition-level links shown as fallback
- Link health check failure: flag in admin; do not auto-hide (admin decides)
- Affiliate URL with existing query params: `buildFinalUrl` merges rather than duplicates params
- Club objects to affiliate link: admin removes link; neutral label avoids brand disputes
- Sale date passes without general sale opening: mark `saleInfo.notes` and leave link live (club may delay)

### Platform Config


| Key                            | Type    | Default | Purpose                                                 |
| ------------------------------ | ------- | ------- | ------------------------------------------------------- |
| `ticket_links_enabled`         | boolean | `false` | Master gate for all Phase 1 ticket CTAs                 |
| `affiliate_links_enabled`      | boolean | `false` | Enable affiliate tag injection; when off, tags stripped |
| `hospitality_links_enabled`    | boolean | `false` | Show hospitality group in ticket panel                  |
| `matchday_affiliates_enabled`  | boolean | `false` | Show travel/hotels/parking group                        |
| `sponsored_placements_enabled` | boolean | `false` | Show sponsored placement slots                          |
| `ticket_alerts_enabled`        | boolean | `false` | Premium ticket on-sale / sold-out alerts                |
| `affiliate_disclosure_enabled` | boolean | `true`  | Show affiliate commission footnote                      |


Backend: `TicketLinksFeatureService.assertEnabled()` on write endpoints. Public reads skip the check (pre-seed links before going live). Each sub-flag (`hospitality_links_enabled`, etc.) checked in `getForFixture()` to filter categories out when their flag is off.

Frontend: `TicketsMatchdayPanel` reads all relevant flags from the Zustand store; category groups hidden individually when their flag is off. No full route wrapper needed — panel simply doesn't render gated sections.

### Implementation Order

**Sprint 1 — Extend the data model:**

1. Extend `TicketLinkType` enum (add `AWAY_FANS`, `TICKET_EXCHANGE`, `HOSPITALITY`, `HOSPITALITY_PARTNER`, `MEMBERSHIP`, `TRAVEL`, `PARKING`, `HOTEL`, `MERCHANDISE`, `STADIUM_TOUR`)
2. Add `linkCategory`, `affiliateUrlFormat`, `isSponsored`, `sponsorLabel`, `saleInfo`, `partnerId` to `TicketLink` entity (migration)
3. Seed all new platform config rows (migration)
4. Add `TicketLinksFeatureService` + expose all 7 flags on `GET /platform-config/features`
5. Add to Zustand store + `PlatformConfigSection.tsx` `FEATURE_FLAG_KEYS`

**Sprint 2 — Backend services:**
6. `TicketLink` module with `buildFinalUrl()` and `getForFixture()` grouped by category
7. Improved click tracking (anonymous, `source` field, `fixtureId` denorm)
8. `AffiliatePartner` entity + service
9. `POST /affiliate/postback` + `AffiliateConversion` entity
10. Nightly link health check job

**Sprint 3 — Admin tooling:**
11. Admin ticket links table with new fields
12. Click analytics endpoints + admin dashboard widget
13. Affiliate partner CRUD at `/admin/affiliate-partners`

**Sprint 4 — Match page UI:**
14. `TicketsMatchdayPanel` with grouped `TicketLinkGroup` sections
15. `MembershipInfoCard` with `saleInfo` display
16. Updated `ExternalLinkModal` (domain display, suppress checkbox, affiliate disclosure)
17. `TicketAlertUpsell` CTA for free users

**Sprint 5 — Premium alerts:**
18. Extend `NotificationType` enum (ticket alerts + match reminders)
19. `TicketAlertService` with premium gate + comms preference check
20. In-app delivery via existing `NotificationService`
21. Email delivery via transactional email provider

---

## Phase 2: User Ticket Ownership / Attendance Preparation

### Seat and ticket data ownership (P1)

One `ticket` row = **one seat**. Seat identity is split by context:

| Table | Role |
| ----- | ---- |
| `ticket` | Canonical seat fields for platform inventory (primary purchase or resale custody) |
| `marketplaceListing` | Listing-specific presentation, ask price, delivery, proof; row/number hidden until purchase |
| `attendanceRecord` | User-declared private attendance; may describe external (off-platform) tickets |

`marketplaceListing.quantity` must stay **1** until a future `listingTicket` join table supports multi-seat listings.

See also: [`schema-backlog.md`](./schema-backlog.md) P1-2.

### Product Goal

Let users declare they are attending a match and optionally store their seat details and ticket proof privately.

### User Flow

```
Match page → "I'm Going" button → Attendance modal:
  ├─ Just mark going (no ticket yet)
  └─ "I have a ticket" toggle → seat detail form
        ├─ Section / Block / Row / Seat
        ├─ Provider / Purchase date / Notes
        └─ Optional: upload PDF or image (private)

Attendance History page → list of upcoming + past attended matches
Match page → shows "X fans going" aggregate count (no names, privacy-respecting)
```

### Frontend Pages / Components

- `**ImGoingButton**` — toggle on match page; replaces with "You're going" state
- `**AttendanceModal**` — drawer/modal with "I have a ticket" toggle, seat form, upload
- `**AttendanceHistoryPage**` (`/attendance`) — list of user's attended matches with seat details
- `**AttendanceCount**` — small "X fans going" chip on match page (aggregate, no identities)
- `**TicketUploadPanel**` — file dropzone; shows upload status, "Private" label
- Extend existing `wallet.page.tsx` to list owned ticket records

### Backend Responsibilities

The existing `Log` entity tracks attendance. The existing `Ticket` entity handles paid tickets. Phase 2 bridges the two:

- `AttendanceRecord` (new module, or extend `Log`) — user declares attendance + optional seat data
- Private file upload endpoint — store in secure bucket, URL never exposed publicly
- Aggregate count endpoint — returns count only, not user list

### API Endpoints

```
POST   /attendance                      create/update attendance declaration
GET    /attendance/my                   user's own attendance records (authed)
GET    /attendance/:fixtureId/count     public aggregate count for a match
DELETE /attendance/:id                  cancel attendance
POST   /attendance/:id/upload           upload ticket proof (private)
GET    /attendance/:id/document         signed URL for own document (authed, owner only)
```

### DTOs

```typescript
// CreateAttendanceDTO
{
  fixtureId: string;
  hasTicket: boolean;
  seatSection?: string;
  seatBlock?: string;
  seatRow?: string;
  seatNumber?: string;
  ticketProvider?: string;
  purchaseDate?: Date;
  notes?: string;          // max 500 chars
}

// AttendanceResponseDTO
{
  id, fixtureId, userId, hasTicket,
  seatSection, seatBlock, seatRow, seatNumber,
  ticketProvider, purchaseDate, notes,
  hasDocument: boolean,    // true/false only — never expose URL publicly
  createdAt, updatedAt
}

// AttendanceCountResponseDTO
{
  fixtureId: string;
  goingCount: number;
  hasTicketCount: number;
}
```

### Service-Layer Logic

- `AttendanceService.upsert(userId, dto)` — one record per user per fixture; update if exists
- Document upload: validate MIME type (PDF, JPEG, PNG, HEIC only), max 10 MB, store with path `attendance-docs/{userId}/{attendanceId}/{filename}`
- `getDocument(userId, attendanceId)` — verify ownership, generate short-lived signed URL (15 min expiry)
- `getCount(fixtureId)` — returns aggregate only; no user data

### Security

- All attendance endpoints require auth except aggregate count
- Document signed URLs expire in 15 minutes; never stored in DB
- Ownership check on every document access: `attendance.userId === request.user.id`
- Admin can view attendance counts but NOT individual documents
- `notes` field sanitised (strip HTML, length cap)
- Rate limit document upload: max 3 uploads per attendance record

### Admin Tools

- Admin can see aggregate attendance per fixture (count only)
- Admin cannot access individual user documents
- Flag system: if a document is reported as fake, admin can remove it

### Edge Cases

- User marks going, match is postponed: notify user, keep record but flag fixture status change
- Duplicate uploads: replace existing document, do not accumulate
- User deletes attendance: document is also deleted from storage
- Privacy: `AttendanceCount` is public; individual records are private; `trackerVisibility` user preference respected for friend-facing features

### Platform Config

- `**attendance_tracking_enabled**` (boolean, default `false`) — gates the "I'm going" / ticket ownership features
- `**ticket_document_upload_enabled**` (boolean, default `false`) — sub-flag for private proof upload; can be on without full attendance tracking (or vice versa)

Backend: `AttendanceTrackingFeatureService.assertEnabled()` on write endpoints. Aggregate count (`GET /attendance/:fixtureId/count`) stays public and ungated. Document upload additionally checks `ticket_document_upload_enabled`.

Frontend: `ImGoingButton` and `AttendanceModal` guard on `attendanceTrackingEnabled` from the store. The `AttendanceHistoryPage` route is wrapped in `AttendanceTrackingFeatureRoute`.

### Implementation Order

1. Seed `attendance_tracking_enabled` + `ticket_document_upload_enabled` config rows
2. Add `AttendanceTrackingFeatureService` + expose flags on `/features`
3. Add to Zustand store + admin config section
4. `attendance` module (CRUD + upsert logic)
5. Aggregate count endpoint (`@Public()`)
6. Document upload endpoint + storage integration
7. Signed URL document retrieval
8. `ImGoingButton` + `AttendanceModal` components
9. `AttendanceHistoryPage` with `AttendanceTrackingFeatureRoute` wrapper
10. `AttendanceCount` chip on match page

---

## Phase 3: Ticket Interest and Demand Tracking

### Product Goal

Measure real demand before launching the marketplace; let users register that they are looking for a ticket.

### User Flow

```
Match page → "Looking for a ticket?" CTA (shown when match has no user attendance) →
  TicketInterestForm:
    ├─ Number of tickets wanted (1–4)
    ├─ Max price willing to pay
    ├─ Preferred stand/block (optional)
    └─ Notify me when resale launches (toggle)

Match page → demand counter: "47 fans looking for tickets"
Future (Phase 4 launch): bulk notify interested users
```

### Frontend Pages / Components

- `**LookingForTicketCTA**` — shown on match page when user has no attendance record and resale not yet active
- `**TicketInterestForm**` — simple modal form
- `**DemandCounter**` — "X fans looking for tickets" chip; shown publicly on match page
- `**MyInterestsPage**` (`/ticket-interests`) — user's active requests with cancel buttons
- Admin: demand heatmap by fixture in admin dashboard

### Backend Responsibilities

- New `TicketInterest` module
- Aggregate demand endpoint (public)
- User's own interests (authed)
- Bulk notification trigger (admin-only, used at Phase 4 launch)

### API Endpoints

```
POST   /ticket-interest                     register interest
GET    /ticket-interest/my                  user's active interests (authed)
DELETE /ticket-interest/:id                 cancel interest
GET    /ticket-interest/:fixtureId/demand   public aggregate demand stats
POST   /ticket-interest/notify/:fixtureId   admin trigger: notify all interested users
```

### DTOs

```typescript
// CreateTicketInterestDTO
{
  fixtureId: string;
  quantity: number;           // 1–4
  maxPriceGbp?: number;       // optional budget
  preferredStand?: string;
  wantsNotification: boolean;
}

// TicketInterestResponseDTO
{
  id, fixtureId, quantity, maxPriceGbp,
  preferredStand, wantsNotification,
  status: 'ACTIVE' | 'NOTIFIED' | 'CANCELLED',
  createdAt
}

// DemandStatsDTO
{
  fixtureId: string;
  interestedCount: number;
  totalTicketsWanted: number;
  avgMaxPrice?: number;        // only shown to admin; excluded from public response
}
```

### Service-Layer Logic

- One active interest per user per fixture (upsert on re-submit)
- `getDemand(fixtureId)` — count only, public; admin version includes avg price
- `notifyInterested(fixtureId)` — admin trigger; marks status `NOTIFIED`, queues notification via `notification` module
- Automatically cancel interest if user creates an attendance record for the same fixture

### Security

- Interest creation and read require auth
- Aggregate demand is public (count only); no user-identifying information
- `maxPriceGbp` is private — never returned in public demand endpoint
- Admin endpoint `notify/:fixtureId` restricted to `ADMIN` role

### Admin Tools

- Per-fixture demand table: interested count, total tickets wanted
- "Notify all interested" button (triggers bulk notification when resale goes live)
- CSV export of demand data (admin only, no PII in export)

### Edge Cases

- User registers interest then gets a ticket: auto-cancel interest, confirm via notification
- Match cancelled: notify interested users, mark interests `CANCELLED`
- Demand data used for business decisions only — do not expose individual user budgets to anyone

### Platform Config

- `**ticket_demand_enabled**` (boolean, default `false`) — gates demand tracking; off by default until Phase 2 is live (pointless to capture demand before attendance exists)

Backend: `TicketDemandFeatureService.assertEnabled()` on create/cancel interest endpoints. Demand count endpoint stays public so it can be shown on match pages without auth.

Frontend: `LookingForTicketCTA` only renders when `ticketDemandEnabled` is true in the store. `DemandCounter` can show independently once the flag is on. `/ticket-interests` page uses a `TicketDemandFeatureRoute` wrapper.

### Implementation Order

1. Seed `ticket_demand_enabled` config row
2. `TicketDemandFeatureService` + expose flag on `/features` + Zustand store
3. `ticket-interest` module + CRUD
4. Aggregate demand endpoint
5. Auto-cancel on attendance creation
6. `LookingForTicketCTA` + form component
7. `DemandCounter` on match page
8. `MyInterestsPage` with `TicketDemandFeatureRoute` wrapper
9. Admin demand view + notify trigger

---

## Phase 4: Manual Fan-to-Fan Resale Marketplace

### Product Goal

Allow fans to list unused tickets for sale; buyers can request to purchase; admin verifies listings before they go public.

> Note: `MarketplaceListing` entity and marketplace checkout module already exist. This phase documents the complete intended flow and identifies gaps.

### User Flow

**Seller:**

```
Wallet / Attendance page → "Sell this ticket" → CreateListingForm →
  Submit for review → "Pending review" state → Admin approves →
  Listing goes live → Buyer requests purchase → Seller confirms handoff details →
  Transfer completes → Seller receives payment
```

**Buyer:**

```
Match page → "Tickets Available" tab → Browse listings →
  View listing detail → "Request to Buy" → Checkout flow →
  Await seller confirmation → Confirm receipt → Review seller
```

**Admin:**

```
Admin dashboard → Review queue → Approve / Reject listing →
  Monitor active transactions → Handle disputes
```

### Frontend Pages / Components

- `**CreateListingPage**` (`/marketplace/create`) — already partially exists; needs proof upload + delivery method
- `**ListingDetailPage**` (`/marketplace/:listingId`) — already partially exists
- `**MarketplacePage**` (`/marketplace`) — already exists; add match-scoped view
- `**SellerDashboardPage**` (`/my-listings`) — already exists; needs status states
- `**BuyerDashboardPage**` (`/my-purchases`) — needs building
- `**DisputeButton**` + dispute modal
- `**TransferConfirmationScreen**` — both buyer and seller confirm transfer
- **Admin `ListingReviewQueue`** — table of pending listings with approve/reject

### Backend Responsibilities

Existing `marketplace` complex module handles listing CRUD and checkout. Additions:

- Listing state machine: `DRAFT → PENDING_REVIEW → ACTIVE | REJECTED → SOLD | CANCELLED`
- Proof-of-ticket upload (private, admin-reviewable)
- Admin approve/reject with rejection reason
- Reservation lock during buyer checkout (already exists via `TicketHold`)
- Transfer confirmation from both parties
- Dispute creation and escalation

### API Endpoints

```
POST   /marketplace                        create listing (DRAFT state)
POST   /marketplace/:id/submit             submit for review (DRAFT → PENDING_REVIEW)
POST   /marketplace/:id/approve            admin approve (→ ACTIVE)
POST   /marketplace/:id/reject             admin reject with reason
GET    /marketplace/query                  public: active listings by fixtureId
GET    /marketplace/my-listings            seller's own listings (all states)
POST   /marketplace/:id/request-purchase   buyer requests to buy
POST   /marketplace/:id/confirm-transfer   seller confirms transfer sent
POST   /marketplace/:id/confirm-receipt    buyer confirms receipt
POST   /marketplace/:id/dispute            raise dispute
POST   /marketplace/:id/upload-proof       seller uploads ticket proof (admin-visible)
GET    /marketplace/:id/proof              admin-only signed URL for proof document
```

### DTOs

```typescript
// CreateMarketplaceListingDTO
{
  fixtureId: string;
  seatSection?: string; seatBlock?: string;
  seatRow?: string; seatNumber?: string;
  priceGbp: number;                     // must be > 0
  ticketType: TicketType;               // PHYSICAL | PDF | MOBILE_APP | CLUB_TRANSFER
  deliveryMethod: DeliveryMethod;       // EMAIL_PDF | CLUB_APP_TRANSFER | PHYSICAL_POST | IN_PERSON
  quantity: number;                     // 1–4
  description?: string;                 // seller notes, max 300 chars
}

// ListingResponseDTO
{
  id, fixtureId, sellerId (opaque), seatSection, seatBlock,
  priceGbp, ticketType, deliveryMethod, quantity, status,
  sellerRating?: number, isVerified: boolean,
  createdAt
  // Note: seatRow and seatNumber hidden until purchase confirmed
}

// AdminRejectDTO
{ reason: string; }

// DisputeDTO
{ reason: string; details: string; }  // max 1000 chars
```

### Service-Layer Logic

- State machine enforced in service: invalid transitions throw `BadRequestException`
- `submitForReview`: validates listing has required fields; creates admin notification
- `approveListing`: moves to ACTIVE; notifies interested users from Phase 3 demand list
- `requestPurchase`: checks listing is ACTIVE and not already reserved; creates hold
- Transfer confirmation: both parties must confirm; payment released only after both confirm
- Fraud checks before approval: duplicate listings for same seat, seller account age, previous disputes

### Security

- Seller can only manage own listings
- Buyer can only see ACTIVE listings publicly; seat details (row/number) hidden until purchase confirmed
- Proof document accessible to admin only; seller cannot retrieve it post-upload to prevent re-downloading
- Payment not captured until admin approves listing
- Dispute raises flag, locks funds, alerts admin

### Payment Considerations

- Payment captured at `requestPurchase` step (or at transfer confirmation — decision needed)
- Funds held (not released to seller) until `confirm-receipt` from buyer
- If buyer does not confirm within 48h after seller confirms, auto-release (with admin override)
- Refund issued immediately if listing rejected after payment taken

### Admin Tools

- Listing review queue with proof document viewer
- Approve/reject with reason
- Transaction monitor: pending transfers, dispute queue
- Manual fund release / refund trigger
- Seller risk score (dispute history, account age, listing frequency)

### Edge Cases

- Seller tries to list after already selling same ticket: duplicate detection by fixture + section + row + seat
- Buyer withdraws before seller confirms: refund + listing returns to ACTIVE
- Seller goes silent after purchase: auto-escalate to dispute after 72h
- Multiple buyers request same listing simultaneously: first come served via DB-level reservation lock

### Platform Config

- `**marketplace_enabled**` (boolean, default `false`) — **already exists**; this is the primary gate for the entire resale marketplace. No new flag needed for Phase 4.
- Existing `MarketplaceEnabledGuard` already applied to listing and checkout controllers — the state machine extensions and new endpoints (approve/reject, dispute, upload-proof) must also be guarded by this.

The Phase 3 → Phase 4 transition: when `marketplace_enabled` is turned on, the admin can trigger the bulk notification from Phase 3 demand data.

### Implementation Order

1. Extend `MarketplaceListing` state machine
2. Proof upload endpoint (admin-visible storage path) — guarded by `MarketplaceEnabledGuard`
3. Admin approve/reject endpoints
4. Buyer purchase request + reservation lock
5. Transfer confirmation (both parties)
6. Dispute endpoint
7. Seller/buyer dashboard pages
8. Admin listing review UI
9. Auto-release timer (BullMQ job)
10. Phase 3 notification trigger on listing approval

---

## Phase 5: Escrow, Payments, Fees and Trust Layer

### Product Goal

Monetise the marketplace with platform fees; protect buyers and sellers with proper escrow and trust signals.

> Stripe integration already exists (`backend/src/api/integrations/`). This phase formalises fee handling, payout structure, and trust signals.

### User Flow

**Buyer checkout:**

```
Listing detail → "Buy Now" → Checkout:
  ├─ Ticket price: £X
  ├─ Buyer service fee: £Y (e.g. 10%)
  └─ Total: £Z
→ Stripe payment → funds held in escrow → transfer confirmed → funds released to seller
```

**Seller payout:**

```
Transfer confirmed → Seller sees: "Payout pending"
→ Platform deducts seller fee (e.g. 5%)
→ Seller net payout: £W
→ Stripe Connect payout to seller bank account
```

### Frontend Pages / Components

- `**CheckoutPage**` (already exists) — add fee breakdown, escrow explanation
- `**SellerPayoutEstimate**` — component on listing creation showing net payout after fees
- `**BuyerFeeBreakdown**` — component on listing detail
- `**SellerOnboarding**` — Stripe Connect onboarding flow (`/seller/onboarding`)
- `**TrustBadge**` — "Verified Seller", "X sales", star rating
- `**RatingsPanel**` — post-transfer rating prompt for both parties
- `**RefundDisputeUI**` — refund status, dispute form

### Backend Responsibilities

- Stripe Connect: seller onboarding (`/seller/connect`)
- Payment Intent with application fee
- Escrow: hold captured payment until transfer confirmation
- Payout trigger post-confirmation
- Refund on failed transfer or dispute
- Fee configuration (stored in `PlatformConfig`)
- Seller/buyer rating system (new module)
- Trust score computation

### API Endpoints

```
POST   /seller/connect/onboard         initiate Stripe Connect for seller
GET    /seller/connect/status          seller's Connect account status
POST   /payments/marketplace-intent    create payment intent with escrow hold
POST   /payments/release/:transactionId  release funds to seller
POST   /payments/refund/:transactionId   issue buyer refund
POST   /ratings                          submit post-transfer rating
GET    /ratings/:userId/summary          public trust score summary
GET    /platform-config/fees             public fee structure
```

### DTOs

```typescript
// MarketplacePaymentIntentDTO
{
  listingId: string;
  buyerFeePercent: number;    // from platform config, echoed back for UI
  totalAmount: number;        // server-calculated: price + buyer fee
}

// PaymentIntentResponseDTO
{
  clientSecret: string;
  paymentIntentId: string;
  amountGbp: number;
  feeBreakdown: {
    ticketPrice: number;
    buyerFee: number;
    total: number;
  }
}

// SellerPayoutEstimateDTO
{ listingPriceGbp: number } → {
  grossAmount: number;
  platformFee: number;
  netPayout: number;
}

// RatingDTO
{
  transactionId: string;
  targetUserId: string;
  role: 'BUYER' | 'SELLER';
  score: number;              // 1–5
  comment?: string;           // max 300 chars
}
```

### Service-Layer Logic

- `FeeService.calculate(price)` — reads fee config from `PlatformConfig`; returns buyer fee, seller fee, net payout
- `EscrowService.hold(paymentIntentId)` — mark transaction as `HELD`
- `EscrowService.release(transactionId)` — transfer net amount to seller's Connect account; update transaction to `RELEASED`
- `EscrowService.refund(transactionId, reason)` — full or partial refund
- `TrustScoreService.compute(userId)` — weighted score: ratings (70%), dispute history (20%), account age (10%)
- New seller limits: cap at 3 active listings until first 3 sales confirmed

### Security

- Stripe webhook signature verification (already in place; extend for Connect events)
- Platform never stores raw card data
- Seller Connect account ID stored encrypted
- Fee configuration changes require admin + audit log
- Dispute freezes funds; only admin can release frozen funds
- Ratings are anonymous to the other party; no harassment vectors

### Payment Considerations

- Use Stripe Connect (Express or Standard — Express recommended for faster onboarding)
- Application fee set on Payment Intent: `application_fee_amount`
- Funds go to platform Stripe account first; payout to seller via `transfer` after confirmation
- Dispute triggers `refund` on Stripe + internal dispute status
- Handle Stripe webhook: `payment_intent.succeeded`, `charge.dispute.created`, `transfer.failed`

### Admin Tools

- Fee configuration UI in admin dashboard
- Transaction ledger view (all escrow states)
- Manual fund release / refund
- Dispute queue with evidence review
- Seller Connect status monitor

### Edge Cases

- Stripe Connect onboarding incomplete: prevent listing creation
- Transfer fails (Stripe side): alert admin, hold funds, do not auto-refund
- Rating window: 7 days post-transfer; close after that
- Currency: Phase 5 targets GBP; multi-currency in Phase 7+

### Platform Config

- `**marketplace_enabled**` (already exists) — gates all Phase 5 endpoints
- `**marketplace_fee_rate**` (number, already exists, default `0.10`) — buyer-side fee
- `**marketplace_seller_fee_rate**` (number, new, default `0.05`) — seller-side fee deducted at payout
- Both fee keys surfaced in `GET /platform-config/fees` (public endpoint) so the frontend can show accurate fee breakdowns without hardcoding values

Fee config changes in the admin UI should be treated with care — changing rates mid-sale must not affect in-flight transactions. The `FeeService` should snapshot the fee at the point of purchase into the transaction record.

### Implementation Order

1. Seed `marketplace_seller_fee_rate` config row
2. `FeeService` + `EscrowService` reading from config (snapshot to transaction at purchase time)
3. Stripe Connect seller onboarding flow
4. Payment Intent with application fee
5. Release/refund endpoints
6. Rating module
7. `TrustScoreService`
8. `GET /platform-config/fees` public endpoint
9. Checkout fee breakdown UI
10. Seller payout estimate on listing creation
11. Admin ledger + dispute queue

---

## Phase 6: Official Club Transfer Support

### Product Goal

Guide users through the official club transfer process when a club requires tickets to be transferred through their own system.

### User Flow

**Seller selects "Club App Transfer" delivery method:**

```
Create listing → delivery: CLUB_APP_TRANSFER →
  (Listing goes live as normal)
```

**After purchase confirmed:**

```
Buyer: "Transfer Details" form →
  ├─ Full name (as per club account)
  ├─ Email registered with club
  └─ Supporter number (if required by club)

Seller: Receives buyer transfer details (masked) →
  Guided checklist:
    1. Open [Club Name] ticketing app/website
    2. Go to "My Tickets" → select ticket
    3. Transfer to: [buyer email]
    4. [Link to club transfer guide if available]
  → "I have initiated the transfer" button

Buyer: Receives notification → confirms receipt in club app →
  → "I have received the ticket in my account" button

Payment released → both parties rate
```

### Frontend Pages / Components

- `**TransferChecklist**` — step-by-step guided transfer UI (modal or dedicated page)
- `**BuyerTransferDetailsForm**` — name, email, supporter number; encrypted before send
- `**SellerTransferConfirmStep**` — guided checklist with "Initiate Transfer" button
- `**BuyerReceiptConfirmStep**` — "Confirm you received the ticket" step
- `**TransferStatusTracker**` — timeline: Awaiting Details → Transfer Initiated → Ticket Received → Complete
- **Club transfer guide links** — curated per club (admin-managed)

### Backend Responsibilities

- Store buyer transfer details securely (encrypted at rest)
- Track transfer status transitions
- Club transfer guide links (static or admin-managed per team)
- Payment release tied to buyer confirmation
- Escalation timer: if no confirmation in 48h, admin review triggered

### API Endpoints

```
POST   /marketplace/:id/transfer-details      buyer submits transfer info
GET    /marketplace/:id/transfer-details      seller retrieves (masked email, no full name)
POST   /marketplace/:id/initiate-transfer     seller confirms they started external transfer
POST   /marketplace/:id/confirm-receipt       buyer confirms received
GET    /team/:teamId/transfer-guide           public club transfer guide (if available)
POST   /team/:teamId/transfer-guide           admin creates/updates guide
```

### DTOs

```typescript
// BuyerTransferDetailsDTO
{
  fullName: string;
  clubEmail: string;       // validated as email
  supporterNumber?: string;
}

// TransferDetailsResponseDTO (seller view)
{
  maskedEmail: string;     // "j***@gmail.com"
  supporterNumber?: string;
  // fullName never exposed to seller
}

// ClubTransferGuideDTO
{
  teamId: string;
  guideUrl?: string;
  instructions: string;    // markdown, max 2000 chars
  requiresSupporterNumber: boolean;
}
```

### Service-Layer Logic

- `TransferService.storeBuyerDetails(listingId, dto)` — encrypt `fullName` and `clubEmail` before persisting
- `getMaskedDetailsForSeller(listingId, sellerId)` — verify seller owns listing, return masked email only
- `initiateTransfer(listingId, sellerId)` — record timestamp; start 48h confirmation timer (BullMQ)
- `confirmReceipt(listingId, buyerId)` — verify buyer owns purchase; trigger `EscrowService.release`
- Escalation job: if not confirmed in 48h, set status `ESCALATED`, notify admin

### Security

- Buyer transfer details encrypted at rest (AES-256)
- Seller sees masked email only — never full name or supporter number
- Transfer details deleted 30 days after transaction closes
- Escalation window prevents seller from holding funds indefinitely

### Admin Tools

- Escalated transfer queue
- View (decrypted) transfer details for disputed transactions
- Club transfer guide management
- Manual confirm / refund for stuck transactions

### Edge Cases

- Club changes transfer process: admin updates guide; existing in-flight transfers continue
- Buyer provides wrong supporter number: dispute mechanism; refund if transfer fails
- Seller forgets to initiate: reminder notification at 12h; auto-escalate at 48h

### Platform Config

- `**club_transfer_enabled**` (boolean, default `false`) — gates the guided transfer UI and transfer-detail endpoints. When off, "Club App Transfer" is hidden as a delivery method option in listing creation.
- Can be enabled independently of `marketplace_enabled` during testing, but in practice requires marketplace to be on.

Backend: `ClubTransferFeatureService.assertEnabled()` on `transfer-details` and `initiate-transfer` endpoints. Transfer-receipt confirmation and dispute endpoints remain available once a transfer is already in-flight (no assert needed there — don't lock users out of confirming mid-flight transactions).

### Implementation Order

1. Seed `club_transfer_enabled` config row
2. `ClubTransferFeatureService` + expose flag + Zustand store
3. Encrypted buyer transfer details endpoint
4. Masked seller view
5. Transfer initiation + BullMQ escalation timer
6. Buyer receipt confirmation + escrow release trigger
7. Club transfer guide module
8. Hide "Club App Transfer" delivery option in listing form when flag is off
9. `TransferChecklist` and `TransferStatusTracker` components
10. Admin escalated transfers queue

---

## Phase 7: Official Club / Ticketing Provider Partnerships

### Product Goal

Integrate with official club or ticketing provider APIs to show real inventory, support direct purchase, and enable verified resale.

### User Flow

**Official inventory:**

```
Match page → "Official Tickets" tab (when integration active) →
  Real-time availability per price category →
  "Buy Now" → deep link or in-app checkout depending on integration level
```

**Official resale:**

```
Listing marked as "Verified Ticket" if validated via provider API →
  Buyer sees "Official" badge → Higher trust, potentially lower fees
```

### Frontend Pages / Components

- `**OfficialTicketInventory**` — price categories, availability counts, "Buy" per tier
- `**VerifiedTicketBadge**` — distinct from Phase 1 link badge; means ticket was API-validated
- `**OfficialResaleListing**` — listing variant showing "Club Exchange" source
- `**ClubTicketRules**` — per-club rules: transferability, resale restrictions
- **Integration status indicator** — admin UI showing sync health per provider

### Backend Responsibilities

- Per-provider adapter interface (`TicketingProviderAdapter`)
- Polling or webhook-based availability sync
- Ticket validation endpoint (check barcode/reference with provider)
- Club-specific resale rules enforcement
- Prevent unofficial resale listings where club prohibits it

### API Endpoints

```
GET    /integrations/ticketing/:providerId/fixtures        sync fixture list
GET    /integrations/ticketing/:providerId/availability    inventory per fixture
POST   /integrations/ticketing/:providerId/validate        validate a ticket reference
GET    /fixture/:fixtureId/official-inventory              aggregated availability (public)
GET    /team/:teamId/ticket-rules                          club resale/transfer rules
POST   /integrations/ticketing/webhook/:providerId         inbound provider webhooks
```

### DTOs

```typescript
// TicketAvailabilityDTO
{
  fixtureId: string;
  providerId: string;
  categories: Array<{
    name: string;           // "Away End", "North Stand"
    priceGbp: number;
    available: number;      // -1 = unknown
    purchaseUrl?: string;
  }>;
  syncedAt: Date;
}

// TicketValidationRequestDTO
{ ticketReference: string; fixtureId: string; }

// TicketValidationResponseDTO
{ valid: boolean; seatInfo?: string; message?: string; }

// ClubTicketRulesDTO
{
  teamId: string;
  allowsResale: boolean;
  requiresClubTransfer: boolean;
  transferSystem?: string;    // e.g. "Ticketmaster Account Manager"
  notes?: string;
}
```

### Service-Layer Logic

- `TicketingProviderAdapter` interface — implement per provider (Ticketmaster, SeatGeek, club-bespoke)
- Sync job (BullMQ): poll availability every N minutes; cache in Redis; TTL based on fixture proximity
- `validateTicket(ref, fixtureId)` — call provider API; cache result briefly (fraud prevention)
- `enforceClubRules(fixtureId, listingDTO)` — check team ticket rules before accepting marketplace listing
- Graceful degradation: if provider API down, fall back to Phase 1 external links

### Security

- Provider API keys stored in encrypted `Integration` entity (already exists in backend)
- Webhook endpoints validate provider signature headers
- Ticket validation results cached but not stored long-term (GDPR)
- Rate limit validation endpoint aggressively (anti-scraping)

### Admin Tools

- Integration health dashboard: last sync time, error rates per provider
- Manual sync trigger
- Provider API key management (encrypted)
- Club rules editor

### Edge Cases

- Provider API returns inconsistent availability: show "Availability may vary", link to official site
- Club prohibits resale: `enforceClubRules` rejects Phase 4 listing creation with clear error
- Multiple providers for same fixture (e.g. club site + Ticketmaster): merge, deduplicate by category
- Provider partnership ended: gracefully remove inventory display, revert to Phase 1 links

### Platform Config

- `**official_inventory_enabled**` (boolean, default `false`) — master gate for Phase 7 inventory display
- Individual integrations are also gated by the `Integration` entity's `enabled: boolean` field (already exists) — so each provider can be on/off independently even when the master flag is on
- `official_inventory_sync_interval_minutes` (number, default `15`) — polling frequency for availability sync jobs (higher near kickoff, lower days out)

Backend: `OfficialInventoryFeatureService.assertEnabled()` on sync-trigger and validation endpoints. The `GET /fixture/:fixtureId/official-inventory` public read endpoint degrades gracefully (returns empty array) when the flag is off rather than throwing, so the frontend tab can be hidden cleanly.

Frontend: `OfficialInventoryFeatureRoute` wraps the official inventory tab on the match page. When `officialInventoryEnabled` is false, the tab does not render.

### Implementation Order

1. Seed `official_inventory_enabled` + `official_inventory_sync_interval_minutes` config rows
2. `OfficialInventoryFeatureService` + expose flag + Zustand store
3. `TicketingProviderAdapter` interface + config schema using existing `Integration` entity
4. First provider integration (manual/simple)
5. Availability sync BullMQ job + Redis cache
6. `official-inventory` public endpoint (graceful empty on flag off)
7. Ticket validation endpoint
8. Club ticket rules module
9. `enforceClubRules` in marketplace listing service
10. Frontend official inventory tab
11. Admin integration health dashboard
12. Second+ provider integrations

---

## Cross-Phase Security Rules (Summary)


| Rule                                                                     | Phases  |
| ------------------------------------------------------------------------ | ------- |
| External links: always HTTPS, affiliate tags server-side only            | 1       |
| User documents: signed URLs only, 15-min expiry, owner-only              | 2, 4    |
| Aggregate-only public data; no user-identifying info in public responses | 2, 3    |
| Marketplace: seat details hidden until purchase confirmed                | 4       |
| Escrow: funds only released after double confirmation                    | 4, 5, 6 |
| Stripe webhook signature verification                                    | 5       |
| Transfer details: encrypted at rest, masked to seller                    | 6       |
| Provider keys: encrypted in Integration entity                           | 7       |
| Rate limiting on all auth, upload, and validation endpoints              | All     |
| Admin role required for all write operations on platform data            | All     |


---

## Cross-Phase Frontend Routing Plan

```
/matches/:fixtureId          Phase 1: TicketLinkButton
                             Phase 2: ImGoingButton, AttendanceCount
                             Phase 3: LookingForTicketCTA, DemandCounter
                             Phase 4: Marketplace listings tab
                             Phase 7: Official inventory tab

/attendance                  Phase 2: new page
/ticket-interests            Phase 3: new page
/marketplace                 Phase 4: exists
/marketplace/create          Phase 4: extend existing
/marketplace/:id             Phase 4: extend existing
/my-listings                 Phase 4: extend existing
/my-purchases                Phase 4: new page
/seller/onboarding           Phase 5: new page
/wallet                      Phase 2+: extend existing
/admin (dashboard)           All phases: extend existing
```

