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
| Player pool | 88 fictional players (44 NSW + 44 QLD), seeded into Supabase via `supabase/seed_players.sql` |
| Player fields | name, club, eligible categories, photo (silhouette only in v1), rating (0–99) |
| Position categories | Three position-bound categories group the field positions: **Backs** (1–5), **Halves** (6–7), **Forwards** (8–13). A fourth player-only category, **Utility**, is not tied to any slot — a utility player is eligible for every field position. Each player has one or more eligible categories. Eligibility is enforced for field positions; bench is unrestricted. (A lineup-level "loose mode" override is deferred — see roadmap "Deferred / post-launch".) |
| Squad size per lineup | 13 field positions + 6-slot bench (positions 14–19). Bench is unrestricted — any player can go on any bench slot, no eligibility or team check. Bench-to-bench drags swap players. |
| Team per lineup | One — NSW or QLD chosen at creation, immutable thereafter |
| Field style | FIFA/Football Manager formation view (flat stylized; design handled separately) |
| Device | Desktop only in v1 |
| Sharing | Read-only snapshot link with denormalised player data — **parked for launch** (decided 2026-05-02). Schema kept in §9 for revival; see roadmap "Deferred / post-launch". |
| Saved lineup content | 19 positions (1–13 field, 14–19 bench) + name + team + timestamps. No notes, no captain/kicker flags. |
| Dashboard | Simple list: name, team, date modified |
| Player management | Supabase Table Editor (or re-running `supabase/seed_players.sql`) |
| AI builder | Claude Code (terminal / VS Code) |
| Who's involved | Solo — one person developing, managing player data, and testing |
| Hosting | Netlify — deployment deferred until after auth (Phase C). Single-user mode without RLS is unsafe to deploy publicly. |
| Audience | ~50 people, private link shared personally |
| Errors | `console.error` + React error boundary. No external tracking. |
| Analytics | None |
| Storage strategy | Supabase from the MVP onwards (post-pivot, decided 2026-05-03). LocalStorage backend retired. |
| Auth — single-user mode (Phase B) | None — RLS off, public anon key has full access. **Local-only / unlisted-only**, never deployed. |
| Auth — Phase C | Supabase Auth, **email + password only** at launch (decided 2026-05-02). OAuth deferred. |
| Conflict detection | **Parked for launch** (decided 2026-05-02). Last-write-wins is acceptable for ~50 friends; `version` column kept for forward-compat. |
| Tests | Manual in Phase 1. Phase 2 adds Vitest covering `rules.js` + storage layer (decided 2026-05-02). No Playwright until it earns its keep. |

## 3. What's deliberately not in the stack

These were considered and cut to keep the app boring and fast to build:

- **TypeScript** — plain JavaScript + JSX. The app is small enough that type errors will surface quickly via manual testing. Revisit if the codebase grows.
- **Storybook** — overkill for a solo dev. Components get tested by being used in the actual app.
- **Tailwind** — replaced by CSS Modules (one `.module.css` file per component, scoped automatically by Vite).
- **Vitest / Playwright / React Testing Library** — no automated tests in v1. Manual verification is the rule. The rule-functions spec doubles as a manual checklist. Vitest re-enters in Phase 2 (milestone 2.6) for `rules.js` and the storage layer only.
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
- **React Router** — routing.
- **Supabase** (`@supabase/supabase-js`) — Postgres + Auth (when Phase C lands) + RLS.

State is managed with React's built-in hooks. Modals are a small custom component. No Zustand, no shadcn/ui, no TanStack Query — evaluated and skipped; revisit only if a concrete need arises.

**Tooling**
- **ESLint** with whatever Vite ships by default. No strict rules.
- **Prettier** optional — Claude Code will format consistently anyway.

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
  eligibleCategories: ["backs"],     // subset of ["backs","halves","forwards","utility"] — 'utility' grants any field position
  rating: 92,                         // integer 0..99 (overall — independent of stats)
  speed: 78,                          // integer 0..99
  endurance: 72,                      // integer 0..99
  defence: 65,                        // integer 0..99
  workrate: 81,                       // integer 0..99
  photoUrl: null,                     // ignored in v1; silhouette rendered regardless
}
```

### Lineup

```js
// Example
{
  id: "uuid-...",                     // uuid, generated by Postgres
  team: "NSW",                        // "NSW" or "QLD" — immutable after creation
  name: "My Origin I lineup",         // string
  // looseMode field deferred — see roadmap "Deferred / post-launch"
  slots: {                            // sparse map: position → playerId
    1: "uuid-of-fullback",            // field positions 1..13
    7: "uuid-of-halfback",
    14: "uuid-of-bench-player",       // bench positions 14..19
    // unfilled positions are simply absent from the map
  },
  version: 1,                         // bumped on save (used for conflict detection — currently parked)
  createdAt: "2026-04-28T10:00:00Z",  // ISO string
  updatedAt: "2026-04-28T10:00:00Z",  // ISO string
}
```

### SharedLineup (parked — kept for revival)

> Sharing is parked for launch. Shape preserved here so the deferred-section "to revive" instructions stay accurate.

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
export function canPlayerFillPosition(player, position) { ... }
export function findPlayerPlacement(lineup, playerId) { ... }
export function isLineupComplete(lineup) { ... }
export function isLineupValid(lineup, playersById) { ... }
```

Full specification with test-case tables in `rule-functions-spec.md`. Those tables are the manual verification checklist — work through them in the browser console once after writing each function and again after any change.

---

## 7. Storage interface

The app talks to a single `storage` module, never directly to Supabase from components or pages. The indirection lets us swap or wrap the backend (e.g. when Phase C adds an `owner_id` filter on every query) without touching UI code.

```js
// src/lib/storage/index.js
// Backed by Supabase via src/lib/storage/supabaseBackend.js.

export const storage = {
  listPlayers(team)             /* returns Promise<Player[]> */,
  listLineups()                 /* returns Promise<LineupSummary[]> */,
  getLineup(id)                 /* returns Promise<Lineup | null> */,
  createLineup({ team, name, slots? })  /* returns Promise<Lineup>; slots optional, defaults to {} */,
  updateLineup(lineup)          /* returns Promise<Lineup> */,
  duplicateLineup(id)           /* returns Promise<Lineup> */,
  deleteLineup(id)              /* returns Promise<void> */,
};
```

All methods are async. Errors are thrown — pages handle them as ordinary promise rejections. `getCurrentUser` will be added in Phase C alongside Supabase Auth.

---

## 8. Routes

| Route | Purpose | Phase |
|---|---|---|
| `/` | Landing — redirects to dashboard if data exists, otherwise prompts to create first lineup | 1 |
| `/dashboard` | List of saved lineups. "+ New lineup" navigates to `/lineup/preview` | 1 |
| `/lineup/preview` | Blank draft builder. Save promotes to a real lineup (collects name in modal) and redirects to `/lineup/:id` | 1 |
| `/lineup/:id` | The team builder. Autosaves on change (400 ms debounce). Save button flushes pending writes; "Saving…" indicator under the button | 1 |
| `/login`, `/signup` | Real auth (email + password) | 2 |
| `/forgot-password`, `/reset-password` | Password reset flow | 2 |
| `/share/:slug` | Read-only snapshot view — **parked** for launch (see deferred section in roadmap) | — |
| `/404` | Not found | 1 |

---

## 9. Database schema (Phase 2 only — pasted into Supabase dashboard once)

**Two tables at launch** (`players`, `lineups`). The `shared_lineups` DDL is kept below behind a parked-features section for when sharing is revived. Created by pasting `CREATE TABLE` statements into the Supabase SQL editor. No migrations, no CLI tooling.

```sql
-- Players (managed via Supabase Table Editor)
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text not null,
  team text not null check (team in ('NSW','QLD')),
  eligible_categories text[] not null,    -- subset of {'backs','halves','forwards','utility'}
  rating int not null check (rating between 0 and 99),
  speed int not null check (speed between 0 and 99),
  endurance int not null check (endurance between 0 and 99),
  defence int not null check (defence between 0 and 99),
  workrate int not null check (workrate between 0 and 99),
  photo_url text,
  updated_at timestamptz not null default now()
);

-- Lineups (user-owned)
create table lineups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team text not null check (team in ('NSW','QLD')),
  name text not null,
  slots jsonb not null,                   -- length 19; 1..13 field, 14..19 bench
  version int not null default 1,         -- kept for forward-compat (conflict detection is parked)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Row-Level Security:
- `players`: select = all authenticated users; insert/update/delete = service role only.
- `lineups`: all ops gated on `owner_id = auth.uid()`.

> **Step-by-step click path:** see `docs/supabase-setup.md` for project creation, region choice, RLS policy snippets, and `.env` wiring.

### Parked: shared_lineups (kept for revival)

```sql
-- Shared snapshots — DO NOT create at launch. Revive when sharing is unparked.
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
-- RLS: select = anyone (public); insert/delete = owner only.
```

---

## 10. Folder structure

```
src/
  domain/
    rules.js              ← the four pure rule functions
    autoFill.js           ← lineup auto-fill logic
    categories.js         ← position-category constants
  components/             ← React components, grouped by feature
  pages/                  ← top-level route components
  lib/
    supabase.js           ← Supabase client
    storage/
      supabaseBackend.js  ← active storage backend
      index.js            ← re-exports the active backend
    dnd/                  ← dnd-kit collision helpers
    formatDate.js
  styles.css              ← global resets / CSS variables
```

Two architectural rules worth holding to:
1. **`domain/` doesn't import from anywhere else.** Pure logic stays pure.
2. **Components and hooks talk only to `storage`, never directly to Supabase.** Keeps Phase C (auth) a contained change.

---

## 11. Phases

Each phase has milestones in `development-roadmap.md`. Summary here:

**Phase 1 — Local-first MVP.** Drag-drop, eligibility rules, bench, dashboard, rename/duplicate/delete. Originally backed by localStorage; that backend was retired in Phase B.

**Phase 2 — Supabase, in two paths (post-pivot, decided 2026-05-03).** See `docs/supabase-setup.md` for the live click-paths.
- **Phase A — Smoke test.** Project, schema, env wiring, prove insert/select round-trips. ✅
- **Phase B — Single-user real data.** Players + lineups in Supabase, RLS off, no auth, local-only. ✅
- **Phase C — Auth + deploy.** Add `owner_id`, enable RLS, wire Supabase Auth, deploy to Netlify.

**Phase 3 — Polish.** Error states, loading skeletons, copy pass, error boundary, keyboard drag.

---

## 12. Testing approach

Manual. You build it, you click around, you decide if it works. The rule-function spec test-case tables are your manual checklist for the logic — run through them in the browser console after writing the functions and after any change.

If a bug bites twice, that's the signal to add an automated test for that one specific thing. Don't pre-empt — add tests reactively when the cost of *not* having one becomes real.

---

## 13. Working with Claude Code

- **One milestone at a time.** Don't hand Claude Code "do Phase 1." Hand it "do milestone 1.4." Confirm visually before moving on.
- **Small, reviewable diffs.** If a change starts to grow, pause and reconsider scope.
- **Manual verification is the testing strategy.** Claude Code shouldn't write tests unprompted. If something is genuinely worth testing, decide deliberately.
