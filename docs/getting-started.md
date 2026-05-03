# Origin Builder — Getting Started

A short orientation. If you're joining this project, read this first, then read `origin-builder-plan.md` and `rule-functions-spec.md`.

## What this is

A web app for building State of Origin rugby league lineups. Users pick a team (NSW or QLD), drag players from a side panel onto a formation field, save multiple lineups, and (eventually, in Phase 2) share read-only snapshot links.

State of Origin is an annual three-match rugby league series between two Australian states. Picking the team is a national sport in its own right — everyone has an opinion on who should start at fullback. This app scratches that itch with a proper UI instead of arguing in a group chat.

## Scope

**What it is:**
- A lineup builder with drag-and-drop and position eligibility rules
- Account-based (in Phase 2) so users can save multiple lineups
- Read-only snapshot sharing via link (Phase 2)
- Desktop-only for v1
- A private project for ~50 friends

**What it isn't:**
- Not a fantasy league. No scoring, no gameweek tracking.
- Not real-time collaborative.
- Not mobile-responsive in v1.
- Not real NRL data — seeds are fictional.
- Not ad-supported or monetised.

## Core concepts

**Teams:** NSW Blues and QLD Maroons. Every player belongs to one. Every lineup is one team.

**Positions 1–13:** Standard rugby league field positions (fullback through lock). The app enforces position eligibility on these.

**Bench (positions 14–19):** A 6-slot bench rendered as a brown vertical column to the left of the field. The bench is unrestricted — any player can go on any bench slot, no eligibility check, no team check. Dragging a bench player onto another bench slot swaps them.

**Position eligibility:** Each player has a list of eligible position categories (e.g., `["backs"]` means they can fill any of positions 1–5). The app enforces this for field positions 1–13. The bench has no eligibility rule. A per-lineup loose-mode override is deferred — see the roadmap's "Deferred / post-launch" section.

**Lineup:** 13 field starters + 6 bench, one team, owned by one user. Users can have many.

**Snapshot:** When a lineup is shared, player data is frozen into a separate record. Later edits don't change the share.

## The stack in one paragraph

React 18 on Vite. Plain JavaScript — **no TypeScript**. CSS Modules for styling — **no Tailwind**. Drag-and-drop via dnd-kit. State via React's built-in hooks. React Router for routing. Supabase (`@supabase/supabase-js`) is the backend; both players and lineups live there. **No tests** — manual verification only. **Not yet deployed** — single-user mode without RLS is unsafe to expose; Netlify deploy comes after auth (Phase C).

## How the code is organised

```
src/
  domain/
    rules.js              ← four pure rule functions
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
  styles.css              ← global CSS resets, variables
```

Two architectural rules:

1. **`domain/` doesn't import from anywhere else.** Pure logic stays pure. Rule functions don't know about React, storage, or the DOM.
2. **Components and hooks talk only to `storage`, never directly to Supabase.** Keeps Phase C (auth + per-user filtering) a contained change.

## Working with Claude Code

This project is built with Claude Code. A few conventions:

- **One milestone at a time.** Don't hand Claude Code "do Phase 1." Hand it "do milestone 1.6." Look at the result before moving on.
- **Manual verification is the testing strategy.** Claude Code shouldn't write tests unprompted.
- **Small diffs.** If a change starts growing, pause and reconsider scope.

## Where to go from here

1. Read `origin-builder-plan.md` for the full spec.
2. Read `rule-functions-spec.md` for the domain logic — it doubles as a manual verification checklist.
3. Look at `development-roadmap.md` for the milestone-by-milestone build order, then `supabase-setup.md` for the post-pivot Phase A/B/C path.
4. `supabase/seed_players.sql` is the canonical player roster — re-runnable against the Supabase project.
