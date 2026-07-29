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
| Real-Time | Socket.io-client (Domain B ke sath integration) |

## Architecture: Feature-Based + 4-Layer

Har feature apne aap mein self-contained hai. Koi bhi feature dusre feature ke internal folder ko directly import nahi karega — sirf `shared/` se common cheezein use hongi.

```
src/
  api/            → global axios instance (baseURL, interceptors, auth token attach)
  app/            → app-level setup: store config, router config, providers
  features/
    <feature>/
      data/       → constants, types/shapes, static/mock data
      service/    → API call functions (axios) + socket event handlers for that feature
      hooks/      → business logic — custom hooks (useX) using service + store/query
      ui/         → presentational components (JSX only, no direct API/store calls)
  shared/
    components/   → reusable dumb components (Button, Input, Card, Modal, Loader...)
    data/         → app-wide constants (routes list, roles, statuses)
    layout/       → Navbar, Footer, MainLayout, ProtectedRoute
    store/        → redux slices that are cross-feature (e.g. authSlice used everywhere)
    utils/        → helpers (formatDate, formatCurrency, debounce...)
```

**Data flow rule:** `ui` → calls `hooks` → `hooks` call `service` (API) and/or read `store`/`query cache` → `service` talks to `api/` (axios) or Socket.io.

## Domain A — Feature List (mapped to SRS FRs)

| Feature folder | SRS Requirement | Kya banega |
|---|---|---|
| `auth` | FR1, FR2 | Register, Login, session handling |
| `profile` | FR3 | User stats: auctions created/won, bid history |
| `auction-create` | FR4 | Listing form: title, description, image, start bid, duration |
| `auction-discovery` | FR5, FR6 | Browse/filter auctions (upcoming/active/completed), details page |
| `auction-room` | FR7, FR9, FR10*, FR14, FR15, FR16, FR18*, FR19* | Live bidding UI, timer display, stats, bid submission (*server-driven, UI only renders) |
| `spectator` | FR8 | Read-only view of an active room (no bid controls) |
| `chat` | FR17 | Room-level live chat (isolated — failure must not break bidding UI) |

> Note: Timer, bid validation, ordering, winner logic — ye sab **Domain B (server)** ki responsibility hai. Domain A sirf socket events sun ke UI update karta hai, kabhi khud state decide nahi karta (NFR 4.2 — backend is single source of truth).

## Setup Progress

- [x] Feature-wise folder structure + 4-layer architecture
- [x] Dependencies installed: redux toolkit, react-redux, react-query, axios, react-router, tailwind
- [x] Redux store setup (`app/store.js` + `shared/store/authSlice.js` + `Provider` in `main.jsx`)
- [x] Tailwind wiring (vite config + index.css)
- [x] React Query provider setup (`app/queryClient.js` + `QueryClientProvider` in `main.jsx`)
- [x] Router setup — Data Router (`createBrowserRouter`) with `MainLayout` + placeholder pages + 404 `errorElement`
- [x] Dev proxy setup (`vite.config.js` → `/api`, `/socket.io` forward to backend)
- [x] `api/` axios instance (`axiosInstance.js` — baseURL + auto token attach)
- [x] `auth` feature — Login + Register (service, hooks, ui)
- [x] Auth persistence (localStorage) + `ProtectedRoute` guarding `profile`, `auction/create`, `auction/:id/room` (FR2)
- [x] Design system v2 — vibrant gradient theme (violet/magenta/orange + gold/cyan accents), glassmorphism, 3D card stack, aurora background
- [x] Navbar — auth-aware (Login/Register vs Profile/Create/Logout), glass style
- [ ] Footer (not started)
- [ ] Feature implementation baaki: discovery → auction-room → create → profile → spectator → chat

> ⚠️ Proxy target abhi `http://localhost:5000` assume kiya hai (Domain B ka server abhi pending hai). Jab teammate actual port confirm kare, `vite.config.js` mein update karna.

## Routes

| Path | Page | SRS FR |
|---|---|---|
| `/` | Auction Discovery (home) | FR5 |
| `/login` | Login | FR1, FR2 |
| `/register` | Register | FR1, FR2 |
| `/profile` | Profile | FR3 |
| `/auction/create` | Create Auction | FR4 |
| `/auction/:id` | Auction Details | FR6 |
| `/auction/:id/room` | Auction Room (bidding) | FR7, FR9 |
| `/auction/:id/spectate` | Spectator View | FR8 |

## File Log (kya bana, kyun bana)

| File | Purpose |
|---|---|
| `shared/store/authSlice.js` | Redux slice — auth ka state (`user`, `token`, `isAuthenticated`) + actions (`setCredentials`, `logout`) |
| `app/store.js` | `configureStore` — sab slices ko combine karke ek Redux store banata hai |
| `app/queryClient.js` | React Query ka `QueryClient` — server-data caching config (`staleTime`, `retry`, no refetch-on-focus) |
| `vite.config.js` | `@tailwindcss/vite` plugin + dev `server.proxy` (`/api`, `/socket.io` → `http://localhost:5000`) |
| `src/index.css` | `@import "tailwindcss";` add kiya — sab utility classes available |
| `shared/layout/MainLayout.jsx` | Common wrapper — `<Outlet />` ke through child routes render honge |
| `app/router.jsx` | `createBrowserRouter` (Data Router) — saare routes + `errorElement` (404) yahan define hain, feature ki `ui/` pages ko point karte hain |
| `shared/components/NotFoundPage.jsx` | 404 fallback — galat URL ya route error pe render hota hai |
| `api/axiosInstance.js` | Central axios instance — `baseURL: '/api'` + interceptor jo Redux se token nikal ke `Authorization` header mein attach karta hai |
| `features/auth/service/authService.js` | `loginUser`, `registerUser` — sirf API calls (POST `/auth/login`, `/auth/register`) |
| `features/auth/hooks/useLogin.js`, `useRegister.js` | React Query `useMutation` — service call karte hain, success pe Redux (`setCredentials`) update karte hain |
| `features/auth/ui/LoginPage.jsx`, `RegisterPage.jsx` | Real form UI — Tailwind se style, hooks se connect, loading/error state dikhate hain |
| `shared/store/authSlice.js` (updated) | Ab `localStorage` se persist hota hai — refresh pe login state nahi ukhadta |
| `shared/layout/ProtectedRoute.jsx` | Route guard — `isAuthenticated` false hone pe `/login` pe redirect karta hai |
| `app/router.jsx` (updated) | `profile`, `auction/create`, `auction/:id/room` ab `ProtectedRoute` ke andar nested hain (login required) |
| `src/index.css` (updated) | `@theme` block — custom fonts (Archivo Black, Inter) + colors (`bid-amber`, `bid-indigo`, `bid-lime`) |
| `shared/components/Button.jsx` | Reusable button — primary/secondary/outline variants |
| `shared/components/Badge.jsx` | Status tag — live/ending/upcoming/completed |
| `shared/components/Card.jsx` | Reusable rounded card wrapper |
| `shared/components/Loader.jsx` | Spinning loader for async states |
| `shared/layout/Navbar.jsx` | Auth-aware nav — logged out: Login/Register; logged in: user name, Create Auction, Profile, Logout |
| `shared/layout/MainLayout.jsx` (updated) | Navbar + `AuroraBackground` wired in, sabhi pages ke upar fix rahega |
| `shared/components/AuroraBackground.jsx` | Fixed gradient + 3 drifting blobs + grain texture — global page background |
| `shared/components/LiveAuctionHero.jsx` | Reusable hero: headline, 3D card stack (live bid + countdown), stat counters — used by Login and Register |
| `src/index.css` (v2) | Vite boilerplate hataya, naya vibrant theme + glass/3D-stack/animation CSS classes add kiye |
| `shared/components/Button.jsx`, `Badge.jsx` (updated) | Naye gradient/glass colors se restyled |
| `features/auth/ui/LoginPage.jsx`, `RegisterPage.jsx` (rebuilt) | Split layout — `LiveAuctionHero` + glassmorphic form card |
| `features/*/ui/*Page.jsx` | Placeholder entry pages (Login, Register, Profile, AuctionCreate, AuctionDiscovery, AuctionDetails, AuctionRoom, Spectator) — abhi sirf heading, real UI baad mein banega |
| `main.jsx` | `App.jsx` (Vite demo) hata diya. Root ab: `Provider` (Redux) → `QueryClientProvider` (React Query) → `RouterProvider` (Router) |
| ~~`src/assets/*`, `public/icons.svg`~~ | Removed — `App.jsx` (jo inhe use karta tha) delete ho chuka tha, ye orphan (unused) reh gaye the |

## Design System

Vibrant gradient theme with glassmorphism and a real 3D element — went through several iterations (bold editorial → split-flap board → this) before landing here. See `AuroraBackground.jsx` and `LiveAuctionHero.jsx`.

| Token | Value | Use |
|---|---|---|
| `font-display` | Archivo Black | Big headlines |
| `font-body` | Inter | Body text |
| `font-mono` | Consolas/SF Mono | Bid amounts, timers, stats (tabular nums) |
| `bg-bid-violet` (`#3B0F70`) | Deep violet | Gradient start |
| `bg-bid-magenta` (`#9B2BA6`) | Magenta | Gradient mid |
| `bg-bid-orange` (`#FF6B3D`) | Orange | Gradient end, CTA |
| `bg-bid-gold` (`#FFC94D`) | Gold | CTA, shine accent, "ending" status |
| `bg-bid-cyan` (`#4DEEEA`) | Cyan | "Live" status, eyebrow accents |

**Global background:** `AuroraBackground.jsx` (fixed gradient + 3 drifting blurred blobs + film grain) — mounted once in `MainLayout`, shows through on every page.

**Glass surfaces:** `.glass` / `.glass-strong` CSS classes (frosted, semi-transparent) — used by Navbar and cards instead of solid colors.

**3D card stack:** `LiveAuctionHero.jsx` — 3 layered cards with real CSS `perspective`/`rotateZ`/`translateZ`, auto-floats continuously, tilts further on mouse move. Shows a live-updating bid amount and countdown (currently local demo state — will wire to Socket.io later).

Base components: `Button` (primary/secondary/outline), `Badge` (live/ending/upcoming/completed), `Card`, `Loader` — all in `shared/components/`.

All animations respect `prefers-reduced-motion`.

## Running

```bash
cd client
npm install
npm run dev
```

## Branching

Feature branches per person, PR into `main` with review before merge.
