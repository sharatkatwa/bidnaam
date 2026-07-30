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
| Real-Time | Socket.io-client (Domain B ke sath integration, abhi wire nahi hua) |

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

- [x] **Auth (login/register) wired to Domain B's real API** (2026-07-30) — `axiosInstance` baseURL is now `/api/v1` (was `/api`, Domain B mounts routes under `/api/v1`), `vite.config.js` proxy target updated to `http://localhost:3001` (Domain B's coded default port — confirm with Sharat if his local `.env` overrides `PORT`). `authService.js` unwraps the real response envelope (`{ success, message, data: { user, accessToken, refreshToken } }`) instead of the old assumed flat `{ user, token }` shape.
  - Backend's `User` model has **no `name` field** — register only persists `email`/`password`. The Register form still collects a name for a nicer UX, but it's kept **client-side only** (`useRegister` reads it from the mutation's `variables`, not the server response) and never sent to the API. For login (and any future session where we only have `email`), display name falls back to the email's local-part (`email.split("@")[0]`).
  - Login/Register error messages now show the real backend message (e.g. "Invalid email or password") via `err.response?.data?.message`, falling back to a generic string only if that's missing.
  - **Not wired / gaps found while integrating:** `/auth/forgot-password` has no matching backend route yet (`useForgotPassword` will fail against a real server — same as before, just now a real 404 instead of a fake one); `/auth/me` and `/auth/refresh` exist on the backend but aren't called from the client yet (would matter for persisting a session across reloads via cookie instead of just localStorage — not done, out of scope for this pass).
  - **Not tested end-to-end** — this environment has no local MongoDB and the server's `node_modules`/`.env` aren't present, so this was verified by careful reading of the actual controller/model/middleware code, not a live request. Please smoke-test login/register yourself once both servers are running.

## Stretch Goals (2026-07-30, all four done)

- [x] **Watchlists & Alerts (SG10)** — `features/watchlist/`. `shared/store/watchlistSlice.js` (Redux, persisted to `localStorage`) holds watched auction ids; `WatchButton.jsx` (shared) is the heart-toggle used on `AuctionCard` and `AuctionDetailsPage`; `/watchlist` (protected route, linked from Navbar) lists watched lots via `useWatchlist` and shows an "Alert" banner when any watched lot is ending within 5 minutes.
- [x] **Scheduled Auctions (SG9)** — `AuctionCreatePage` now has a Start-now / Schedule-for-later toggle with a `datetime-local` picker (min = now); the live preview reflects the choice. `AuctionCard` shows a real ticking "Starts in" countdown for `upcoming` lots (`formatCountdownLong` in `shared/utils/formatTime.js`, day/hour/minute scale instead of the live-room `m:ss` format).
- [x] **Chat Moderation (SG7)** — `useChat` (chat feature) gained `togglePin`/`deleteMessage`/`toggleMuteUser`; `ChatPanel` shows per-message pin/mute/delete icons on hover to any authenticated user (demo has no per-auction "owner" role from the backend yet, so tools are shown to any logged-in user rather than gated to a specific seller — labelled "Moderator tools on" so it reads as a feature showcase, not a real permission model). Pinned message shows in a banner above the list; muted users' messages are filtered out client-side.
- [x] **Auction Replay (SG3)** — `shared/components/BidReplay.jsx` + `shared/data/mockReplay.js`. Shown on `AuctionDetailsPage` when the auction has ended: play/pause + a scrub slider steps through the historical bid list one event at a time.

## Remaining (Domain A)

All core SRS FRs and all four stretch goals are done. What's left is only:

- [ ] Wire remaining endpoints (auctions, bids, profile, dashboard, watchlist) to Domain B's real API once those routes exist — only auth (login/register) is wired so far, see "Backend Integration Status" above
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
