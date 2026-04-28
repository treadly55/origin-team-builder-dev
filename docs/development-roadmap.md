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

**Build:** `src/domain/seedPlayers.js` containing the 56-player array (translated from `seed_players.sql`). `src/domain/rules.js` with all five rule functions. Manually verify each function against the test cases in `rule-functions-spec.md` by running them in the browser console once.

**You can see:** Open the browser console on the home page. Type `import('./domain/rules.js').then(r => console.log(r.canPlayerFillPosition({eligiblePositions:[6]}, 6, false)))` — see `true`. Try a few rows from the test tables. (Or expose a simple debug page that runs them and prints results.)

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

### 1.9 — Bench (6 slots) and emergency (1 slot)

**Build:** `BenchRow` with 6 slots below the field. `EmergencySlot` next to it. Both accept any same-team player regardless of eligible positions. `canPlayerFillBenchOrEmergency` is checked on drop.

**You can see:** All 17 + 6 + 1 = 24 slots present and functional. Any NSW player can go on the bench or emergency. Dragging a player from a field position to the bench works.

### 1.10 — Magnetic snap

**Build:** Custom collision detection in dnd-kit. Drop within ~40px of a slot center snaps the card into the slot. Visual feedback: the target slot highlights when the dragged card is close enough.

**You can see:** You don't need pixel-perfect drops anymore. Get close, the player snaps in. The target slot lights up to confirm.

### 1.11 — Loose mode toggle

**Build:** A toggle button in the header labeled "Position rules" with a short explanation. When off (loose mode active), `canPlayerFillPosition` returns true regardless of eligibility. When loose mode is on, field slot outlines change color so it's always obvious.

**You can see:** Flip the toggle. Drag a halfback onto fullback — works now. Slot outlines look different. Toggle back, eligibility returns.

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

## Phase 2 — Supabase swap, auth, deployment, sharing

Now there's something worth deploying. We add the backend, the things only a backend can do, and put it on Netlify.

### 2.1 — Supabase project and schema

**Build:** Supabase project created via the web console. Three tables (`players`, `lineups`, `shared_lineups`) created by pasting CREATE TABLE statements from the plan §9. RLS policies applied. `.env.example` committed.

**You can see:** Supabase Table Editor shows three empty tables.

### 2.2 — Seed players in Supabase

**Build:** `seed_players.sql` pasted into the SQL editor. Sanity queries at the bottom run.

**You can see:** 56 player rows in the `players` table. App still uses the local seed.

### 2.3 — Supabase storage backend

**Build:** Implement the storage interface backed by Supabase in `src/lib/storage/supabase.js`. Don't wire it in yet.

**You can see:** No UI change.

### 2.4 — The swap (no auth yet)

**Build:** Switch the active backend in `src/lib/storage/index.js` to the Supabase one. `getCurrentUser` continues to return a stubbed dev user — real auth comes next milestone. Players now come from Supabase. Lineups now save to Supabase. Local `.env` configured.

**You can see:** Build and save a lineup. Open Supabase Table Editor — see the row. Refresh the app — lineup loads from the database. localStorage no longer has lineup keys (only the panel orientation key remains).

### 2.5 — Real auth

**Build:** Stubbed user removed. Add `/login` and `/signup` routes. Supabase Auth wired up. Session persists across refresh. Logout button. Logged-out users hitting `/dashboard` or `/lineup/:id` get redirected to `/login`.

**You can see:** Create an account, log out, log back in. Two browsers logged in as the same user see the same lineups. Logged-out users can't see the dashboard.

### 2.6 — Password reset

**Build:** "Forgot password" link on login. Request-reset and reset-password pages using Supabase's built-in flow.

**You can see:** Reset a password end-to-end via real email.

### 2.7 — Conflict detection

**Build:** Save requests check the `version` column. Mismatch → 409. ConflictDialog appears: "This lineup was modified elsewhere. Reload to see changes reflected here." Reload (discard local) or Overwrite (force save).

**You can see:** Open the same lineup in two tabs. Save in tab A. Try to save in tab B — dialog appears. Reload in tab B — see tab A's state.

### 2.8 — Deploy to Netlify

**Build:** `netlify.toml` with SPA fallback (`/* → /index.html 200`). Netlify site created, linked to the repo, auto-deploying from `main`. Env vars (Supabase URL + anon key) set in Netlify site settings.

**You can see:** Visit the live Netlify URL — log in, build a lineup, see it persist. Direct-loading `/dashboard` doesn't 404 (SPA fallback works).

### 2.9 — Share link creation and viewing

**Build:** Share button in the builder header opens `ShareDialog`. Creating a link generates a slug and inserts a row in `shared_lineups` with the full denormalised snapshot. Dialog shows the URL with a copy button. `/share/:slug` public route renders the frozen lineup read-only — no drag, no edit.

**You can see:** Create a share link, copy it, open in incognito with no account — the lineup renders correctly.

### 2.10 — Share management and revocation

**Build:** Dashboard indicator shows whether each lineup has an active share. Revoke action deletes the `shared_lineups` row. Revoked slugs return 404.

**You can see:** See which lineups are shared. Revoke a share — link is dead.

**End of Phase 2.** The app does everything it needs to. From here, polish.

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
