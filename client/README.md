# BidArena — Client (Domain A: Marketplace & UX)

Real-time auction platform ka frontend. Ye README **Domain A** (Marketplace & UX) ke scope, architecture aur flow ko document karta hai.

## Tech Stack

| Layer | Tech |
|---|---|
| UI Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Client State | Redux Toolkit + React-Redux |
| Server State | TanStack React Query |
| Routing | React Router v8 |
| HTTP | Axios |
| Real-Time | Socket.io-client (wired — see "Backend Integration Status") |

## Architecture: Feature-Based + 4-Layer

```
src/
  api/            → global axios instance (baseURL, interceptors, auth token attach)
  app/            → app-level setup: store config, router config, providers
  features/
    <feature>/
      data/       → constants, mock data (jab tak real backend na ho)
      service/    → API call functions (axios) — real endpoint, Domain B ke live hote hi kaam karega
      hooks/      → business logic — state, validation, mutations/queries
      ui/         → presentational components
  shared/
    components/   → reusable UI (Button, Badge, Card, Loader, AppBackground, SplitFlapText, ScrollToTop...)
    data/         → cross-feature mock data (e.g. mockRoom.js)
    hooks/        → cross-feature hooks (useAuctionRoom, useInView)
    layout/       → Navbar, MainLayout, ProtectedRoute
    store/        → redux slices (authSlice)
    utils/        → helpers (formatCurrency, formatCountdown)
```

**Layer rule:** `hooks`/`service`/`data` are private to their own feature and must not be imported by other features — if 2+ features genuinely need the same logic (like `useAuctionRoom`), it gets promoted to `shared/`. A feature's `ui` components, however, can be composed into another feature's page (e.g. `ChatPanel` from `chat/ui/` is embedded directly in `auction-room` and `spectator` pages) — `ui` is a feature's public surface.

**Mock-data pattern:** hooks call the real service function first; if there's no data yet (backend not built), they fall back to static mock data (`query.data ?? mockX`) so the UI is always demoable. No fake/randomized backend simulation (e.g. auto-generated "other bidders" every few seconds) — that was tried and deliberately removed once Domain B started building the real APIs, to keep the frontend from acting like a pretend backend.

## Domain A — Feature List (mapped to SRS FRs)

| Feature folder | SRS Requirement | Status |
|---|---|---|
| `auth` | FR1, FR2 | ✅ Login + Register, real form, persisted session |
| `profile` | FR3 | ✅ Stats, bid history, my auctions |
| `auction-create` | FR4 | ✅ Listing form with live preview card |
| `auction-discovery` | FR5, FR6 | ✅ Filterable grid (sticky filter bar) + Auction Details page (pre-room landing, auth-aware CTA) |
| `auction-room` | FR7, FR9, FR14, FR15, FR16 | ✅ Bidding UI, timer, heat meter, timeline, chat, bid-placed particle burst |
| `spectator` | FR8 | ✅ Read-only room view (no bid controls), same live data + chat |
| `chat` | FR17 | ✅ `ChatPanel` embedded in auction-room + spectator |
| `dashboard` (SG13) | — | ✅ Seller analytics: revenue/views/listings summary, weekly bids bar chart, per-listing views+bids (distinct from `profile`, which is the bidder-facing summary) |
| `watchlist` (SG10) | — | ✅ Save/unsave lots (`WatchButton`), `/watchlist` page, "ending soon" alert banner |

> Note: Timer authority, bid validation/ordering, winner logic — ye sab **Domain B (server)** ki responsibility hai (FR10, FR18, FR19). Domain A abhi local demo state se UI dikhata hai; jab Socket.io events aayenge, `shared/hooks/useAuctionRoom.js` unhi events se driven hoga, UI components change nahi honge.

## Routes

| Path | Page | Protected? |
|---|---|---|
| `/` | Auction Discovery (home) | Public |
| `/login`, `/register`, `/forgot-password` | Auth | Public |
| `/auction/:id` | Auction Details | Public |
| `/auction/:id/spectate` | Spectator View | Public |
| `/profile` | Profile | 🔒 Login required |
| `/dashboard` | Seller Dashboard | ⚠️ Temporarily public (see TODO in `router.jsx`) — move back under `ProtectedRoute` before submission |
| `/auction/create` | Create Auction | 🔒 Login required |
| `/auction/:id/room` | Auction Room (bidding) | 🔒 Login required |

Data Router (`createBrowserRouter`) in `app/router.jsx`, nested under `MainLayout`, with a 404 `errorElement` (`NotFoundPage` — renders outside `MainLayout` since router error elements replace the whole tree, so it mounts its own `AppBackground`). `ScrollToTop` (in `MainLayout`) resets scroll position on every route change — React Router doesn't do this by default in a SPA.

## Design System

**Rebuilt from scratch (2026-07-30, later session)** — the old vibrant violet/magenta/gold gradient + glassmorphism + constellation theme is gone. New direction: a dark, flat, editorial "boarding pass / departure board" look (near-black surfaces, cream paper cards, one amber accent, one brick-red for urgency), based on a reference image the user provided. Rationale: the gradient theme read as "AI-generated" and the pink/magenta tones didn't feel professional enough for a competition demo.

| Token | Value | Use |
|---|---|---|
| `font-display` | Fraunces (900) | Big headlines — bold editorial serif |
| `font-body` | Inter | Body text |
| `font-mono` | JetBrains Mono | Bid amounts, timers, stats (tabular nums) |
| `bg` (`#0B0A08`) | Near-black | Page background |
| `bg-raised` (`#151310`) | Slightly lighter | Navbar, footer, `.panel` surfaces |
| `paper` (`#F2ECE0`) | Cream | Boarding-pass style cards (auth, 404) |
| `ink` / `ink-dim` | Warm off-white / warm gray | Text on dark surfaces |
| `paper-ink` / `paper-ink-dim` | Near-black / warm gray | Text on paper surfaces |
| `brand` (`#DD8B42`) | Amber orange | The **one** accent — CTAs, "live" status, headline highlight |
| `urgent` (`#C1402E`) | Brick red | Reserved for "ending soon" / countdown urgency only |
| `swatch-rust/olive/slate/clay` | Muted flat tones | Lot-thumbnail placeholder colors (no gradients — flat "luggage tag" blocks) |

**Global background** (`AppBackground.jsx`, mounted once in `MainLayout`, replaces the old `AuroraBackground.jsx`):
1. Flat near-black base + a faint fixed grid (`.app-bg-grid`), masked so it fades out toward the bottom of the first viewport
2. Three slowly-drifting "boarding pass ticket" outline rectangles (`.bg-ticket-a/b/c`) — borders only, tilted in 3D via `perspective`/`rotateX`/`rotateZ`, echoing the same paper-card motif used in the foreground so the background feels designed rather than decorative filler
3. A 3D perspective floor grid (`.app-bg-floor`) pinned to the bottom of the viewport, tilted via `rotateX(72deg)`, with a soft amber horizon glow line (`.app-bg-horizon`) at the vanishing point — gives real depth without gradients
4. Film grain overlay

**Surfaces:** `.panel`/`.panel-strong` (flat bordered dark card, replaces `.glass`), `.paper`/`.paper-tape` (cream card with little rotated "tape" rectangles at the top corners, like a physical boarding pass).

**3D tilt** (`shared/hooks/usePointerTilt.js`): a small reusable hook — mouse position over an element drives `rotateX`/`rotateY` via `perspective()`. Used on: the login/register/forgot-password `.paper` cards (with a static second "ticket" card peeking out from behind for physical depth), the hero's LOT/BID/STATUS table panel, and (already existing before this pass) `AuctionCard` and the auction-details hero image. Kept deliberately restrained — no glossy glass-orb 3D, just a card tilting like it's being held.

**Split-flap wordmark** (`SplitFlapText.jsx`): renders text as individual bordered monospace tiles (used for the "BIDARENA" logo in Navbar/Footer/Hero and the 404 page) — a nod to airport departure boards.

**Micro-interactions:**
- `.link-underline` — animated underline sweep on nav text links
- `useInView` (IntersectionObserver hook) — `AuctionCard` fades in when scrolled into view instead of animating unconditionally on mount
- Bid-placed particle burst (`AuctionRoomPage`) — fires from whichever bid button was clicked
- Status badges (`live`/`ending`/`upcoming`/`completed`): `live` = flat amber, `ending` = flat brick-red (both readable without color-blindness issues since text always says the state too), `upcoming` = outlined + radar "ping" ring, `completed` = muted + checkmark
- `PasswordInput.jsx` (shared) — eye icon to toggle show/hide, used by Login and Register

Removed in this pass (no longer used, deleted): `AuroraBackground.jsx` (glass orbs + canvas constellation), `CustomCursor.jsx` (glow/ring cursor follower), `.btn-shine`/`.btn-glow-pulse` (button shine sweep + pulsing glow), `.shine-text` (gradient shimmer text), `.stack-*` (glossy 3D card-stack — replaced by the tilt-hook + ticket-peek pattern above).

All animations respect `prefers-reduced-motion`.

## Responsive

- **Navbar** collapses to a hamburger menu below `md` (too many links to fit one row on mobile) — `shared/layout/Navbar.jsx`
- **Two-column pages** (auction-room, spectator, details, create, login, register) use `grid-cols-1 lg:grid-cols-[…]` explicitly, with `min-w-0` on the grid children — without `min-w-0`, a CSS Grid item won't shrink below its content's min-content width, which was silently causing horizontal scroll on mobile (a real bug caught via a Playwright mobile-viewport pass, not just visual inspection)
- **Discovery filter bar** is `sticky` below the navbar so it stays reachable while scrolling a long list, using `.panel-strong` so it reads as a solid toolbar rather than cards bleeding through it while stuck

## Setup Progress

- [x] Feature-wise folder structure + 4-layer architecture
- [x] Redux, Tailwind, React Query, Router, dev proxy (`/api`, `/socket.io` → `http://localhost:5000`, port TBD from Domain B)
- [x] `api/axiosInstance.js` — baseURL + auto token attach
- [x] `auth` — Login/Register, localStorage persistence, `ProtectedRoute`
- [x] Design system v2: dark/paper/amber "boarding pass" theme + global `AppBackground` (3D perspective floor grid + drifting ticket outlines + grain)
- [x] All 7 Domain A features have working UI + hooks + service (mock-data-backed, ready for real API)
- [x] Micro-interactions: custom cursor, scroll-reveal, bid burst, button/link hover animations
- [x] Mobile responsive pass (navbar, grid overflow, sticky filter bar) — verified overflow-free across all pages at 375px width
- [x] Seller dashboard (`/dashboard`) — revenue/views/listings summary, weekly bids bar chart, per-listing analytics (each listing links to its room if live, else its details page)
- [x] `PasswordInput` show/hide toggle on Login + Register
- [x] `Footer.jsx` — mounted in `MainLayout` below `<Outlet />`, `main` uses `flex-1` so it sits at the bottom even on short pages
- [x] Forgot Password page (`/forgot-password`) — linked from Login, `useForgotPassword` hook + `requestPasswordReset` service call, shows a success state after submit
- [x] Confirm-password field on Register — client-side match check before calling `register.mutate`
- [x] Reserve Price (SG8) — optional field on auction-create + live preview, `mockRoom.reservePrice`, "Reserve met/not met yet" indicator in auction-room + spectator, "closed with no sale" message if the auction ends below reserve

## Backend Integration Status

- [x] **Auth (login/register)** — fully wired and verified end-to-end (curl + real browser session) against the real API. `axiosInstance` baseURL `/api/v1`, response envelope `{ success, message, data: { user, accessToken, refreshToken } }` unwrapped in `authService.js`. Backend's `User` model has no `name` field — Register's name input stays client-side only, display name falls back to the email's local-part elsewhere. Real backend error messages surface in the UI. `useLogin`/`useRegister` now `navigate("/")` on success (previously missing — user got stuck on the auth page after a successful login).
  - `/auth/forgot-password` still has no backend route.
- [x] **Auction discovery + details (REST)** — `getAuctions()`/`getAuctionById()` in `auction-discovery/service/auctionService.js` normalize Domain B's real `Auction` schema (`currentHighestBid.amount`, `endTime`/`startTime` as dates, `status: active|upcoming|completed|cancelled`, populated `seller.email`) into the shape the UI already expects. Verified against the live backend (both empty-DB and with a real created auction).
- [x] **Auction create (REST, multipart)** — `AuctionCreatePage` now uploads real image files (`multipart/form-data`) and sends `startPrice`/`startTime`/`endTime` computed from the Start-now/Schedule toggle + duration. Reserve price was removed from this form — the real `Auction` schema has no field for it. Verified: creating an auction end-to-end (without an image, see gap below) lands you on its real details page.
- [x] **Real-time bidding + chat (Socket.io)** — `client/src/api/socket.js` is a shared singleton socket (JWT sent via `auth`), `shared/hooks/useAuctionRoom.js` now fetches real details via REST then joins the auction's Socket.io room and listens for `room_state`/`bid_updated`/`timer_tick`/`auction_ended`/`user_joined`; `placeBid()` emits `submit_bid` instead of mutating local state when a real auction is loaded. `chat/hooks/useChat.js` similarly emits `send_chat` / listens for `chat_message` over the same shared socket. **Chat verified working end-to-end live** (sent a message, watched it round-trip back through the server). Falls back to the old local-mock behavior whenever there's no real auction (e.g. stale demo links).

### Backend gaps found while integrating (not fixed here — out of scope per "don't touch backend" instruction, except where explicitly asked)

- **Image upload is broken**: `POST /auctions` with a file attached fails with `"ImageKit Upload Failed: undefined"` — looks like an ImageKit account/credentials issue, not a client bug (confirmed: the exact same request without a file succeeds with `201`). Needs Sharat to check the ImageKit dashboard/keys.
- **Real-time bidding cannot currently work end-to-end**: `join_room` always fails with `"Auction room not found."`, for every auction tried — both ones created as immediately-`active` and ones created as `upcoming` and left for 35s+ (past the scheduler's 30s poll interval). Traced to `AuctionEngine.joinAuction()` (`server/src/auction-engine/engine/auction.engine.js`), which only looks up an existing room via `roomManager.getRoom(auctionId)` and throws if none exists — nothing in the create-auction flow or the scheduler's `checkScheduledAuctions()` appears to actually create a room in the engine's `roomManager`. Verified this is a backend issue, not a client wiring issue, using a raw `socket.io-client` script talking directly to the API (bypassing the UI entirely) — same failure. The client-side event contract (`join_room` → `room_state`, `submit_bid` → `bid_updated`, correct payload shapes) is implemented and ready; it just has nothing to talk to yet.
- Two missing `npm` dependencies were found and fixed while testing locally (`nodemon`, `razorpay` — both used in code/scripts but absent from `server/package.json`).
- **Payment (Razorpay) module** exists on the backend (`/api/v1/payments/*`) but has no client UI at all yet — explicitly out of scope for this pass, flagged as a separate follow-up.

## Stretch Goals (2026-07-30, all four done)

- [x] **Watchlists & Alerts (SG10)** — `features/watchlist/`. `shared/store/watchlistSlice.js` (Redux, persisted to `localStorage`) holds watched auction ids; `WatchButton.jsx` (shared) is the heart-toggle used on `AuctionCard` and `AuctionDetailsPage`; `/watchlist` (protected route, linked from Navbar) lists watched lots via `useWatchlist` and shows an "Alert" banner when any watched lot is ending within 5 minutes.
- [x] **Scheduled Auctions (SG9)** — `AuctionCreatePage` now has a Start-now / Schedule-for-later toggle with a `datetime-local` picker (min = now); the live preview reflects the choice. `AuctionCard` shows a real ticking "Starts in" countdown for `upcoming` lots (`formatCountdownLong` in `shared/utils/formatTime.js`, day/hour/minute scale instead of the live-room `m:ss` format).
- [x] **Chat Moderation (SG7)** — `useChat` (chat feature) gained `togglePin`/`deleteMessage`/`toggleMuteUser`; `ChatPanel` shows per-message pin/mute/delete icons on hover to any authenticated user (demo has no per-auction "owner" role from the backend yet, so tools are shown to any logged-in user rather than gated to a specific seller — labelled "Moderator tools on" so it reads as a feature showcase, not a real permission model). Pinned message shows in a banner above the list; muted users' messages are filtered out client-side.
- [x] **Auction Replay (SG3)** — `shared/components/BidReplay.jsx` + `shared/data/mockReplay.js`. Shown on `AuctionDetailsPage` when the auction has ended: play/pause + a scrub slider steps through the historical bid list one event at a time.

## Remaining (Domain A)

All core SRS FRs and all four stretch goals are done. What's left is only:

- [ ] Wire profile/dashboard/watchlist to real endpoints once those exist server-side (still mock-data-backed) — auth, discovery, details, create, and real-time bidding/chat are now wired, see "Backend Integration Status" above
- [ ] Real-time bidding can't be smoke-tested until Domain B fixes the `AuctionEngine` room-creation gap noted above
- [ ] Build a Razorpay payment UI once the bidding flow actually works (backend routes already exist)
- [ ] **Before submission:** move `/dashboard` back under `ProtectedRoute` in `app/router.jsx` — currently public for easier local UI review without a working backend login

## Running

```bash
cd client
npm install
npm run dev
```

Production build: `npm run build` — has been verified clean; watch out if editing `index.css`'s inline SVG data URIs, since `lightningcss` (the prod minifier) chokes on raw `#`/`%23` fragment references inside them even though the dev server tolerates it. Base64-encode the SVG instead.

**CSS bar-chart gotcha** (hit in `DashboardPage`'s weekly-bids chart): a percentage `height` only resolves against a parent with an explicit height. Putting the bar and its day-label in the same flex column (auto height) made every bar render at 0px — invisible, no error. Fix: bars are direct children of the fixed-height (`h-32`) container; labels live in a separate row underneath.

## Branching

Feature branches per person, PR into `main` with review before merge.
