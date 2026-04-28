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

**Positions 1–17:** Standard rugby league positions. 1–13 are starting positions with specific roles. 14–17 are interchange — no fixed position. The app adds a **6-man bench** and a **1-person emergency** that also accept any same-team player.

**Position eligibility:** Each player has a list of starting positions they're allowed to fill (e.g., `[1, 2, 5]` means fullback or either wing). The app enforces this by default. A **loose mode** toggle per lineup disables the rule for "what if a prop played fullback" scenarios.

**Lineup:** 17 starting + 6 bench + 1 emergency, one team, owned by one user. Users can have many.

**Snapshot:** When a lineup is shared, player data is frozen into a separate record. Later edits don't change the share.

## The stack in one paragraph

React 18 on Vite. Plain JavaScript — **no TypeScript**. CSS Modules for styling — **no Tailwind**. Drag-and-drop via dnd-kit. Client state via Zustand. React Router for routing. shadcn/ui pulled in component-by-component as needed. **No tests** — manual verification only. **No deployment** until Phase 2 — Netlify comes online when there's a real backend to deploy with. Phase 2 adds Supabase (Postgres + auth + RLS) and TanStack Query for server state.

## How the code is organised

```
src/
  domain/
    types.js          ← JSDoc-only documentation of data shapes
    rules.js          ← five pure rule functions
    seedPlayers.js    ← hardcoded 56-player array (deleted in Phase 2)
  components/         ← React components, grouped by feature
  pages/              ← top-level route components
  lib/
    storage/
      localStorage.js ← Phase 1 backend
      supabase.js     ← Phase 2 backend
      index.js        ← exports the active backend
  stores/             ← Zustand stores
  styles/             ← global CSS resets, variables
```

Two architectural rules:

1. **`domain/` doesn't import from anywhere else.** Pure logic stays pure. Rule functions don't know about React, storage, or the DOM.
2. **Components and hooks talk only to `storage`, never directly to localStorage or Supabase.** This is what lets the Phase 2 swap happen as a one-line change rather than a sprawling refactor.

## Working with Claude Code

This project is built with Claude Code. A few conventions:

- **`CLAUDE.md`** at the repo root captures project conventions Claude Code follows on every session: where rule functions live, the storage interface contract, the architectural rules above, and the stack decisions (no TS, no tests, no Tailwind). Keep it short.
- **One milestone at a time.** Don't hand Claude Code "do Phase 1." Hand it "do milestone 1.6." Look at the result before moving on.
- **Manual verification is the testing strategy.** Claude Code shouldn't write tests unprompted.
- **Small diffs.** If a change starts growing, pause and reconsider scope.

## Where to go from here

1. Read `origin-builder-plan.md` for the full spec.
2. Read `rule-functions-spec.md` for the domain logic — it doubles as a manual verification checklist.
3. Look at `development-roadmap.md` for the milestone-by-milestone build order.
4. Look at `seed_players.sql` once you need it — used as a JS array in Phase 1, pasted into Supabase in Phase 2.
