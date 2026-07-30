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
    components/   → reusable UI (Button, Badge, Card, Loader, AuroraBackground, CustomCursor, ScrollToTop...)
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
| Seller dashboard (SG13) | — | ⏳ Not started — scope not finalized yet (distinct from `profile`) |

> Note: Timer authority, bid validation/ordering, winner logic — ye sab **Domain B (server)** ki responsibility hai (FR10, FR18, FR19). Domain A abhi local demo state se UI dikhata hai; jab Socket.io events aayenge, `shared/hooks/useAuctionRoom.js` unhi events se driven hoga, UI components change nahi honge.

## Routes

| Path | Page | Protected? |
|---|---|---|
| `/` | Auction Discovery (home) | Public |
| `/login`, `/register` | Auth | Public |
| `/auction/:id` | Auction Details | Public |
| `/auction/:id/spectate` | Spectator View | Public |
| `/profile` | Profile | 🔒 Login required |
| `/auction/create` | Create Auction | 🔒 Login required |
| `/auction/:id/room` | Auction Room (bidding) | 🔒 Login required |

Data Router (`createBrowserRouter`) in `app/router.jsx`, nested under `MainLayout`, with a 404 `errorElement` (`NotFoundPage` — renders outside `MainLayout` since router error elements replace the whole tree, so it mounts its own `AuroraBackground`). `ScrollToTop` (in `MainLayout`) resets scroll position on every route change — React Router doesn't do this by default in a SPA.

## Design System

Vibrant gradient theme with glassmorphism + real 3D elements + a canvas particle network. Went through several iterations (bold editorial → split-flap board → glass orbs alone → constellation alone → combined) — the current version layers **both** the glass orbs and the constellation network rather than picking one.

| Token | Value | Use |
|---|---|---|
| `font-display` | Archivo Black | Big headlines |
| `font-body` | Inter | Body text |
| `font-mono` | Consolas/SF Mono | Bid amounts, timers, stats (tabular nums) |
| `bg-bid-violet` (`#3B0F70`) | Deep violet | Gradient start, glass tint base |
| `bg-bid-magenta` (`#9B2BA6`) | Magenta | Gradient mid |
| `bg-bid-orange` (`#FF6B3D`) | Orange | Gradient end, primary CTA |
| `bg-bid-gold` (`#FFC94D`) | Gold | CTA, shine accent, "ending" status |
| `bg-bid-cyan` (`#4DEEEA`) | Cyan | General "online" presence (not "live") |
| `bg-live-red` (`#FF3B4E`) | Red | "LIVE" status specifically — cyan didn't read as urgent, red matches the universal broadcast convention (YouTube/Twitch/news) |

**Global background** (`AuroraBackground.jsx`, mounted once in `MainLayout`):
1. Gradient base (`.aurora-bg`)
2. Glass-orb spheres (`.orb-layer`) — glossy 3D-looking circles with a highlight/shadow, drift on their own + shift with mouse parallax
3. Canvas constellation network (`.constellation-canvas`) — glowing particles that drift, connect with a faint line when close, and gently repel away from the cursor
4. Film grain overlay

**Glass surfaces** (`.glass` / `.glass-strong`): tinted **violet** (matching the gradient family) at fairly high opacity — a neutral dark tint was tried first and looked muddy against the vivid background.

**Micro-interactions:**
- `CustomCursor.jsx` — a soft glow + ring follow the pointer site-wide (skipped on touch devices and `prefers-reduced-motion`)
- `.btn-shine` (in `Button.jsx`) — a light sweep crosses the button on hover; `.btn-glow-pulse` — a slow breathing shadow, used on the Navbar's Register button to draw the eye
- `.link-underline` — animated underline sweep on nav text links
- `useInView` (IntersectionObserver hook) — `AuctionCard` fades in when scrolled into view instead of animating unconditionally on mount (the earlier version finished animating before below-the-fold cards were ever seen)
- Bid-placed particle burst (`AuctionRoomPage`) — fires from whichever bid button was clicked, using the same visual language as the constellation dots
- Status badges (`live`/`ending`/`upcoming`/`completed`) each communicate state at a glance: `live` = red + white pulsing dot, `upcoming` = violet/magenta gradient + a radar-style "ping" ring, `completed` = muted + a checkmark, `ending` = orange/gold gradient
- `AuctionCard` gets a colored glow ring matching its status (live = red glow) so it reads "hot" without needing to read the badge text
- `LiveAuctionHero` (login/register) has a real layered 3D card stack (perspective/rotateZ/translateZ) with mouse-parallax tilt

All animations respect `prefers-reduced-motion`.

## Responsive

- **Navbar** collapses to a hamburger menu below `md` (too many links to fit one row on mobile) — `shared/layout/Navbar.jsx`
- **Two-column pages** (auction-room, spectator, details, create, login, register) use `grid-cols-1 lg:grid-cols-[…]` explicitly, with `min-w-0` on the grid children — without `min-w-0`, a CSS Grid item won't shrink below its content's min-content width, which was silently causing horizontal scroll on mobile (a real bug caught via a Playwright mobile-viewport pass, not just visual inspection)
- **Discovery filter bar** is `sticky` below the navbar so it stays reachable while scrolling a long list, instead of scrolling away

## Setup Progress

- [x] Feature-wise folder structure + 4-layer architecture
- [x] Redux, Tailwind, React Query, Router, dev proxy (`/api`, `/socket.io` → `http://localhost:5000`, port TBD from Domain B)
- [x] `api/axiosInstance.js` — baseURL + auto token attach
- [x] `auth` — Login/Register, localStorage persistence, `ProtectedRoute`
- [x] Design system + global `AuroraBackground` (orbs + constellation + grain)
- [x] All 7 Domain A features have working UI + hooks + service (mock-data-backed, ready for real API)
- [x] Micro-interactions: custom cursor, scroll-reveal, bid burst, button/link hover animations
- [x] Mobile responsive pass (navbar, grid overflow, sticky filter bar) — verified overflow-free across all pages at 375px width
- [ ] Seller dashboard (scope to be defined — analytics for auctions the user created)
- [ ] Footer (not started — low priority)
- [ ] Wire real endpoints once Domain B's API/Socket.io contract is confirmed (`service/` files already point at the expected routes)

## Running

```bash
cd client
npm install
npm run dev
```

Production build: `npm run build` — has been verified clean; watch out if editing `index.css`'s inline SVG data URIs, since `lightningcss` (the prod minifier) chokes on raw `#`/`%23` fragment references inside them even though the dev server tolerates it. Base64-encode the SVG instead.

## Branching

Feature branches per person, PR into `main` with review before merge.
