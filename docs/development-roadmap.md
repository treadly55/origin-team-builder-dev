# Origin Builder — Development Roadmap

> Step-by-step build order. Every milestone produces something visible. The order is deliberate: get a draggable player onto a position as fast as possible, then build outward.

---

## How to use this roadmap

Feed Claude Code one milestone at a time. Don't hand it "do Phase 1." Hand it "do milestone 1.4." After each milestone, click through the "You can see" line yourself. If you can't see what it promises, the milestone isn't done.

---

## Phase 1 — Local-first MVP and beyond

The whole goal of the early milestones is **see a player drag onto a position**. That's the moment the project stops being abstract. Everything else builds outward from there.

### 1.1 — Empty React app that runs

**Build:** Vite + React project. One page that says "Origin Builder" centered on a dark background. Plain CSS in a single global stylesheet for now (we'll switch to CSS modules per component as we go).

**You can see:** `npm run dev` opens `localhost:5173` and shows the heading.

### 1.2 — Routing skeleton

**Build:** React Router with stub pages: `/`, `/dashboard`, `/lineup/:id`, `/404`. Each renders only its name as a placeholder. No login/signup/share routes yet — those come in Phase 2.

**You can see:** Navigating to each URL shows the right placeholder. Unknown URLs show 404.

### 1.3 — Seed players and rule functions

**Build:** `src/domain/seedPlayers.js` containing the 56-player array (translated from `seed_players.sql`). `src/domain/rules.js` with all four rule functions. Manually verify each function against the test cases in `rule-functions-spec.md` by running them in the browser console once.

**You can see:** Open the browser console on the home page. Type `import('./domain/rules.js').then(r => console.log(r.canPlayerFillPosition({eligibleCategories:['halves']}, 6, false)))` — see `true`. Try a few rows from the test tables. (Or expose a simple debug page that runs them and prints results.)

**Done when:** every test case in the rule spec returns the expected value when you check by hand.

### 1.4 — STATIC FIELD WITH 13 POSITIONS

**Build:** A `FieldView` component rendering 13 numbered position circles laid out in formation on a flat field background. No data, no interaction yet. Lives at `/lineup/preview` for development.

**You can see:** Open `/lineup/preview` — see a rugby field with 13 numbered circles arranged in a recognisable formation.

### 1.5 — STATIC SIDEBAR WITH PLAYERS

**Build:** A `PlayerListPanel` component on the left. Shows NSW players from `seedPlayers.js` as a vertical list of cards. Each card shows name, eligible positions, rating. No expand/collapse yet — that comes later. Silhouette as the player image, no team-tinting yet.

**You can see:** `/lineup/preview` now shows the field on the right and the NSW squad list on the left. Both render side by side.

### 1.6 — MVP MOMENT: drag one player onto one position

**Build:** dnd-kit installed. The first player in the list is draggable. Position 1 (fullback) is droppable. Dropping the player on position 1 places them there visually (their name appears in the slot). No rules, no other players, no other positions yet — just this one drag working end-to-end.

**You can see:** Pick up the first player from the panel, drag onto position 1, release. Player's name appears in the position. The same player still shows in the panel (no removal yet).

**This is the MVP moment. The project is real now.** Stop and look at it. Show it to someone. Get the satisfaction.

### 1.7 — Drag any player onto any position (no rules)

**Build:** Generalise from milestone 1.6. Every player in the panel is draggable. Every position is droppable. Drop assigns the player to that position. Drag a placed player to another position to move them. Drag a placed player back to a generic "panel area" to un-place. No eligibility rules yet.

**You can see:** Build a full lineup by dragging anyone anywhere. Move players around. Clear the field by dragging everyone back to the panel.

### 1.8 — Position eligibility enforcement

**Build:** On drop, call `canPlayerFillPosition`. If it returns false, reject the drop with a visible error toast or inline message. The player snaps back to where they came from.

**You can see:** Try to drag a halfback specialist (eligible only for position 7) onto position 1 — gets rejected with a message. Drag them onto position 7 — works. Drag the same player onto position 6 (if they're not eligible there) — rejected.

### 1.9 — Bench (6 slots, positions 14–19)

**Build:** A `BenchColumn` component sits as a brown vertical strip between the panel and the field (~96px wide). 6 droppable circles labeled 14–19 stacked top-to-bottom. The bench is unrestricted: any player can go on any slot, no eligibility or team check, no toast on drop. Bench-to-bench drags **swap** (incoming wins, displaced player slides into the source slot). All other drops still **replace** (displaced player goes back to the panel).

**You can see:** All 13 + 6 = 19 slots present and functional. Any NSW player can go on the bench. Dragging a field player to the bench works. Two bench players can be swapped by dragging one onto the other.

**Note:** The original plan included 4 interchange slots (positions 14–17 on the field) and a 1-player emergency. Both were collapsed into a single 6-slot bench (positions 14–19) during this milestone. Plan §2 and `rule-functions-spec.md` reflect the new model.

### 1.10 — Magnetic snap

**Build:** Custom collision detection in dnd-kit. Drop within ~40px of a slot center snaps the card into the slot. Visual feedback: the target slot highlights when the dragged card is close enough.

**You can see:** You don't need pixel-perfect drops anymore. Get close, the player snaps in. The target slot lights up to confirm.

### 1.11 — _Deferred (was: Loose mode toggle)_

The category-rules override is deferred to post-launch. See "Deferred / post-launch" at the bottom of this doc. The number is kept so commit history (`1.11 loose mode toggle…`) still maps to a roadmap entry. Subsequent items keep their numbers.

### 1.12 — Player card expand/collapse

**Build:** Clicking a player card in the panel expands it to show club, full eligible positions list, and any other detail. Click again to collapse. Other cards stay collapsed when one is open (or all expand independently — your call).

**You can see:** Click cards to see more info. Click again to collapse.

### 1.13 — Team selection and panel filters

**Build:** A team selector at the top of the page (NSW or QLD) — for now it just changes which team's players show in the panel. Search by name. Filter by eligible position. Default sort: rating descending. Panel orientation toggle (left vs bottom), persisted in localStorage under its own key.

**You can see:** Switch between NSW and QLD squads. Search filters the list. Position filter narrows to eligibles. Move the panel to the bottom of the screen.

### 1.14 — Storage interface and LocalStorage backend

**Build:** Define the storage interface in `src/lib/storage/index.js` per the plan §7. Implement the localStorage backend. Players come from `seedPlayers.js`; lineups stored under `origin-builder:lineup:<id>`. Wire it as the active backend. **Don't change any UI yet** — this is the plumbing for the next milestone.

**You can see:** No UI change. Open devtools, type `await window.storage?.listPlayers("NSW")` (or however you expose it for testing) — see the array of 28 NSW players. Nothing in localStorage yet because no lineups exist.

**Done when:** the interface methods all work; manually creating and reading lineups via the storage object succeeds.

### 1.15 — Save and load to localStorage

**Build:** Save button in the builder header. Saving calls `storage.updateLineup(currentLineup)`. Loading `/lineup/:id` calls `storage.getLineup(id)` and hydrates the builder. (For now, you'll need to manually craft a lineup ID to navigate to one — the dashboard comes next.)

**You can see:** Build a lineup, hit save, refresh the page, lineup is still there. Clear localStorage manually, refresh — lineup is gone.

### 1.16 — Dashboard

**Build:** `/dashboard` page listing the user's lineups via `storage.listLineups()`. Each row: name, team, last modified date. "New lineup" button opens a modal asking for team (NSW/QLD) and name. Submitting calls `storage.createLineup(...)` and routes to `/lineup/:id`.

**You can see:** The dashboard lists your lineups. Creating a new one opens an empty builder for the chosen team. The list updates after creation.

### 1.17 — Dashboard actions: rename, duplicate, delete

**Build:** Each row has a menu with three actions. Rename opens a small input. Duplicate copies the lineup with "(copy)" appended. Delete confirms then removes.

**You can see:** All three actions work and the list updates immediately after each.

**End of Phase 1.** A complete, usable, single-user app you could demo by sharing your screen. No accounts, no sharing, no deployment — but everything you build is real and persistent in your browser.

---

## Phase 2 — Supabase swap, deploy, real auth

Slimmed-down Phase 2 (decided 2026-05-02). Goal: solid DB connection + real auth on a deployed site. Sharing, conflict detection, OAuth, and localStorage migration are all parked — see "Deferred / post-launch" below.

Order matters: stand up the backend, deploy with a stub user, then add real auth on top of a live deploy. Tests come in alongside the swap, where the seam between localStorage and Supabase makes them earn their keep.

### 2.0 — Smoke test: connect to Supabase (local-only)

**Build:** Walk the **Quick path** in `docs/supabase-setup.md` — create the project, install `@supabase/supabase-js`, create one `lineups` table with RLS off, and prove an `insert` + `select` round-trip works from the browser console. No `players` table, no `owner_id`, no auth, no UI changes — this milestone is plumbing only.

**You can see:** `npm run dev`, paste the smoke-test snippet from the doc into the console, see the row come back from `select` and appear in the Supabase Table Editor.

**Done when:** both error fields return `null` and the row is visible in the dashboard.

> **Local-only.** With RLS off, the anon key + project URL grant full read/write to anyone who has them. Do not deploy this state. Milestone 2.1 hardens it before deploy.

### 2.1 — Supabase project and schema

**Build:** Supabase project created via the web console (see `docs/supabase-setup.md` for the click-path). Two tables (`players`, `lineups`) created by pasting CREATE TABLE statements from the plan §9. RLS policies applied. `.env.example` committed; `.env` (gitignored) populated locally with the project URL + anon key.

**You can see:** Supabase Table Editor shows two empty tables. App still runs against localStorage — no behaviour change yet.

### 2.2 — Seed players in Supabase

**Build:** Translate `src/domain/seedPlayers.js` (88 players incl. utility) into an INSERT script and run it in the SQL editor. Sanity queries: row counts per team, per category.

**You can see:** Players visible in the Table Editor. App still uses the local seed.

### 2.3 — Supabase storage backend (not wired)

**Build:** Implement the storage interface in `src/lib/storage/supabaseBackend.js`. Mirrors the localStorage backend exactly — same method shapes, all async. Don't wire it in yet.

**You can see:** No UI change. The new file exists and the methods can be exercised manually via `await import('./lib/storage/supabaseBackend.js')` in the console.

### 2.4 — The swap (stub user, no real auth)

**Build:** Switch the active backend in `src/lib/storage/index.js` to the Supabase one. `getCurrentUser` returns a hardcoded dev user — real auth lands in 2.7. The localStorage backend file stays in the tree as an inactive fallback. Players now come from Supabase; lineups now save to Supabase.

**You can see:** Build and save a lineup. Open the Supabase Table Editor — see the row appear. Refresh the app — lineup loads from the database, not localStorage.

> **Note on existing localStorage lineups:** abandoned, by design. No migration. Acceptable because there are no real users yet — only MVP test lineups.

### 2.5 — Deploy to Netlify (with stub user)

**Build:** `netlify.toml` with SPA fallback (`/* → /index.html 200`). Netlify site created, linked to the repo, auto-deploying from `main`. Env vars (Supabase URL + anon key) set in Netlify site settings. Site lives on `*.netlify.app`.

**You can see:** Visit the live Netlify URL — build a lineup, see it persist in Supabase from the deployed site. Direct-loading `/dashboard` doesn't 404 (SPA fallback works).

> **Why deploy here, not later:** every subsequent feature gets verified against a real deploy environment, not just localhost. Catches "works on my machine" surprises while the surface is small.

### 2.6 — Vitest + tests for rules.js and storage layer

**Build:** Add Vitest. Write a small test suite for `src/domain/rules.js` (drives the test cases already documented in `rule-functions-spec.md`) and the storage layer (smoke tests against both backends — localStorage in jsdom, Supabase via a `.env.test` config or skipped by default).

**You can see:** `npm test` runs green. Tests exist for the four rule functions and for `createLineup` / `updateLineup` / `getLineup` / `listLineups` round-tripping correctly.

> **Why now:** the storage layer is the seam where backends diverge — exactly where automated tests catch real bugs. Rule functions are pure and trivially testable; running them in CI beats running them by hand.

### 2.7 — Real auth (email + password only)

**Build:** Stubbed user removed. Add `/login` and `/signup` routes (Supabase Auth, email + password). Session persists across refresh. Logout button in the dashboard header. Logged-out users hitting `/dashboard` or `/lineup/:id` get redirected to `/login`. `/lineup/preview` remains accessible while logged out (draft-only) — but Save requires login.

**You can see:** Create an account, log out, log back in. Two browsers logged in as the same user see the same lineups. Logged-out users can't see the dashboard.

> **No OAuth at launch.** Decision 2026-05-02. Add Google/GitHub later if a real user asks.

### 2.8 — Password reset

**Build:** "Forgot password" link on login. Request-reset and reset-password pages using Supabase's built-in flow. Redirect URL configured in Supabase Auth settings to point at the deployed Netlify URL.

**You can see:** Reset a password end-to-end via real email.

**End of Phase 2.** The app is deployed, has real users, and persists everything in Postgres. From here: polish (Phase 3) or revisit deferred items.

---

## Phase 3 — Polish

A checklist of quality improvements. None strictly depend on each other.

### 3.1 — Loading states

**Build:** Skeleton loaders for the dashboard, the builder, and the share view.

**You can see:** Slow your network in devtools — loading UI appears.

### 3.2 — Empty states

**Build:** Friendly empty states: dashboard with no lineups, builder with no players placed, share dialog before generation.

**You can see:** First-time use feels guided.

### 3.3 — Toast system

**Build:** Global toast component. Save confirmations, share creation, errors all route through it.

**You can see:** Actions produce visible feedback.

### 3.4 — Error boundary

**Build:** Global React error boundary. Logs to `console.error`. Friendly fallback screen.

**You can see:** Throw an error during dev — friendly screen, not a white page.

### 3.5 — Keyboard drag accessibility

**Build:** dnd-kit keyboard sensor enabled.

**You can see:** Build a lineup without touching the mouse.

### 3.6 — Copy polish pass

**Build:** Read every string in the UI. Fix anything half-drafted.

**You can see:** Nothing reads robotic or inconsistent.

### 3.7 — Final manual test pass

**Build:** Click through every flow. File and fix bugs.

**You can see:** Ready to share with the first real users.

---

## Deferred / post-launch

Items intentionally pulled out of the launch path. Code for these has been stripped from the codebase — when a feature here returns, recover its starting point from git history rather than rebuilding from a stale comment.

### Loose mode (was 1.11)

A per-lineup override that disables position-category eligibility, for "what if a prop played fullback" scenarios. Originally planned as a toggle in the field header that, when on, made field slot outlines dashed-orange and short-circuited `canPlayerFillPosition` to always return `true`.

**Why deferred:** simpler product surface for launch — users get the standard rules without an extra mode to explain. The eligibility logic itself stays in `rules.js` (just without the override flag).

**To revive:** the original implementation shipped in commit `66492d2`. Re-introducing it means: re-add the `looseMode` boolean to the `Lineup` data shape, restore the optional argument on `canPlayerFillPosition`, restore the toggle button in the builder header, and restore the `.loose` slot styling on the field. The shape of the change is small.

### Conflict detection (was 2.7)

Optimistic-concurrency dialog for two-tab edits. Save requests check the `version` column; mismatch → 409 → ConflictDialog with Reload (discard local) or Overwrite (force save).

**Why deferred (decided 2026-05-02):** for ~50 friends, two-tab simultaneous edits on the same lineup are vanishingly rare. Last-write-wins is acceptable for launch. Not worth the dialog code, the 409 path, or the user-education before there's evidence anyone hits it.

**To revive:** the `version` column already exists on `lineups` (kept in the schema for forward-compat). Add the `if-match` check inside `updateLineup` (Supabase PostgREST `Prefer: return=representation` + a `where version = x` predicate), surface the 409 to the caller, and build a `ConflictDialog` component.

### Sharing — read-only public links (was 2.9 + 2.10)

Share button → generates slug → inserts denormalised snapshot into `shared_lineups` → `/share/:slug` renders frozen lineup read-only. Dashboard shows which lineups are shared; revoke deletes the row.

**Why deferred (decided 2026-05-02):** want a solid DB + auth foundation working end-to-end before adding a second data model and a public route. Avoid overcomplicating the first deploy.

**To revive:** add the `shared_lineups` table (DDL kept in plan §9), build `ShareDialog` + the `/share/:slug` public route with its own RLS-bypassed read path, and add the dashboard shared-indicator + revoke action. Snapshots are denormalised (player data embedded at share time) so changes to players or the source lineup don't affect the share.

### OAuth providers (Google / GitHub)

**Why deferred (decided 2026-05-02):** email + password covers the launch audience. OAuth adds identity-management surface area (account linking, provider outages, edge cases at signup) that's not worth the cost before users ask for it.

**To revive:** enable provider in Supabase Auth dashboard, add the OAuth callback redirect URL, add a "Continue with Google" button on `/login` + `/signup`. No code changes to the rest of the app — Supabase Auth normalises the session shape.

### LocalStorage → Supabase migration on first login

**Why deferred (decided 2026-05-02):** no real users yet, only MVP test lineups. The first wave of users will create their lineups directly in Supabase. Existing localStorage data is acceptable to abandon.

**To revive:** on first successful login, check `localStorage` for `origin-builder:lineup:*` keys, prompt the user ("we found N lineups in this browser — claim them?"), and bulk-insert via `createLineup` with `owner_id = auth.uid()`.
