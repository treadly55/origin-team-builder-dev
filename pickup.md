# Pickup

## Session summary (2026-05-02)

Three post-Phase-1 enhancements to the data model and create flow.

| # | Task | Commit | Headline |
|---|---|---|---|
| — | Player stats (speed / endurance / defence / workrate) | `96683f0` | Four numeric fields (0–99) added to the `Player` shape and seeded with random values for all 84 players. Display-only — shown in the expanded `PlayerCard` as a 2×2 grid below Club/Categories. `rules.js` and `autoFill.js` untouched; `rating` remains the independent overall. |
| — | Utility category | `8383e49` | New player-only category `'utility'` added to `CATEGORIES`. A utility player is eligible for **any** field position. `canPlayerFillPosition` short-circuits to `true` when `'utility'` is in `eligibleCategories`. `autoFill` pushes utility players into all three pools. Panel filter and `'U'` badge wire up automatically via `CATEGORIES` / `CATEGORY_LABELS`. Filter behaviour: selecting "Backs" does **not** include utility players (they appear only under their own filter). 4 utility players seeded (p_085, p_086 NSW; p_087, p_088 QLD). `POSITION_CATEGORY` untouched — no slot is "the utility slot". |
| — | Save button + preview draft flow + saving indicator | `81c627a` | Dashboard "+ New lineup" no longer opens a modal — it navigates straight to `/lineup/preview`, which is now a real draft route (new `LineupPreviewPage`). Save button (in the field-area header) pops a name modal, then `storage.createLineup({team, name, slots})` and redirects to `/lineup/<id>`. On `/lineup/<id>`, the same Save button is mostly cosmetic (autosave already runs); "Saving…" appears beneath it while a debounce is pending or a write is in flight, blank when idle. `createLineup` extended to accept optional `slots`. `NewLineupForm` and its modal state were deleted from `DashboardPage`. |

**Net code change:**
- New: `LineupPreviewPage.jsx` + `.module.css`. `Player` typedef extended (4 stat fields + `'utility'` in the eligibleCategories union).
- Removed: `NewLineupForm` and the create-lineup modal from `DashboardPage`. `PREVIEW_LINEUP` const removed from `App.jsx` (now lives in the preview page).
- Refactored: `LineupBuilder` accepts new `onSave` + `saveState` props; `LineupPage` lifts a small save-state machine (`'idle' | 'saving'`) and tracks both pending debounce and in-flight writes.

**What this means for next sessions:** the "create lineup" UX is now one click + (later) one Save modal. Preview is no longer a sandbox — it's the staging area for the next saved lineup. Two browser tabs both at `/lineup/preview` will independently create separate lineups on Save (last-write-wins is not applicable; they don't share state). Errors during `createLineup` aren't surfaced to the user yet — the modal just re-enables and `submitting` flips back to `false`. Worth wiring a toast in the next polish pass.

**Docs touched:**
- `docs/origin-builder-plan.md` — §2 categories decision, §5 Player example, §7 storage interface signature, §8 routes table.
- `docs/rule-functions-spec.md` — shapes block, position-categories block, Function 1 test rows 15–18, Function 4 rule 8.

---

## Session summary (2026-04-29 → 2026-04-30)

This session moved the project from "drag-and-drop demo" to **a feature-complete local-first MVP**. Six roadmap items shipped, plus one substantial scope change (loose-mode strip).

| # | Task | Commit | Headline |
|---|---|---|---|
| 1.12 | Player card expand/collapse | `57b3286` | Chevron toggle reveals club + full category labels. Each card independent. Drag still works. |
| 1.13 | Team selector + panel filters | `5a564ca` | NSW/QLD switcher in page header (team colours). Search + multi-select chips → later refined to single-select segmented pill (All / Backs / Halves / Forwards). Panel widened 320 → 420 px. Switching teams is a full refresh. |
| 1.14 | Storage interface + localStorage backend | `ca35633` | `src/lib/storage/index.js` re-exports a single backend. Methods: list/get/create/update/duplicate/deleteLineup, listPlayers. All async. `window.storage` exposed in DEV only. `getCurrentUser` deferred to Phase 2. |
| — | Loose-mode strip | `fa52ae7` | Removed the "Category rules" toggle, `looseMode` state, the `looseMode` arg on `canPlayerFillPosition`, and the `.loose` slot styling. Eligibility is now strictly enforced for positions 1–13. Docs updated; recovery point preserved. |
| 1.15 | Save + load via localStorage | `7cccae5` | `LineupPage` loads a lineup by `:id`, hydrates `LineupBuilder`, runs 400 ms-debounced auto-save, flushes pending save on unmount/navigation. 404 redirect on missing lineup. `/lineup/preview` keeps an in-memory stub so demoing doesn't pollute storage. Team-switch confirm dialog (Discard/Cancel) appears in preview when slots are non-empty. |
| 1.16 | Dashboard + reusable modal | `5f030e0` | `/dashboard` lists lineups by `updatedAt` desc. Each row links to its lineup. "+ New lineup" modal collects name + team, then navigates to the new builder. Reusable `<Modal>` extracted at `src/components/common/Modal.jsx`. Dates render relative-then-absolute via `formatRelativeOrAbsolute`. |
| 1.17 | Dashboard actions (rename, duplicate, delete) | _uncommitted_ | Per-row kebab (⋮) menu opens a dropdown with Rename / Duplicate / Delete. Rename + delete each use `<Modal>` (delete uses destructive-red). Click-outside + ESC dismiss the dropdown. Each action re-runs `listLineups()` to refresh. |

**Net code change** across the session, vs. its starting state:
- New: storage layer, dashboard, lineup page with hydration + auto-save, reusable modal, date formatter, kebab menu.
- Removed: loose-mode toggle and its surrounding code (deferred to post-launch).
- Refactored: `LineupBuilder` is now controlled-with-notify (`initialLineup` + optional `onChange`) rather than self-contained; the team selector is preview-only and saved lineups display a static team label.

**Phase 1 is now complete** per `docs/development-roadmap.md`. The app does the full single-user loop: create → build → save → list → rename / duplicate / delete.

---

## Phase 2 — locked plan (decided 2026-05-02)

The 11-question planning conversation was answered on 2026-05-02. This section replaces the open question list. The resulting milestone order lives in `docs/development-roadmap.md` (Phase 2 section); Supabase project setup is documented click-by-click in `docs/supabase-setup.md`.

### Decisions

| # | Question | Decision | Notes |
|---|---|---|---|
| A1 | Supabase project | **To be created** | Phase 2.1 creates `origin-builder-dev` first; `origin-builder-prod` later when launching. |
| A2 | Dev environment | **Hosted Supabase** | No local CLI / Docker. Simpler. Dev data lives online — fine for MVP. |
| A3 | Deployment target | **Netlify** | Per original plan. SPA fallback via `netlify.toml`. |
| A4 | Domain | **`*.netlify.app`** | Custom domain not needed for launch. |
| B5 | Auth providers | **Email + password only** | OAuth (Google/GitHub) parked. |
| B6 | LocalStorage migration | **Abandon** | No real users yet — only MVP test lineups. Migration prompt parked. |
| B7 | Conflict detection | **Parked** | Last-write-wins is acceptable for ~50 friends. `version` column kept for forward-compat. |
| B8 | Sharing | **Parked entirely** | Both creation (was 2.9) and management (was 2.10). Want solid DB+auth foundation first. |
| C9 | Tests | **Vitest for `rules.js` + storage layer** | New milestone 2.6. No Playwright. |
| C10 | localStorage backend | **Keep file, inactive** | Small footprint, optional fallback. |
| C11 | Marketing `/` | **Out of scope** | Homepage stays as-is; revisit post-launch. |

### Locked Phase 2 milestone order

1. **2.1** — Supabase project + 2-table schema + RLS (`docs/supabase-setup.md`)
2. **2.2** — Seed 88 players from `seedPlayers.js`
3. **2.3** — `src/lib/storage/supabaseBackend.js` (not wired)
4. **2.4** — Swap active backend → Supabase (stub user, no real auth)
5. **2.5** — **Deploy to Netlify with stub user** (moved up from old 2.8)
6. **2.6** — Vitest + tests for `rules.js` and storage layer
7. **2.7** — Real auth (email + password)
8. **2.8** — Password reset

End of Phase 2. From here: Phase 3 polish, or revisit deferred items (sharing, conflict detection, OAuth, localStorage migration).

### Why deploy at 2.5 instead of after auth

Every feature that lands after the deploy gets verified against the real environment, not just localhost. `netlify.toml` + a stub user is enough — auth doesn't need to wait for the deploy and the deploy doesn't need to wait for auth.

---

## Deferred / parked

- **Panel orientation toggle** (was part of 1.13). Reserved key `origin-builder:panel-orientation` is unused.
- **Loose mode / category-rules override** (was 1.11). Stripped from code; recover from commit `66492d2`.
- **Marketing landing page at `/`.** Out of scope. Slot in alongside Phase 2 §2.5 or before, per planning above.
