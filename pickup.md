# Pickup

## Session summary (2026-05-03)

**Headline: Phase B is fully closed. Players AND lineups now come from Supabase end-to-end. The local JS seed and the localStorage backend have been retired.**

This session built on the prior Phase B work (`de3f77f`, `01b8462`, `a371e9b`) and finished it off:

| Block | Commit | What |
|---|---|---|
| Doc + roadmap setup (prior session) | `a371e9b` `01b8462` | Phase 2 reordered into A/B/C; `docs/supabase-setup.md` written click-by-click |
| Phase B execution (prior session) | `de3f77f` | New `.env.example`, `src/lib/supabase.js`, `supabaseBackend.js`, `supabase/seed_players.sql` (88 players, 44+44). `storage/index.js` flipped to Supabase. Smoke-test button on dashboard. |
| **Phase B finish (this session)** | `d9bb913` | `LineupBuilder` now fetches players via `storage.listPlayers(team)`. Smoke-test button removed from dashboard. |
| **Dead-code removal (this session)** | `4141347` | Deleted `src/domain/seedPlayers.js` and `src/lib/storage/localStorageBackend.js`. |
| **Doc reconciliation (this session)** | _this commit_ | Plan, getting-started, roadmap, setup doc all now reflect post-pivot reality. |

### What now lives in Supabase

- **Project:** `origin-builder-dev` (Sydney region, free tier)
- **Tables:** `players` (88 rows seeded, the canonical roster), `lineups` (rows accumulate as you build)
- **RLS:** OFF on both tables — the public anon key has full read/write access. **Local-only / unlisted-only until Phase C.**
- **No `owner_id`** on `lineups` yet (added in Phase C when auth lands)
- **`version` column** kept on `lineups` for forward-compat, even though conflict detection is parked

### The mid-session pivot, locked in

We pivoted away from "auth + RLS + multi-table from day one" to **"single-user real data first, auth later."** That choice is now reflected in:
- `docs/origin-builder-plan.md` — §11 phases describe A / B / C
- `docs/development-roadmap.md` — Phase 2 banner points readers at the setup doc
- `docs/supabase-setup.md` — the live click-paths

The storage abstraction (`src/lib/storage/index.js`) earned its keep: only one place imports the backend, and Phase C will be a wrapper around the same interface.

### Critical detail worth remembering

Player IDs in `slots` are **Supabase UUIDs** now, not the legacy `p_001`-style strings. Any lineup row in Supabase that pre-dates commit `d9bb913` references IDs that no longer exist; opening it will render an empty field. Wipe with `truncate lineups;` if you want a clean dashboard, or just delete via the UI.

---

## Next steps — Phase C (auth)

Detailed outline lives in `docs/supabase-setup.md` "Phase C — Add auth (deferred)". Order of operations:

1. **C1 — Schema migration.** Add nullable `owner_id` column to `lineups`, decide what to do with existing single-user rows (truncate is cleanest), then enforce NOT NULL.
2. **C2 — Re-enable RLS with policies.** Both tables. Policy block already drafted in the doc.
3. **C3 — Wire Supabase Auth in the app.** New routes (`/login`, `/signup`, `/forgot-password`, `/reset-password`). `<RequireAuth>` wrapper around protected routes. Logout button. Add `getCurrentUser()` to the storage interface.
4. **C4 — Update queries.** Add `.eq('owner_id', currentUser.id)` to every lineup query in `supabaseBackend.js`. Pass `owner_id` on every insert.
5. **C5 — Configure Supabase Auth dashboard.** Enable email provider (already on by default). Set Site URL + Redirect URLs allow list. Decide on email confirmation (off for dev, on for prod).

Once C is done, **Phase 2 is properly closed** and the app is ready for Netlify deploy.

### Open questions for the start of the next session

- Still happy with email-only auth, or any second thoughts about adding Google OAuth at the same time?
- For C1: truncate `lineups` and start fresh, or backfill a single owner_id? (Truncate is cleaner — no real users yet.)

---

## Reference

- **Supabase setup click-paths** — `docs/supabase-setup.md` (Phase B "where you are" section + Phase C outline at the bottom)
- **Project plan** — `docs/origin-builder-plan.md` (§2 Decisions and §11 Phases reflect the current locked state)
- **Phase 2 milestone order** — `docs/development-roadmap.md` carries the original 2.0–2.8 numbering for git-history alignment, with a banner at the top redirecting to the setup doc as the source of truth.
- **Seed data** — `supabase/seed_players.sql` (re-runnable; starts with `truncate players;`)
