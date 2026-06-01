# OmniCivic — Multi-Tenant Civic Management Platform

A thoughtful civic complaint platform for residential communities, gated societies, and municipal blocks. Three pieces:

- **`backend/`** — Spring Boot 3.2 / Java 21 / MySQL, port `9090`
- **`platform-frontend/`** — Angular 17 admin/resident/staff portal, port `4200`
- **`company-website/`** — Static marketing site (Live Server on port `5500`)

---

## What's new in this build — UI rebuild ("Garden & Stone")

This package is a **complete UI rewrite** with the same backend underneath. The backend (74 Java files) is **unchanged**. All Angular feature components have been replaced with a coherent design system called **Garden & Stone**, plus a parallel dark **Quiet Operator** treatment for the super admin console.

### Design system at a glance

- **Palette:** stone (warm beige), sage (deep green), amber, warm-red. Quiet Operator: black, amber, soft white.
- **Type:** Fraunces (serif display, italic emphasis), DM Sans (UI body), JetBrains Mono (metadata/code).
- **Motion:** cubic-bezier(0.32, 0.72, 0, 1), 180/380/650ms; pulsing pins on maps; breathing brand mark on community recognition.
- **Tokens defined in:** `platform-frontend/src/styles.scss`

### File → mockup direction map

| File | Direction |
|---|---|
| `platform-frontend/src/styles.scss` + `app.component.{ts,html,scss}` | **Design system** |
| `features/auth/login/login.component.*` | **Direction 06 v2** — Adaptive login: switches between default, community (sage breathing mark + recognition) and super (black terminal block) based on what the user types |
| `features/auth/reset-password/reset-password.component.*` | **Direction 06** — Forced-reset card after first sign-in |
| `features/super-admin/setup/setup.component.*` | **Direction 04** — Quiet Operator dark, one-time bootstrap |
| `features/dashboard/dashboard.component.*` (resident) | **Direction 01 v2** — Three-column home (left rail filters · feed · right rail map + stats), collapses at <1100px |
| `features/dashboard/dashboard.component.*` (admin/staff) | Stats strip + recent activity rows |
| `features/complaints/complaint-list/*` | **Direction 02** — Filter chips + list + slide-in detail panel, role-aware actions (assign/reassign for admin, start/proof for staff, upvote for resident, proof review modal) |
| `features/complaints/submit-complaint/*` | Single-column form with category grid, draggable map pin, photo grid |
| `features/map/*` | **Direction 03** — Full-page map with status filter pills + pulsing pins |
| `features/users/user-list/*` | Tabs by role, create-user modal that displays the temporary password **once** after creation |
| `features/categories/category-list/*` | Card grid with edit, delete, assign-staff actions |
| `features/notifications/notification-list/*` | Icons per type, optimistic unread-dot, optimistic badge decrement via NotificationCountService |
| `features/super-admin/dashboard/*` | **Direction 04** — Quiet Operator dark, 2-col (queue + detail), service requests with 4-char prefix decision panel, communities tab with admin credential surfacing |
| `company-website/index.html` + `styles.css` | **Direction 07 v2** — Hero with cycling preview cards, founder note, vs-WhatsApp comparison, 4-step flow, single pricing card |
| `company-website/request.html` + `request.css` + `request.js` | Multi-section request form with Leaflet map + Nominatim geocoding; preserves the original `POST /service-requests/submit` contract |

### Signature interactions

- **Adaptive login:** typing the first 4 characters of your username (e.g. `mariAB1`) silently fetches the community branding via `/api/community/public/{prefix}` and recolours the page. Typing `@` enters super admin mode (black + terminal). Reverting clears it.
- **Feed ↔ map sync (resident home):** clicking a card flies the map to the pin and pulses it; clicking a pin scrolls the matching card into view and highlights it for ~2s.
- **First-time login hint:** if the username has the digit-suffix pattern, a soft amber hint appears telling them their welcome email has the temporary password.
- **Pulsing pins:** open/in-progress complaints pulse on the map; resolved ones don't.
- **Slide-in detail panel:** complaint detail slides in from the right, dimming the list. Closing returns the URL to `/complaints`.

---

## Project layout

```
omnicivic/
├── README.md                 ← (this file)
├── backend/                  ← Spring Boot — UNCHANGED in this build
└── platform-frontend/
    └── src/
        ├── index.html
        ├── styles.scss       ← Garden & Stone tokens + shared primitives
        └── app/
            ├── app.component.{ts,html,scss}     ← Smart shell (chromeless | sage | dark QO)
            ├── app-routing.module.ts            ← UNCHANGED — same routes as before
            ├── app.module.ts                    ← UNCHANGED
            ├── core/                            ← UNCHANGED (services, guards, interceptors)
            ├── shared/                          ← UNCHANGED (models)
            └── features/
                ├── auth/{login, reset-password}/
                ├── dashboard/
                ├── complaints/{complaint-list, submit-complaint}/
                ├── map/
                ├── users/user-list/
                ├── categories/category-list/
                ├── notifications/notification-list/
                └── super-admin/{setup, dashboard}/
└── company-website/
    ├── index.html            ← Landing — Direction 07 v2
    ├── styles.css            ← Shared landing styles
    ├── request.html          ← Request access form
    ├── request.css
    ├── request.js            ← Submission to /service-requests/submit
    └── config.js             ← UNCHANGED (API base URL)
```

---

## Running locally (unchanged from before)

### 1. Backend

Open `backend/` in IntelliJ. Make sure MySQL is running and set the backend environment values before start:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `MAIL_FROM`
- backend listens on `9090`

The first time you run it, MySQL will populate schema automatically. After startup, the first sign-in must happen at the super-admin setup screen — see step 3.

### 2. Frontend

```
cd platform-frontend
npm install
ng serve --proxy-config proxy.conf.json
```

App is at http://localhost:4200/. The proxy forwards `/api` to `localhost:9090`.

### 3. Company website

Open `company-website/index.html` with Live Server in VS Code (typically http://localhost:5500/).

### 4. First-time flow

1. Visit `http://localhost:4200/setup` — provision the first super admin.
2. Sign in as that super admin → go to **Service requests** tab.
3. From the company website (`http://localhost:5500/`), submit a community request.
4. Back in the super admin console, approve the request — pick a 4-char prefix (e.g. `MAR2`).
5. The community admin gets their welcome email. They sign in at `http://localhost:4200/login` using their full username (which begins with the prefix), are forced to set a new password, and land in the community admin dashboard.

---

## What didn't change

- All 74 Java files in `backend/` — entities, services, controllers, JWT filter, AOP audit, Haversine duplicate detection, email service, proof workflow.
- Routing (`app-routing.module.ts`) and all route paths/guards.
- `AuthService`, `ApiService`, `NotificationCountService`, `JwtInterceptor`, `AuthGuard`, `environments/*`, `shared/models/models.ts`.
- API contracts — every endpoint signature is identical.

---

## Known constraints

- The app supports modern evergreen browsers; CSS `color-mix()` is used in two places (login community-mode tint, notifications hover) and gracefully degrades on older browsers.
- The map uses tiles from `tile.openstreetmap.fr` (HOT style) — free for development; for production usage you should switch to a paid tile provider or self-host.
- Geocoding on the request form uses Nominatim — free but rate-limited; for production usage, consider a paid geocoder.

---

Built with care for communities that prefer the work gets done. 🌿
