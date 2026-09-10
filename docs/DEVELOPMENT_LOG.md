# Development Log — Architecture Decisions by Phase

This is the full phase-by-phase build log: every architectural decision, the reasoning behind it, files added per phase, and each phase's testing steps. Kept for engineering context and onboarding new contributors to *why* the codebase looks the way it does — not required reading to run or ship the app. For that, see the top-level [README.md](../README.md).

---


---

## Phase 1 — Project Architecture ✅

### Objective
Stand up a strict, scalable, feature-based Next.js + TypeScript foundation that every
later phase (design system, auth, database, dashboard, leaderboard, CRUD) builds on
without restructuring.

### Architecture decisions

| Decision | Reasoning |
|---|---|
| **Next.js 14 App Router** | Server Components by default for the public leaderboard (fast, SEO-friendly, no client JS needed to render data); Route Handlers double as the API layer — no separate backend to deploy/maintain. |
| **Feature-based folders** (`features/leaderboard`, `features/teams`, `features/scores`, `features/auth`) | Each feature owns its components + hooks. `components/` stays reserved for generic, cross-feature UI (shadcn primitives, layout shells). Prevents the "one giant components folder" anti-pattern explicitly ruled out in the brief. |
| **`lib/` vs `services/` vs `utils/`** | `lib` = infrastructure singletons (Prisma client, NextAuth config, constants). `services` = business-logic functions that talk to Prisma (e.g. `getLeaderboard()`, `computeRanking()`) — this is the only layer allowed to import `@prisma/client` outside of `lib/prisma.ts`. `utils` = pure, stateless helpers (formatting, sorting) with no I/O. Keeps data access testable and swappable. |
| **Prisma schema normalized around `Event`** | Checkpoints are rows, not fixed columns (`checkpoint1..2`). CodeSprint ships with 2 checkpoints, but a future Labyrinth event with 6 checkpoints needs zero schema changes — just new `Checkpoint` rows. Totals are never stored, only derived, so they can't drift from the source scores. |
| **Strict TypeScript** (`noUncheckedIndexedAccess`, `strict: true`) | Catches null/undefined bugs (e.g. missing checkpoint scores) at compile time rather than at an event, in front of participants. |
| **Path aliases (`@/features/*`, `@/lib/*`, …)** | Avoids `../../../../` imports as the tree grows. |
| **`next.config.mjs` security headers** | Baseline hardening (clickjacking, MIME sniffing) appropriate for an admin-login-bearing site, set once at the platform level instead of per-route. |
| **Centralized `constants.ts`** | Tie-break order, score limits, route paths, and event slug live in one file so "no hardcoded strings/values" is enforced structurally, not just by convention. |
| **NextAuth (Credentials provider) planned for Phase 4** | JWT-based sessions, no external OAuth needed since only organizers (a small, known set) ever authenticate. |

### Folder structure

```
labyrinth-leaderboard/
├── prisma/
│   └── schema.prisma          # Event / Checkpoint / Team / Score / Admin
├── public/
│   └── labyrinth-logo.png
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx               # Landing page        [Phase 3]
│   │   │   └── leaderboard/page.tsx   # Public leaderboard   [Phase 7]
│   │   ├── admin/
│   │   │   ├── login/page.tsx         # Admin login          [Phase 4]
│   │   │   ├── dashboard/page.tsx     # Dashboard overview   [Phase 6]
│   │   │   ├── teams/page.tsx         # Team management      [Phase 8]
│   │   │   └── scores/page.tsx        # Score management     [Phase 8]
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── teams/route.ts
│   │   │   ├── scores/route.ts
│   │   │   └── checkpoints/route.ts
│   │   ├── layout.tsx
│   │   ├── not-found.tsx              # 404 page             [Phase 3]
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/            # shadcn/ui primitives (button, table, card…)
│   │   ├── layout/        # Navbar, Footer, Shell
│   │   └── shared/        # Generic cross-feature components
│   ├── features/
│   │   ├── leaderboard/   # Table, rank badges, search, hooks
│   │   ├── teams/         # Team form, team list, delete confirmation
│   │   ├── scores/        # Score edit grid, save logic
│   │   └── auth/          # Login form
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client singleton      [Phase 5]
│   │   ├── auth.ts        # NextAuth config               [Phase 4]
│   │   └── constants.ts   # ✅ App-wide constants
│   ├── hooks/              # Cross-feature React hooks
│   ├── services/           # Business logic / data access (Prisma callers)
│   ├── types/               # Shared TypeScript types & Zod schemas
│   └── utils/                # Pure helper functions
├── .env.example
├── .eslintrc.json
├── .prettierrc.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Dependencies (see `package.json`)
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix primitives), Framer Motion, lucide-react icons, react-hook-form + zod for validation.
- **Backend:** Next.js Route Handlers, Prisma ORM, PostgreSQL, NextAuth (Credentials + JWT), bcryptjs for password hashing.
- **Tooling:** ESLint + Prettier (with Tailwind class sorting), Husky + lint-staged for pre-commit checks, Vitest for unit tests.

### Setup (run locally — this environment has no network/DB access)

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL and NEXTAUTH_SECRET
npm run db:push             # or db:migrate once schema stabilizes
npm run dev
```

### Testing steps for this phase
1. `npm install` completes with no peer-dependency errors.
2. `npm run typecheck` passes (no source files yet beyond `constants.ts`, so this is a no-op sanity check).
3. `npx prisma validate` confirms `schema.prisma` is syntactically valid.
4. Folder tree matches the structure above exactly.

### Potential improvements (flagged for later phases, not forgotten)
- Add `vitest.config.ts` + first unit tests once `services/` has logic to test (Phase 8/9).
- Add a `prisma/seed.ts` to create the CodeSprint `Event` + 4 `Checkpoint` rows + a default admin (Phase 5).
- Consider `next-auth` v5 (Auth.js) once it's stable on Next 14/15 — staying on v4 for now for documentation maturity and route handler stability.

---

**Next: Phase 2 — Design System** (colors, typography, reusable `ui/` components, theme wiring in `globals.css`). ✅ *(see below)*

---

## Phase 2 — Design System ✅
Colors sampled directly from the logo (`#CC2809` primary red, verified by pixel-sampling), wired as HSL CSS variables in `globals.css`. Full type scale (`H1`–`H4`, `Lead`, `Text`, `Muted`, `Eyebrow`) and the core `ui/` component set (Button, Card, Badge, Input, Table, Skeleton, AlertDialog, Toast). Preview everything at `/dev/design-system`.

## Phase 3 — Landing Page ✅
Hero (logo, title, tagline, countdown, CTAs), About, Features, Timeline, Navbar/Footer, subtle Framer Motion scroll reveals, plus the 404 page.

## Phase 4 — Authentication ✅

### Objective
Secure, organizer-only login — no participant accounts, no self-registration, no "forgot password" flow, per the brief.

### Architecture decisions

| Decision | Reasoning |
|---|---|
| **NextAuth v4, Credentials provider, JWT sessions** | No DB session table needed for a small, trusted admin group; Route Handlers already host the API layer. |
| **`services/admin-service.ts` is the only place that queries `Admin`** | `authorize()` in `lib/auth.ts` calls the service — keeps Prisma access out of the auth config file and testable in isolation. |
| **Timing-safe-ish failure path** | A nonexistent username still runs a dummy `bcrypt.compare` before returning `null`, so response time doesn't leak whether the username exists. Both "no such user" and "wrong password" throw the exact same generic error. |
| **Remember Me via dynamic JWT `maxAge`** | `lib/auth.ts` overrides `jwt.encode` to issue an 8-hour token normally, or a 30-day token when "remember me" is checked — instead of always issuing long-lived sessions (see the code comment for the one known cosmetic limitation around the cookie's own Max-Age header). |
| **No "Forgot Password"** | Explicitly excluded per the brief. Password resets are an out-of-band DB/organizer operation. |
| **No registration UI** | Admin accounts are provisioned via `scripts/create-admin.ts` (`npm run admin:create <username> <password>`), which hashes with bcrypt (12 salt rounds) before writing to the DB. |
| **`middleware.ts` protects `/admin/*` except `/admin/login`** | One regex-based matcher (negative lookahead) instead of guarding each admin page individually — new admin pages are protected automatically. |
| **Security headers already in `next.config.mjs` (Phase 1)** | Clickjacking/MIME-sniffing protection applies to the login page without extra work here. |

### Files added
```
src/lib/prisma.ts                          # Prisma client singleton
src/lib/auth.ts                            # NextAuth config (Credentials + JWT)
src/services/admin-service.ts              # verifyAdminCredentials / touchLastLogin / hashPassword
src/features/auth/validations/login-schema.ts
src/features/auth/components/login-form.tsx
src/features/auth/components/logout-button.tsx
src/features/auth/components/auth-provider.tsx
src/types/next-auth.d.ts                   # Session/JWT type augmentation
src/app/api/auth/[...nextauth]/route.ts
src/app/admin/layout.tsx                   # mounts SessionProvider for /admin/*
src/app/admin/login/page.tsx
src/app/admin/dashboard/page.tsx           # placeholder — full UI in Phase 6
src/middleware.ts                          # route protection
scripts/create-admin.ts                    # admin provisioning CLI
```

### Testing steps
1. `cp .env.example .env`, set `DATABASE_URL` and `NEXTAUTH_SECRET`.
2. `npm run db:push` (needs Phase 5's schema — already defined in `prisma/schema.prisma`).
3. `npm run admin:create organizer1 "a-strong-password" "Priya"`.
4. `npm run dev`, visit `/admin/dashboard` while logged out → redirected to `/admin/login`.
5. Log in with the created credentials → redirected to `/admin/dashboard`, shows "Signed in as organizer1".
6. Click Logout → redirected back to `/admin/login`; `/admin/dashboard` is inaccessible again.
7. Try an invalid username and a valid-username/invalid-password — both show the identical "Invalid username or password." message.

### Potential improvements
- Add request-level rate limiting (e.g. Upstash Redis or Vercel Edge Config) on repeated failed logins — out of scope for a small trusted-admin site today but worth adding before a public-facing deployment.
- Exact cookie `Max-Age` for non-remembered sessions (see comment in `lib/auth.ts`) — currently cosmetic only, not a security gap, since expired JWTs are rejected server-side regardless of the cookie's own lifetime.

---

## Phase 5 — Database ✅

### Objective
Complete the data layer: seed the structural data CodeSprint needs (event + checkpoints), and build every `services/` function the rest of the app will call — most importantly the ranking/tie-break algorithm, since it's the single piece of logic that absolutely cannot be wrong.

### Architecture decisions

| Decision | Reasoning |
|---|---|
| **Ranking algorithm lives in `utils/ranking.ts`, not a service** | It's pure — no Prisma, no I/O, just `TeamWithScores[] → RankedTeam[]`. That makes it trivially unit-testable with plain objects and reusable by both the leaderboard and the dashboard stats service without touching the DB twice. |
| **Missing checkpoint scores default to 0** | Mid-event, not every team has a Checkpoint 2 score yet. Treating "no Score row" as 0 (rather than null/crash) keeps the leaderboard well-defined at every point in the event, in both the total and the tie-break comparison. |
| **Tie-break always terminates in `createdAt`** | Since team creation timestamps are unique, the comparator in `ranking.ts` can never return "still tied" — every team gets a distinct integer rank, satisfying "ranking calculated automatically" cleanly. |
| **`getTeamsWithScores()` is the single query both Leaderboard and Dashboard stats build on** | One Prisma query shape, reused — average score, current leader, and the public leaderboard can never disagree with each other because they're derived from the same `rankTeams()` output. |
| **Seed script creates structure, not fake data** | Per "Do NOT hardcode values," `prisma/seed.ts` only creates the Event + 2 Checkpoints (idempotent via `upsert`). No fake teams/scores — those are real organizer input via Phase 8's CRUD UI. |
| **Duplicate-team-name check is case-insensitive** | The brief says "no duplicate names" — a case-insensitive check (`"Team A"` vs `"team a"`) prevents a more likely real-world duplicate than an exact-match check would. |
| **Score save is a single Prisma transaction** | `saveTeamScores()` upserts all 2 checkpoints for a team in one `$transaction` — a validation failure on checkpoint 2 can't leave checkpoint 1 written while 2 is missing. |
| **Custom error classes (`DuplicateTeamNameError`, `TeamNotFoundError`, `InvalidScoreError`, `EventNotFoundError`)** | Phase 8's API routes will catch these by type to return the right HTTP status (409, 404, 400) instead of parsing error strings. |

### Files added
```
src/types/leaderboard.ts                  # TeamWithScores / RankedTeam domain types
src/utils/ranking.ts                      # pure ranking + tie-break algorithm
src/utils/ranking.test.ts                 # unit tests for the algorithm (Vitest)
vitest.config.ts
src/services/event-service.ts
src/services/checkpoint-service.ts
src/services/team-service.ts              # create/update/delete + duplicate-name guard
src/services/score-service.ts             # validated, transactional score saves
src/services/leaderboard-service.ts       # getTeamsWithScores, getLeaderboard, filterLeaderboard
src/services/dashboard-service.ts         # getDashboardStats
prisma/seed.ts
```

### Testing steps
1. `npm run db:push` (or `db:migrate`) against a real Postgres instance.
2. `npm run db:seed` → creates the CodeSprint event + 2 checkpoints; safe to re-run.
3. `npm run admin:create organizer1 "a-strong-password"` (from Phase 4).
4. `npm test` → runs `src/utils/ranking.test.ts`. All 7 cases (basic ranking, CP4 tie-break, CP2 fallthrough, full-tie-by-createdAt, missing-score-as-zero, empty leaderboard, lastUpdated derivation) should pass.
   - I additionally hand-executed the exact same scenarios with `tsx` against the algorithm directly in this sandbox (no DB/npm install required) and confirmed every output matched the expected order before shipping this phase.
5. `npx prisma studio` to confirm the Event/Checkpoint rows look right after seeding.

### Potential improvements
- Add integration tests for the `services/` layer against a real (or dockerized) Postgres in Phase 9 — this phase's tests intentionally cover only the pure algorithm, which is the highest-risk, highest-value place to start.
- `getDashboardStats` recomputes ranking on every call; fine at CodeSprint's scale (a handful of teams, checkpoint saves happen a few times per event), but would be worth caching if this schema were reused for a much larger future event.

---

**Next: Phase 6 — Admin Dashboard** (real statistics cards wired to `getDashboardStats`, and the dashboard navigation shell replacing today's placeholder page). ✅ *(see below)*

---

## Phase 6 — Admin Dashboard ✅

### Objective
Replace Phase 4's bare-bones placeholder with the real dashboard: statistics cards wired to live data, and a persistent nav shell (Dashboard / Teams / Scores / Logout) shared by every authenticated admin page.

### Architecture decisions

| Decision | Reasoning |
|---|---|
| **New `(authenticated)` route group under `/admin`** | `/admin/login` needs the bare `AuthProvider` layout from Phase 4, but `/admin/dashboard`, `/admin/teams`, `/admin/scores` all need the sidebar shell *and* a session check. A route group lets them share a layout without affecting the URL (`/admin/dashboard` stays `/admin/dashboard`) and without giving the login page a sidebar it shouldn't have. |
| **Session checked again in `(authenticated)/layout.tsx`, on top of `middleware.ts`** | Defense in depth: if middleware is ever misconfigured or disabled for a given deployment target (e.g. an edge runtime quirk), the page-level check still redirects unauthenticated requests rather than rendering admin data. |
| **`DashboardStats` is an async Server Component wrapped in `<Suspense>`** | The stats require a DB round-trip; Suspense lets the page shell (heading, quick-links) paint immediately while `<DashboardStatsSkeleton>` fills in until the query resolves — matches the "loading skeletons" requirement without a client-side fetch/useEffect. |
| **Dashboard route is `force-dynamic`** | Team/score counts change whenever an organizer saves scores; statically caching this page would show stale numbers. |
| **`EventNotFoundError` renders a friendly setup card instead of crashing** | If `npm run db:seed` hasn't been run yet, the dashboard should say so, not throw a 500. |
| **Nav links defined in `admin-nav-links.ts`, not inline in the sidebar** | Same "content as data" pattern as the landing page — adding a 5th admin section later is a one-line data change. |
| **Mobile: bottom tab bar instead of a hidden hamburger drawer** | Matches how Linear/Vercel-style dashboards handle mobile nav — always visible, no extra tap to open a drawer, and keeps the "never break the layout" responsive requirement trivially true. |

### Files added
```
src/components/layout/admin-nav-links.ts
src/components/layout/admin-sidebar.tsx     # desktop sidebar + mobile top bar + mobile bottom nav
src/components/layout/admin-shell.tsx
src/features/dashboard/components/stat-card.tsx
src/features/dashboard/components/dashboard-stats.tsx
src/features/dashboard/components/dashboard-stats-skeleton.tsx
src/utils/format.ts                          # formatRelativeTime / formatDateTime / formatScore
src/app/admin/(authenticated)/layout.tsx
src/app/admin/(authenticated)/dashboard/page.tsx   # replaces the Phase 4 placeholder
src/app/admin/(authenticated)/teams/page.tsx       # placeholder — full CRUD in Phase 8
src/app/admin/(authenticated)/scores/page.tsx      # placeholder — full CRUD in Phase 8
```

### Testing steps
1. Log in (Phase 4 flow) → land on `/admin/dashboard`.
2. With zero teams seeded: cards show "Total Teams: 0", "Current Leader: —", "Average Score: —", "Last Updated: No scores yet" — no crashes, no `NaN`.
3. Confirm the sidebar highlights "Dashboard" as active; click "Teams" / "Scores" → placeholder pages load, sidebar highlights update accordingly.
4. Resize to mobile width → sidebar becomes a top bar + bottom tab nav; content isn't clipped underneath the fixed bottom nav (note the `pb-20` on the content area in `AdminShell`).
5. Log out from the sidebar → redirected to `/admin/login`; `/admin/dashboard` becomes inaccessible again (both middleware and the layout-level check verified).
6. Temporarily rename the event slug in `.env` to something unseeded → dashboard shows the "Event not set up yet" card instead of erroring.

### Potential improvements
- Once Phase 8 ships real teams/scores, add a "Recent Activity" feed (last N score saves) to the dashboard — deferred since it needs the score-history shape CRUD will introduce.
- Consider auto-revalidating the dashboard on an interval (e.g. `revalidate: 30`) if organizers keep the dashboard open in a background tab during live scoring — not required since they primarily interact via the Scores page, which will always show fresh data on load.

---

**Next: Phase 7 — Leaderboard** (the public-facing page: full table, top-3 highlighting, search, mobile card view, empty state). ✅ *(see below)*

---

## Phase 7 — Leaderboard ✅

### Objective
The actual point of this whole website: a fast, correct, good-looking public leaderboard.

### Architecture decisions

| Decision | Reasoning |
|---|---|
| **`getLeaderboardView()` fetches checkpoints + ranked teams in one `Promise.all`** | The page needs both (checkpoint labels for columns, ranked teams for rows) — one round trip instead of two sequential ones. |
| **Dates serialized to ISO strings crossing the server→client boundary** | `LeaderboardRow.lastUpdated` is `string \| null`, not `Date`, so the props passed from the Server Component page into the Client Component `LeaderboardView` are unambiguous plain JSON, not dependent on RSC's Date-serialization behavior. |
| **Search + pagination live in a client hook (`useLeaderboardFilter`), not on the server** | With a hackathon-scale team count, filtering the already-fetched array client-side is instant and avoids a network round trip per keystroke. I hand-verified the hook's filtering/pagination/page-clamping logic against 6 scenarios (5 teams, exactly 20, 45 across pages, a shrinking search resetting a stale page number, zero matches) before shipping. |
| **Pagination only renders above 20 teams** (`LEADERBOARD_PAGE_SIZE`) | Directly satisfies "Pagination only if necessary" — exactly 20 teams still renders as one page. |
| **Table (desktop) and Cards (mobile) are two separate components, not one component with conditional JSX** | Keeps each layout's markup simple and independently tunable, per "on mobile convert leaderboard to cards" — `hidden sm:block` / `sm:hidden` swaps them at the breakpoint, never both in the DOM animating oddly. |
| **Top-3 highlighting = badge (🥇🥈🥉ᴺ) + subtle row/card tint**, reusing the `gold`/`silver`/`bronze` tokens from Phase 2 | Distinct without becoming "overly colorful" — a tint at 5-6% opacity, not a solid fill. |
| **Two distinct empty states** (`no-teams` vs `no-results`) | "No teams exist yet" (organizers haven't started) reads very differently from "no teams match your search" (organizers have entered teams, participant's query just doesn't match) — collapsing them into one message would be confusing. |
| **`RefreshButton` calls `router.refresh()`** | Makes the brief's "no real-time sync — participants simply refresh" model a first-class, one-tap UI action instead of relying on a full browser reload. |
| **`export const dynamic = 'force-dynamic'`** | Leaderboard data changes whenever an organizer saves scores; this page must never serve a stale statically-cached response. |
| **`EventNotFoundError` renders a calm "not set up yet" state**, matching the dashboard's Phase 6 pattern | Consistent error handling across every page that depends on the seeded event. |

### Files added
```
src/utils/search.ts                                  # matchesSearch (reused in Phase 8's team search too)
src/features/leaderboard/types.ts                     # LeaderboardRow, CheckpointColumn
src/features/leaderboard/hooks/use-leaderboard-filter.ts
src/features/leaderboard/components/rank-badge.tsx
src/features/leaderboard/components/leaderboard-search.tsx
src/features/leaderboard/components/leaderboard-table.tsx     # desktop
src/features/leaderboard/components/leaderboard-cards.tsx     # mobile
src/features/leaderboard/components/leaderboard-pagination.tsx
src/features/leaderboard/components/leaderboard-empty-state.tsx
src/features/leaderboard/components/leaderboard-view.tsx      # client orchestrator
src/features/leaderboard/components/refresh-button.tsx
src/app/(public)/leaderboard/page.tsx
```
Also extended `services/leaderboard-service.ts` with `getLeaderboardView()`, and `lib/constants.ts` with `LEADERBOARD_PAGE_SIZE`.

### Testing steps
1. Seed the event + create a few teams with varying scores directly via `prisma studio` (Phase 8 will add the real UI) → visit `/leaderboard` → confirm rank order matches Phase 5's verified algorithm, ranks 1-3 are visually highlighted, and desktop shows a table while a narrow viewport shows cards.
2. Type into the search box → list narrows instantly, count updates ("N teams"); clear it → full list returns.
3. Seed 21+ teams → pagination controls appear; seed exactly 20 → they don't. Navigate pages, confirm Previous/Next disable at the boundaries.
4. Search down to a result set with a stale page 3 selected → page auto-clamps back to page 1 (verified via the hand-run scenario in this phase's build log).
5. Search for a nonsense string → "No teams match your search" state, not the "No teams yet" state.
6. With zero teams in the DB → "No teams yet" state instead.
7. Click Refresh → button spins briefly, page data re-fetches (`router.refresh()`), no full-page reload.
8. Point `NEXT_PUBLIC_ACTIVE_EVENT_SLUG` at an unseeded slug → the "leaderboard isn't set up yet" state renders instead of an error page.

### Potential improvements
- If a future Labyrinth event has a genuinely large number of checkpoints (not just 4), the desktop table's horizontal scroll (built into the shared `Table` component from Phase 2) already handles overflow gracefully — no changes needed there.
- Consider server-side search/pagination only if a future event's team count grows into the hundreds; not needed at CodeSprint's scale.

---

**Next: Phase 8 — CRUD Operations** (replacing the Teams/Scores placeholders with real add/edit/delete team management and the editable score-entry grid). ✅ *(see below)*

---

## Phase 8 — CRUD Operations ✅

### Objective
Replace both Phase 6 placeholders with real, validated, mutation-capable UI: full team management, and the editable score-entry grid.

### Architecture decisions

| Decision | Reasoning |
|---|---|
| **Route Handlers under `/api/teams` and `/api/scores`, guarded twice** | `middleware.ts` now also matches `/api/teams/:path*` and `/api/scores/:path*`; each handler additionally calls `requireAdminSession()` itself — the same defense-in-depth pattern as the authenticated layout, so these mutation endpoints are safe even if middleware config ever drifts. |
| **`handleApiError()` maps typed service errors to HTTP status once, centrally** | `DuplicateTeamNameError` → 409, `TeamNotFoundError`/`EventNotFoundError` → 404, `InvalidScoreError` → 400. Every route's catch block is one line instead of re-implementing this switch. |
| **Zod schemas shared between client forms and API routes** | `teamNameSchema` and `saveScoresSchema` live in `features/*/validations/` and are imported by both the React Hook Form on the client and the route handler on the server — the same rule, enforced in two places, defined once. |
| **Score save is per-team, not global "Save All"** | Matches how organizers actually work a checkpoint: walk the room, score one team, move on. A per-row `Save` button (disabled until that row is actually edited) avoids accidentally re-submitting unrelated teams' unchanged scores. |
| **Total is computed client-side live from the current inputs, and is never an editable field** | Directly satisfies "Total should NOT be editable. Total must be calculated automatically" — there's no total input to disable-and-fake; the number displayed *is* `sum(checkpoint inputs)`, recomputed on every keystroke. |
| **Client-side score validation mirrors the server's exactly** (integer, 0-1000) | Catches mistakes before a network round trip, but the server (`assertValidScore` in `score-service.ts`) is still the real authority — a client bypass can't write bad data. I hand-verified both the server and client validators against the same boundary cases (0, 1000, -5, 1001, 12.5) plus the duplicate-name check (exact match, case-insensitive match, and whitespace) before shipping. |
| **Save response includes the recalculated rank + total for that team** | `/api/scores` re-runs `getLeaderboard()` after saving and returns the affected team's new rank — the confirmation toast can say "now rank #2" instead of a generic "Saved," directly surfacing "recalculate ranking" as a visible outcome of saving. |
| **Delete requires an `AlertDialog` confirmation naming the team and warning scores are removed too** | Satisfies "Confirmation before deletion" and is explicit about the cascade (Prisma's `onDelete: Cascade` from Phase 1) rather than silently losing score history. |
| **Add/Edit share one `TeamFormDialog` component** (`mode: 'create' \| 'edit'`) | The form, validation, and submit-error handling are identical; only the HTTP verb/URL and dialog copy differ. |

### Files added
```
src/lib/api-auth.ts                          # requireAdminSession()
src/lib/api-response.ts                       # apiError / apiSuccess / handleApiError
src/components/ui/dialog.tsx                  # Radix Dialog primitive (add/edit team modal)
src/features/teams/types.ts
src/features/teams/validations/team-schema.ts
src/features/teams/components/team-form-dialog.tsx
src/features/teams/components/delete-team-dialog.tsx
src/features/teams/components/team-list.tsx
src/features/scores/types.ts
src/features/scores/validations/score-schema.ts
src/features/scores/components/score-input.tsx
src/features/scores/components/score-row.tsx
src/features/scores/components/score-grid.tsx
src/app/api/teams/route.ts                    # POST (create)
src/app/api/teams/[teamId]/route.ts           # PATCH (rename), DELETE
src/app/api/scores/route.ts                   # POST (save all checkpoints for a team)
```
Also extended `services/score-service.ts` with `listTeamsWithScores()` (checkpointId-keyed, for editing — distinct from the checkpoint-order-keyed shape `leaderboard-service` uses for ranking), rewrote `app/admin/(authenticated)/teams/page.tsx` and `.../scores/page.tsx` from placeholders to real data-driven pages, and extended `src/middleware.ts`'s matcher.

### Testing steps
1. **Add:** Teams page → Add Team → try an empty name (client validation blocks it) → add "Byte Bandits" → toast confirms, list updates.
2. **Duplicate name:** try adding "byte bandits" (different case) → 409 from the API, form shows "A team named... already exists."
3. **Edit:** rename a team → list updates, leaderboard reflects the new name immediately.
4. **Delete:** click delete → confirmation dialog names the team and mentions score removal → confirm → team and its scores are gone from both the Teams page and the public leaderboard.
5. **Scores:** open Scores page → edit Checkpoint 2 for a team → watch the Total cell update live as you type, before saving → click Save (disabled until you've actually changed something) → toast reports the new total and rank → `/leaderboard` reflects the change on refresh.
6. **Validation:** try saving a negative score, a decimal (e.g. `12.5`), and a score over 1000 → each is rejected client-side with the exact message the server would also give.
7. **Auth boundary:** with a valid session cookie stripped (e.g. an incognito tab), directly `POST` to `/api/teams` → 401, not a 500 or a silent success.

### Potential improvements
- Bulk "Save All Rows" for organizers scoring many teams at once at a single checkpoint — deferred since per-team save matches the described workflow ("scores are manually entered... after every evaluation checkpoint") and keeps each save's blast radius to one team.
- Optimistic UI updates (updating the row before the network response returns) — skipped in favor of the simpler, more obviously-correct "disable inputs while saving, then reconcile" approach, appropriate for a low-frequency admin action rather than a high-frequency one.

---

**Next: Phase 9 — Testing** (expanding beyond the Phase 5 ranking unit tests: service-layer tests, and a documented manual QA pass across every phase's testing steps above).
