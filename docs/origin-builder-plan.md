# Origin Builder — Project Plan (v1.0, MVP-first)

> Working spec for a State of Origin team builder web app.
> This plan is intentionally minimal. Earlier versions over-engineered. This one is built MVP-first: get a draggable player onto a field position as fast as possible, then add the rest.

---

## 1. Product summary

Single-page React web app where users build State of Origin (NSW Blues or QLD Maroons) rugby league lineups. Core flow: pick a team → drag players from a side panel onto a formation field → save → optionally share a read-only snapshot link.

Built solo, for around 50 friends to use. Not a public product. Not monetised.

---

## 2. Decisions locked in

| Area | Decision |
|---|---|
| Player pool | 28 fictional players per team, hardcoded as a JS array initially, moved to Supabase in Phase 2 |
| Player fields | name, club, eligible categories, photo (silhouette only in v1), rating (0–99) |
| Position categories | Three categories group the field positions: **Backs** (1–5), **Halves** (6–7), **Forwards** (8–13). Each player has one or more eligible categories. Lineup-level "loose mode" toggle disables the restriction for field positions. |
| Squad size per lineup | 13 field positions + 6-slot bench (positions 14–19). Bench is unrestricted — any player can go on any bench slot, no eligibility or team check. Bench-to-bench drags swap players. |
| Team per lineup | One — NSW or QLD chosen at creation, immutable thereafter |
| Field style | FIFA/Football Manager formation view (flat stylized; design handled separately) |
| Device | Desktop only in v1 |
| Sharing | Read-only snapshot link. Player data frozen into snapshot at share time. Phase 2 only. |
| Saved lineup content | 19 positions (1–13 field, 14–19 bench) + name + team + timestamps. No notes, no captain/kicker flags. |
| Dashboard | Simple list: name, team, date modified |
| Player management | Hardcoded JS array in Phase 1; Supabase Table Editor in Phase 2 |
| AI builder | Claude Code (terminal / VS Code) |
| Who's involved | Solo — one person developing, managing player data, and testing |
| Hosting | Netlify (Phase 2 only — no deployment until there's a working app) |
| Audience | ~50 people, private link shared personally |
| Errors | `console.error` + React error boundary. No external tracking. |
| Analytics | None |
| Storage strategy | Local-first. Component state during the MVP, then localStorage, then Supabase in Phase 2 |
| Auth in Phase 1 | None — single-user assumption. Real auth comes in Phase 2 with Supabase. |

## 3. What's deliberately not in the stack

These were considered and cut to keep the app boring and fast to build:

- **TypeScript** — plain JavaScript + JSX. The app is small enough that type errors will surface quickly via manual testing. Revisit if the codebase grows.
- **Storybook** — overkill for a solo dev. Components get tested by being used in the actual app.
- **Tailwind** — replaced by CSS Modules (one `.module.css` file per component, scoped automatically by Vite).
- **Vitest / Playwright / React Testing Library** — no automated tests in v1. Manual verification is the rule. The rule-functions spec doubles as a manual checklist.
- **Storybook stories, `data-testid` discipline, `npm run verify` script** — all served the testing strategy. With no tests, all gone.
- **React Hook Form + Zod** — Phase 2 has a couple of small forms (signup, login, new lineup). Plain HTML form handling is fine.
- **Pre-Supabase deployment** — no Netlify until there's something worth deploying. Add Netlify when Supabase is being added.
- **CI / GitHub Actions** — same logic. No CI on an app with no tests.

The trade-off: catching bugs is on the human (you), not the toolchain. For an app this size with one developer, that's fine. If you find yourself fixing the same bug twice, that's the signal to add a test for it.

---

## 4. Tech stack

**Frontend**
- **React 18 + Vite** — plain JS, no TypeScript. Vite gives fast dev server and bundling out of the box.
- **CSS Modules** — `Component.module.css` next to each component. Vite handles them natively.
- **dnd-kit** — drag-and-drop library. Supports custom collision detection (needed for magnetic snap) and keyboard accessibility.
- **Zustand** — small, simple client state store for the lineup builder.
- **React Router** — routing.
- **shadcn/ui** — pulled in only when a specific component is needed (Dialog, Dropdown, etc.). Not set up upfront.

**Phase 2 additions only**
- **Supabase** — Postgres, Auth, Row-Level Security.
- **TanStack Query** — server state caching, optimistic updates. Adds value when there's a server; useless before that.

**Tooling**
- **ESLint** with whatever Vite ships by default. No strict rules.
- **Prettier** optional — Claude Code will format consistently anyway.

That's it. Five frontend libraries (six counting shadcn when needed). Two more added in Phase 2.

---

## 5. Data shapes

No TypeScript, but the data shapes still need to be agreed. Documented in JSDoc-style comments and prose. The app uses plain JavaScript objects matching these shapes.

### Player

```js
// Example
{
  id: "p_001",                       // string, unique
  name: "Jarrah Whitlock",            // string
  club: "Sydney Harbourhawks",        // string
  team: "NSW",                        // "NSW" or "QLD"
  eligibleCategories: ["backs"],     // subset of ["backs","halves","forwards"]
  rating: 92,                         // integer 0..99
  photoUrl: null,                     // ignored in v1; silhouette rendered regardless
}
```

### Lineup

```js
// Example
{
  id: "l_abc123",                    // string, unique
  team: "NSW",                        // "NSW" or "QLD" — immutable after creation
  name: "My Origin I lineup",         // string
  looseMode: false,                   // boolean
  slots: [
    { position: 1,  playerId: "p_001" },
    { position: 2,  playerId: "p_003" },
    // ... through position 13 (field) ...
    { position: 14, playerId: "p_023" },
    // ... through position 19 (bench) ...
    { position: 19, playerId: null },
  ],                                  // length 19; positions 1..13 = field, 14..19 = bench
  version: 1,                         // bumped on save (used for conflict detection in Phase 2)
  createdAt: "2026-04-28T10:00:00Z",  // ISO string
  updatedAt: "2026-04-28T10:00:00Z",  // ISO string
}
```

### SharedLineup (Phase 2 only)

```js
// Snapshot — frozen at share time. Player data embedded so future
// changes to players or the original lineup don't affect the share.
{
  slug: "a7f3k2p9",
  ownerDisplayName: "alex",
  team: "NSW",
  name: "My Origin I lineup",
  slots: [
    { position: 1, player: { /* full player object */ } },
    // ... through position 19; 1..13 field, 14..19 bench
  ],
  createdAt: "2026-04-28T10:00:00Z",
}
```

---

## 6. Rule functions (the only logic worth isolating)

Four pure JavaScript functions live in `src/domain/rules.js`. They take inputs and return outputs. No React, no DOM, no storage. They encode the actual rules of the app.

```js
// src/domain/rules.js
export function canPlayerFillPosition(player, position, looseMode) { ... }
export function findPlayerPlacement(lineup, playerId) { ... }
export function isLineupComplete(lineup) { ... }
export function isLineupValid(lineup, playersById) { ... }
```

Full specification with test-case tables in `rule-functions-spec.md`. Those tables are the manual verification checklist — work through them in the browser console once after writing each function and again after any change.

---

## 7. Storage interface

Phase 1 has no real database. But the app *should* still talk to a single storage module rather than reaching into localStorage directly from components. This makes the Phase 2 swap one line instead of a sprawling refactor.

```js
// src/lib/storage/index.js
// Phase 1: backed by localStorage
// Phase 2: backed by Supabase
// Same shape either way.

export const storage = {
  listPlayers(team)             /* returns Promise<Player[]> */,
  listLineups()                 /* returns Promise<LineupSummary[]> */,
  getLineup(id)                 /* returns Promise<Lineup | null> */,
  createLineup({ team, name })  /* returns Promise<Lineup> */,
  updateLineup(lineup)          /* returns Promise<Lineup> */,
  duplicateLineup(id)           /* returns Promise<Lineup> */,
  deleteLineup(id)              /* returns Promise<void> */,
  getCurrentUser()              /* returns Promise<User | null> */,
};
```

All methods return Promises even when localStorage doesn't need them — this prevents the swap from rippling through the UI when Supabase (which is async) takes over.

**Localstorage layout (Phase 1):**
```
origin-builder:lineup:<id>      → JSON of one Lineup
origin-builder:lineup-index     → JSON array of {id, name, team, updatedAt} for fast listing
origin-builder:panel-orientation → "left" | "bottom"
```

Players in Phase 1 come from a hardcoded JS array (`src/domain/seedPlayers.js`), not from localStorage. They're effectively read-only seed data.

---

## 8. Routes

| Route | Purpose | Phase |
|---|---|---|
| `/` | Landing — redirects to dashboard if data exists, otherwise prompts to create first lineup | 1 |
| `/dashboard` | List of saved lineups | 1 |
| `/lineup/:id` | The team builder | 1 |
| `/login`, `/signup` | Real auth | 2 |
| `/share/:slug` | Read-only snapshot view | 2 |
| `/404` | Not found | 1 |

---

## 9. Database schema (Phase 2 only — pasted into Supabase dashboard once)

Three tables. Created by pasting `CREATE TABLE` statements into the Supabase SQL editor. No migrations, no CLI tooling.

```sql
-- Players (managed via Supabase Table Editor)
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text not null,
  team text not null check (team in ('NSW','QLD')),
  eligible_positions int[] not null,
  rating int not null check (rating between 0 and 99),
  photo_url text,
  updated_at timestamptz not null default now()
);

-- Lineups (user-owned)
create table lineups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team text not null check (team in ('NSW','QLD')),
  name text not null,
  loose_mode boolean not null default false,
  slots jsonb not null,                   -- length 19; 1..13 field, 14..19 bench
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shared snapshots
create table shared_lineups (
  slug text primary key,
  lineup_id uuid references lineups(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_display_name text not null,
  team text not null,
  name text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
```

Row-Level Security:
- `players`: select = all authenticated users; insert/update/delete = service role only.
- `lineups`: all ops gated on `owner_id = auth.uid()`.
- `shared_lineups`: select = anyone (public); insert/delete = owner only.

---

## 10. Folder structure

```
src/
  domain/
    types.js          ← JSDoc-only documentation of data shapes
    rules.js          ← the four pure rule functions
    seedPlayers.js    ← hardcoded 56-player array (Phase 1; deleted in Phase 2)
  components/         ← React components, grouped by feature
  pages/              ← top-level route components
  lib/
    storage/
      localStorage.js ← Phase 1 backend
      supabase.js     ← Phase 2 backend
      index.js        ← exports the active backend
  stores/             ← Zustand stores
  styles/             ← global resets, CSS variables, etc.
```

Two architectural rules worth holding to:
1. **`domain/` doesn't import from anywhere else.** Pure logic stays pure.
2. **Components and hooks talk only to `storage`, never directly to localStorage or Supabase.** This is what keeps the Phase 2 swap small.

---

## 11. Phases

Each phase has milestones in `development-roadmap.md`. Summary here:

**Phase 1 — Local-first MVP and beyond.** Drag-drop working as fast as possible, then everything else that can be done without a server: bench, save/load to localStorage, dashboard, rename/duplicate/delete. Single-user assumption, no auth, no sharing.

**Phase 2 — Supabase swap and backend-only features.** Replace localStorage with Supabase. Add real auth. Deploy to Netlify (this is when deployment makes sense — there's a real app to deploy). Add sharing, conflict detection, password reset.

**Phase 3 — Polish.** Error states, loading skeletons, copy pass, error boundary, keyboard drag.

---

## 12. Testing approach

Manual. You build it, you click around, you decide if it works. The rule-function spec test-case tables are your manual checklist for the logic — run through them in the browser console after writing the functions and after any change.

If a bug bites twice, that's the signal to add an automated test for that one specific thing. Don't pre-empt — add tests reactively when the cost of *not* having one becomes real.

---

## 13. Working with Claude Code

- **`CLAUDE.md`** at the repo root captures project conventions Claude Code follows on every session: where rule functions live, the storage interface contract, the two architectural rules in §10, the no-TypeScript / no-tests / no-Tailwind decisions. Keep it short.
- **One milestone at a time.** Don't hand Claude Code "do Phase 1." Hand it "do milestone 1.4." Confirm visually before moving on.
- **Small, reviewable diffs.** If a change starts to grow, pause and reconsider scope.
- **Manual verification is the testing strategy.** Claude Code shouldn't write tests unprompted. If something is genuinely worth testing, decide deliberately.
