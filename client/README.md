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
    components/   → reusable UI (Button, Badge, Card, Loader, AuroraBackground...)
    data/         → cross-feature mock data (e.g. mockRoom.js)
    hooks/        → cross-feature hooks (e.g. useAuctionRoom — used by auction-room AND spectator)
    layout/       → Navbar, MainLayout, ProtectedRoute
    store/        → redux slices (authSlice)
    utils/        → helpers (formatCurrency, formatCountdown)
```

**Layer rule:** `hooks`/`service`/`data` are private to their own feature and must not be imported by other features — if 2+ features genuinely need the same logic (like `useAuctionRoom`), it gets promoted to `shared/`. A feature's `ui` components, however, can be composed into another feature's page (e.g. `ChatPanel` from `chat/ui/` is embedded directly in `auction-room` and `spectator` pages) — `ui` is a feature's public surface.

**Mock-data pattern:** hooks call the real service function first; if there's no data yet (backend not built), they fall back to static mock data (`query.data ?? mockX`) so the UI is always demoable. No fake/randomized backend simulation — that was tried and removed (kept things simple, avoided pretending to be Domain B).

## Domain A — Feature List (mapped to SRS FRs)

| Feature folder | SRS Requirement | Status |
|---|---|---|
| `auth` | FR1, FR2 | ✅ Login + Register, real form, persisted session |
| `profile` | FR3 | ✅ Stats, bid history, my auctions |
| `auction-create` | FR4 | ✅ Listing form with live preview card |
| `auction-discovery` | FR5, FR6 | ✅ Filterable grid + Auction Details page (pre-room landing, auth-aware CTA) |
| `auction-room` | FR7, FR9, FR14, FR15, FR16 | ✅ Bidding UI, timer, heat meter, timeline, chat |
| `spectator` | FR8 | ✅ Read-only room view (no bid controls), same live data + chat |
| `chat` | FR17 | ✅ `ChatPanel` embedded in auction-room + spectator |

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

Data Router (`createBrowserRouter`) in `app/router.jsx`, nested under `MainLayout`, with a 404 `errorElement`.

## Design System

Vibrant gradient theme with glassmorphism + real 3D elements. Went through a few iterations (bold editorial → split-flap board → this) before landing here — see conversation history if curious why.

| Token | Value | Use |
|---|---|---|
| `font-display` | Archivo Black | Big headlines |
| `font-body` | Inter | Body text |
| `font-mono` | Consolas/SF Mono | Bid amounts, timers, stats (tabular nums) |
| `bg-bid-violet` (`#3B0F70`) | Deep violet | Gradient start, glass tint base |
| `bg-bid-magenta` (`#9B2BA6`) | Magenta | Gradient mid |
| `bg-bid-orange` (`#FF6B3D`) | Orange | Gradient end, primary CTA |
| `bg-bid-gold` (`#FFC94D`) | Gold | CTA, shine accent, "ending" status |
| `bg-bid-cyan` (`#4DEEEA`) | Cyan | "Live" status, eyebrow accents |

- **Global background** (`AuroraBackground.jsx`, mounted once in `MainLayout`): gradient + soft ambient blobs + 4 crisp "glass orb" spheres (radial-gradient with highlight/shadow, look genuinely 3D) that drift on their own and parallax-shift with the mouse + film grain overlay.
- **Glass surfaces** (`.glass` / `.glass-strong` CSS classes): tinted **violet** (matching the gradient family, not a neutral grey/black) at fairly high opacity — a neutral-tint glass was tried first and looked muddy/mismatched against the vivid background, so the tint was changed to match the palette.
- **3D interactions:** `LiveAuctionHero` (login/register) has a real layered card stack with perspective/rotateZ/translateZ + mouse-parallax tilt. `AuctionCard` (discovery grid) tilts toward the cursor on hover with a dynamic shadow, and gets a colored glow ring based on status (live = cyan glow, so live lots read as "hot" at a glance without reading the badge text).
- Badges (`live`/`ending`/`upcoming`/`completed`) are bold, glowing, and the `live` badge has a small pulsing dot — meant to be readable from a distance, not just up close.
- All animations respect `prefers-reduced-motion`.

## Setup Progress

- [x] Feature-wise folder structure + 4-layer architecture
- [x] Redux, Tailwind, React Query, Router, dev proxy (`/api`, `/socket.io` → `http://localhost:5000`, port TBD from Domain B)
- [x] `api/axiosInstance.js` — baseURL + auto token attach
- [x] `auth` — Login/Register, localStorage persistence, `ProtectedRoute`
- [x] Design system + global `AuroraBackground`
- [x] All 7 Domain A features have working UI + hooks + service (mock-data-backed, ready for real API)
- [ ] Footer (not started — low priority)
- [ ] Wire real endpoints once Domain B's API/Socket.io contract is confirmed (`service/` files already point at the expected routes)

## Running

```bash
cd client
npm install
npm run dev
```

## Branching

Feature branches per person, PR into `main` with review before merge.
