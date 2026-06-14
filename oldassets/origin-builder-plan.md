# Origin Builder — Project Plan (v0.3, First Pass)

> Working spec for a State of Origin team builder web app.
> This is a **first pass** — expect revisions. Every assumption is called out so it can be challenged.

---

## 1. Product summary

Single-page React web app where authenticated users build State of Origin (NSW Blues or QLD Maroons) rugby league lineups. Core flow: pick a team → drag players from a side panel onto a FIFA-style formation field → save → optionally share a read-only snapshot link. Player database is maintained by an internal employee via the Supabase dashboard.

---

## 2. Decisions locked in

| Area | Decision |
|---|---|
| Player pool | Live squads, employee-maintained via Supabase dashboard |
| Player fields | name, club, eligible positions, photo, rating (0–99). No age. |
| Position eligibility | Per-player array of allowed position numbers. Lineup-level "loose mode" toggle disables the restriction. |
| Squad size per lineup | 17 positioned (1–13 + 4 interchange) + 6-man bench + 1 emergency. Bench and emergency accept any position. |
| Team per lineup | One — NSW or QLD chosen at creation, immutable thereafter |
| Field style | FIFA/Football Manager formation view |
| Device | Desktop only in v1 |
| Auth | Email/password only via Supabase Auth |
| Sharing | Read-only snapshot link. Player data frozen into snapshot at share time. Owner can revoke. |
| Saved lineup content | 17 positions + reserves + name + team + created/modified timestamps. No notes, no captain/kicker flags. |
| Dashboard | Simple list: name, team, date modified |
| Admin UI | None in v1 — Supabase dashboard only |

## 3. Assumptions (challenge anytime)

- **Position taxonomy:** AU rugby league naming — 1 Fullback, 2 Wing, 3 Centre, 4 Centre, 5 Wing, 6 Five-Eighth, 7 Halfback, 8 Prop, 9 Hooker, 10 Prop, 11 Second Row, 12 Second Row, 13 Lock, 14–17 Interchange.
- **Bench + emergency:** 6 bench slots + 1 emergency slot. Both accept any player from the selected team's squad regardless of eligible positions.
- **Player list panel:** shows all squad players for the selected team; placed players are dimmed but still draggable (drag a placed player to move them).
- **Filters & sort:** search by name; filter by eligible position; default sort by rating descending.
- **New lineup flow:** modal with NSW/QLD choice + name field.
- **Branding:** dark slate app chrome; team colors applied to field and lineup-specific UI. App name "Origin Builder" as placeholder.
- **Player imagery:** generic silhouette placeholder used throughout v1. No real player photos sourced or uploaded. `photoUrl` column stays in the schema for future use but UI always renders the silhouette, team-tinted via CSS (blue for NSW, maroon for QLD).
- **Field background:** flat stylized diagram — clean lines, solid color, FIFA-like. No grass texture.
- **Loose mode UI:** deliberate labeled toggle in the builder header with a short explanation ("Position rules off — players can be placed anywhere"). Off by default. When on, the field's visual treatment shifts subtly (e.g., different accent color on slot outlines) so the user always knows the state. No alarmist warnings.
- **Rating scale:** 0–99 (FIFA convention).
- **Snapshot URLs:** `/share/<random-slug>`. Viewer sees the owner's email-local-part as display name.
- **Conflicting edits:** last-write-wins on save, but if a user has a lineup open and the server copy was updated since they loaded it, show a dialog on save attempt: "This lineup was modified elsewhere. Reload to see changes reflected here." They choose to reload (discard local) or overwrite (force save).
- **Included in v1:** duplicate lineup.
- **Excluded from v1:** export-as-image, dark-mode toggle (app is dark by default), mobile layouts, admin UI, guest mode, social login.

---

## 4. Tech stack

### Frontend
- **React 18 + TypeScript (strict) + Vite** — TypeScript is non-negotiable; the structured domain (players, positions, rules) benefits hugely from compile-time checks and makes it feasible for an AI builder to catch its own mistakes before runtime.
- **Tailwind CSS + shadcn/ui** — component primitives; fast iteration; consistent styling.
- **dnd-kit** — drag-and-drop. Chosen over react-dnd because it supports custom collision detection (needed for magnetic snap), has built-in keyboard a11y, and is actively maintained.
- **Zustand** — client state for the builder. Simpler than Redux; works well with persistence middleware.
- **React Router v6** — routing.
- **TanStack Query** — server state, caching, optimistic updates.
- **React Hook Form + Zod** — form validation; Zod schemas shared between client types and runtime validation.

### Backend / data
- **Supabase** — Postgres, Auth, Row-Level Security, Storage (for player photos). Removes the need for a custom backend in v1.

### Verification & tooling (the "AI checks its own work" layer — see §8)
- **Vitest** — unit tests for pure validation logic.
- **React Testing Library** — component behavior tests.
- **Playwright** — end-to-end tests through a real browser; covers drag-drop flows.
- **Storybook** — component catalog; every component has stories covering key states.
- **ESLint + Prettier** — style/lint enforcement.
- **TypeScript strict mode** — catches domain errors at compile time.
- **CI verify script:** `npm run verify` runs typecheck + lint + unit tests + Playwright smoke. The AI builder runs this after changes.

---

## 5. Domain model (TypeScript sketch)

```ts
type PositionNumber = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17;
type StartingPosition = 1|2|3|4|5|6|7|8|9|10|11|12|13;
type InterchangePosition = 14|15|16|17;
type Team = "NSW" | "QLD";

interface Player {
  id: string;              // uuid
  name: string;
  club: string;
  team: Team;              // state eligibility
  eligiblePositions: StartingPosition[]; // e.g. [1, 2, 5]; interchange always implicitly eligible
  rating: number;          // 0-99
  photoUrl: string | null; // unused in v1; silhouette rendered regardless
  updatedAt: string;
}

interface LineupSlot {
  position: PositionNumber;       // 1..17
  playerId: string | null;
}

interface BenchSlot {
  index: 0|1|2|3|4|5;             // stable ordering, 6 slots
  playerId: string | null;
}

interface EmergencySlot {
  playerId: string | null;        // single slot
}

interface Lineup {
  id: string;
  ownerId: string;
  team: Team;                      // immutable
  name: string;
  looseMode: boolean;              // position eligibility disabled when true
  slots: LineupSlot[];             // length 17 (positions 1..17)
  bench: BenchSlot[];              // length 6
  emergency: EmergencySlot;        // always present, playerId may be null
  version: number;                 // bumped on save; used for conflict detection
  createdAt: string;
  updatedAt: string;
}

interface SharedLineup {
  slug: string;
  lineupId: string;                // may be null after owner deletes
  ownerDisplayName: string;
  team: Team;
  name: string;
  // denormalized snapshot — immutable after creation
  slots: Array<{ position: PositionNumber; player: Player | null }>;
  bench: Array<{ index: number; player: Player | null }>;
  emergency: { player: Player | null };
  createdAt: string;
}
```

### Key invariants (enforced by pure functions, tested in isolation)
- `canPlayerFillPosition(player, position, looseMode)` — true if looseMode, or position in 14..17, or position ∈ player.eligiblePositions.
- `canPlayerFillBench(player)` — always true (subject to team eligibility, which is enforced by filtering the panel to that team's squad).
- `canPlayerFillEmergency(player)` — always true (same caveat).
- `isLineupValid(lineup)` — every slot 1..13 filled with an eligible player under current mode, every 14..17 filled, no player appears in more than one slot/bench/emergency.
- `isLineupComplete(lineup)` — all 17 positioned slots filled. Bench and emergency slots are optional for completeness.
- `findPlayerPlacement(lineup, playerId)` — returns `{ kind: "slot", position } | { kind: "bench", index } | { kind: "emergency" } | null`.

---

## 6. Database schema (Supabase / Postgres)

```sql
-- Players (employee-maintained)
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text not null,
  team text not null check (team in ('NSW','QLD')),
  eligible_positions int[] not null,   -- array of 1..13
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
  slots jsonb not null,        -- [{position, player_id}]   length 17
  bench jsonb not null,        -- [{index, player_id}]      length 6
  emergency jsonb not null,    -- {player_id}
  version int not null default 1,   -- bumped on save; conflict detection
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
  snapshot jsonb not null,     -- frozen full shape: slots, bench, emergency, with embedded player data
  created_at timestamptz not null default now()
);
```

RLS:
- `players`: select = all authenticated users; insert/update/delete = service role only.
- `lineups`: all ops gated on `owner_id = auth.uid()`.
- `shared_lineups`: select = anyone (public); insert/delete = owner only.

---

## 7. Routes & views

| Route | View | Auth | Notes |
|---|---|---|---|
| `/` | Landing / sign-in redirect | Public | Redirects to dashboard if signed in |
| `/signup` | Signup form | Public | |
| `/login` | Login form | Public | |
| `/dashboard` | List of user's lineups | Required | "New lineup" button, per-row actions (open, rename, duplicate, delete, share) |
| `/lineup/:id` | Team builder | Required, owner only | Main drag-drop UI |
| `/share/:slug` | Read-only snapshot | Public | No edit controls |
| `/404` | Not found | Public | |

---

## 8. Self-verification strategy

This is the part about "AI builder checks its own work." The strategy is to make correctness **mechanically checkable** rather than judgment-based, with these layers:

### 8.1 Typed domain model
All data shapes (Player, Lineup, etc.) expressed as strict TypeScript types. Position eligibility encoded as data on the Player object, not as scattered conditional logic.

### 8.2 Pure validation functions
All rules live in a single module `src/domain/rules.ts` with pure functions:
- `canPlayerFillPosition(player, position, looseMode): boolean`
- `validateLineup(lineup, playerMap): ValidationResult`
- `isLineupComplete(lineup): boolean`
- `findPlayerPlacement(lineup, playerId): PositionNumber | "reserve" | null`

Pure = no side effects = unit-testable with plain input/output pairs. The AI builder can add/modify rules and immediately run `vitest` to see what broke.

### 8.3 Test ID discipline
Every interactive element has a `data-testid`. Playwright flows reference these stable IDs:
- `data-testid="player-card-{id}"`
- `data-testid="field-slot-{position}"`
- `data-testid="reserve-slot-{index}"`
- `data-testid="save-lineup-button"`
- etc.

### 8.4 Storybook as a visual spec
Every component has stories for its meaningful states: empty, populated, hover, error, loading, disabled. The AI builder renders a story in isolation to check a change looks right.

### 8.5 The verify script
```json
{
  "scripts": {
    "verify": "npm run typecheck && npm run lint && npm run test:unit && npm run test:e2e:smoke",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "test:unit": "vitest run",
    "test:e2e:smoke": "playwright test --grep @smoke"
  }
}
```
Green verify = safe to commit. Red verify = specific, actionable error output the AI builder can act on.

### 8.6 Acceptance criteria per phase
Each phase (§10) has concrete, automated acceptance criteria — not prose like "the drag works" but "Playwright test `drag-player-to-slot.spec.ts` passes."

---

## 9. Component tree (sketch)

```
<App>
 ├── <AuthProvider>
 ├── <QueryProvider>
 └── <Router>
      ├── <LandingPage />
      ├── <LoginPage /> / <SignupPage />
      ├── <DashboardPage>
      │    ├── <LineupList />
      │    └── <NewLineupModal />
      ├── <LineupBuilderPage>
      │    ├── <BuilderHeader />   // name, save state, loose-mode toggle w/ explanation, share button
      │    ├── <ConflictDialog />  // "This lineup was modified elsewhere..."
      │    ├── <DndContext>
      │    │    ├── <FieldView>     // formation with 17 slots
      │    │    │    ├── <FieldSlot /> × 17
      │    │    │    ├── <BenchRow>
      │    │    │    │    └── <BenchSlot /> × 6
      │    │    │    └── <EmergencySlot />
      │    │    └── <PlayerListPanel>  // left or bottom
      │    │         ├── <PanelControls />  // search, filter, position orientation toggle
      │    │         └── <PlayerCard /> × N  // thin collapsed; expanded on click
      │    └── <ShareDialog />
      └── <SharedLineupPage>       // read-only, no DndContext
           └── <FieldView readOnly />
```

---

## 10. Phased delivery plan

Each phase is a merge-able slice. Each has acceptance criteria expressible as passing tests.

### Phase 0 — Foundations
**Deliverable:** repo scaffold, no features.
**Tasks:**
- Vite + React + TS strict setup.
- Tailwind + shadcn/ui install.
- Router with placeholder pages.
- Domain types in `src/domain/types.ts`.
- Rule functions stubs in `src/domain/rules.ts` with failing unit tests describing intent.
- Storybook configured.
- Playwright configured with a smoke test that just loads `/`.
- `npm run verify` script in `package.json`.
- README.
- GitHub Actions CI running verify.

**Acceptance:** `npm run verify` passes on a clean clone.

### Phase 1 — Static team builder (no auth, no persistence)
**Deliverable:** `/lineup/demo` — works in-memory only, loads from a hardcoded seed of ~25–30 players per team.
**Tasks:**
- FieldView with flat-stylized formation layout (17 slots positioned absolutely over a solid-color field background).
- BenchRow (6 slots) and EmergencySlot rendered below or alongside the field.
- PlayerListPanel with collapsed/expanded PlayerCard, silhouette placeholder (team-tinted).
- dnd-kit integration with custom collision detection for magnetic snap (snap when pointer is within N px of a valid slot center).
- Position eligibility enforced on drop with visible rejection feedback. Bench and emergency accept any player.
- LooseMode toggle in BuilderHeader: labeled switch with short inline explanation. When on, field slot outlines shift to a distinct accent color so the state is always obvious.
- Panel orientation toggle (left vs bottom) — stored in localStorage.
- Pure rule functions fully implemented, all unit tests green.

**Acceptance:**
- Unit tests for all rule functions: green.
- Storybook stories for FieldView (empty, partial, full, invalid, loose-mode-on), PlayerCard (collapsed, expanded), BenchRow, EmergencySlot.
- Playwright: `@smoke drag eligible player onto empty slot — player renders in slot`.
- Playwright: `drag ineligible player onto strict slot — player returns to panel, error toast shown`.
- Playwright: `drag any player onto bench / emergency — accepted regardless of eligible positions`.
- Playwright: `toggle loose mode → previously rejected drop now succeeds; field outlines visually change`.

### Phase 2 — Auth, persistence, sharing
**Deliverable:** sign up, log in, save/load/rename/duplicate/delete lineups, shareable snapshot links.
**Tasks:**
- Supabase project set up; `.env` config.
- AuthProvider, LoginPage, SignupPage.
- Password reset flow (request email → reset via Supabase link → new password form).
- Email verification on signup (Supabase default flow).
- Dashboard listing lineups.
- NewLineupModal (team + name).
- Save/load wiring via TanStack Query, with optimistic updates.
- `lineups`, `players`, `shared_lineups` tables created with RLS.
- Players read from `players` table (seed via SQL script, ~25–30 per team).
- Silhouette SVG asset wired as the universal player image (team-tinted via CSS — blue for NSW, maroon for QLD).
- Basic rate limiting on auth endpoints (Supabase built-in throttles are sufficient for v1; document the configured limits).
- Conflict detection on save: server compares submitted `version` with current. If mismatch, return 409 and trigger ConflictDialog ("This lineup was modified elsewhere. Reload to see changes reflected here.") with reload/overwrite choice.
- ShareDialog: "Create share link" → generates slug, inserts `shared_lineups` row with frozen snapshot (embedded player data, independent of `players` table).
- `/share/:slug` public route rendering frozen lineup read-only.
- Revoke share (delete `shared_lineups` row).
- Dashboard shows whether each lineup has an active share.

**Acceptance:**
- Playwright: full flow — sign up → create lineup → place players → save → reload → lineup restored.
- Playwright: password reset flow — request reset → simulate token → set new password → log in with new password.
- Playwright: user A cannot see user B's lineups (RLS test).
- Playwright: conflict flow — simulate concurrent edit via direct DB write → attempt save → ConflictDialog appears → reload succeeds.
- Playwright: create share → open slug in new context (no auth) → see lineup.
- Playwright: revoke share → slug returns 404.
- Playwright: update original lineup player selections → shared snapshot unchanged; update a player record in `players` → shared snapshot unchanged.
- Unit tests for server-state hooks (mocked Supabase client).

### Phase 3 — Polish
**Deliverable:** rough edges smoothed.
**Tasks:**
- Error states, empty states, loading skeletons.
- Toast system for save confirmations and errors.
- Keyboard drag (dnd-kit sensor) — bonus a11y win.
- Basic analytics hooks (optional).

**Acceptance:** manual checklist in the Phase 3 ticket.

---

## 11. Open questions / still-to-decide

All questions from the previous pass have been answered and folded into the decisions above. Nothing blocking remains for Phase 0–1.

**Deferred:** schema migration strategy for when player fields change post-launch — will address when it becomes relevant.

---

## 12. Resolved pushback items

For the record, these were flagged for challenge in v0.1/v0.2 and are now settled:

- **Stack choices (Supabase, Zustand, dnd-kit):** confirmed as proposed.
- **Phase ordering:** static-builder-first confirmed.
- **Snapshot freezing:** confirmed — player data embedded in `shared_lineups.snapshot` at share time; immutable after.
- **Reserves model:** replaced with 6 bench + 1 emergency, all position-agnostic.
- **Rating scale:** 0–99, FIFA convention, confirmed.
- **Conflict handling:** optimistic concurrency via `version` column; dialog prompts reload on conflict.
