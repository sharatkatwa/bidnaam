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
- [x] Router setup (`app/router.jsx` + `MainLayout` + placeholder pages per feature)
- [x] Dev proxy setup (`vite.config.js` → `/api`, `/socket.io` forward to backend)
- [ ] `api/` axios instance
- [ ] `shared/layout` Navbar/Footer (structure hai, content baaki)
- [ ] Feature implementation (auth → discovery → auction-room → create → profile → spectator → chat)

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
| `app/router.jsx` | `createBrowserRouter` — saare routes yahan define hain, feature ki `ui/` pages ko point karte hain |
| `features/*/ui/*Page.jsx` | Placeholder entry pages (Login, Register, Profile, AuctionCreate, AuctionDiscovery, AuctionDetails, AuctionRoom, Spectator) — abhi sirf heading, real UI baad mein banega |
| `main.jsx` | `App.jsx` (Vite demo) hata diya. Root ab: `Provider` (Redux) → `QueryClientProvider` (React Query) → `RouterProvider` (Router) |

## Running

```bash
cd client
npm install
npm run dev
```

## Branching

Feature branches per person, PR into `main` with review before merge.
