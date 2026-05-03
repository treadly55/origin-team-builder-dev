# Supabase setup — next steps

A working doc. Picks up from where the database is fully set up and seeded.

## Where you are

- ✅ Supabase project created, `.env` wired, smoke test green
- ✅ Schema in place — `players` and `lineups` tables, RLS off
- ✅ 88 fake players seeded from `supabase/seed_players.sql` (44 NSW + 44 QLD)
- ✅ **Phase B complete** — `LineupBuilder` reads players from Supabase; lineups save end-to-end. JS seed and localStorage backend deleted (`d9bb913`, `4141347`).

**Phase B is closed.** Phase C is next: add `owner_id`, enable RLS, wire Supabase Auth, deploy.

## What gets you to "real data on the dev site"

| Step | What | Where | Time |
|---|---|---|---|
| **B3** | Write `src/lib/storage/supabaseBackend.js` | code | ~15 min |
| **B4** | Flip the active backend in `src/lib/storage/index.js` | code (1 line) | ~30 sec |
| **B5** | Test in the app | dev server | ~5 min |

After B5: the dashboard lists lineups from Supabase, the builder saves to Supabase, refresh persists, opening in another browser shows the same data.

Cleanup (B6) and Phase C (auth) come after.

---

## B3 — Write the Supabase storage backend

Goal: a new file `src/lib/storage/supabaseBackend.js` that exports an object with the **same shape** as `localStorageBackend.js`, so flipping between them in B4 is a one-line change.

### Mirror the existing contract

`localStorageBackend.js` exports an object with these methods. Keep the same names, same arguments, same return shapes:

| Method | Returns | Notes |
|---|---|---|
| `listPlayers(team)` | `Player[]` | `team` is `'NSW'` or `'QLD'` |
| `listLineups()` | `LineupSummary[]` — `{id, name, team, updatedAt}` | sorted newest first |
| `getLineup(id)` | `Lineup` or `null` | `null` if not found |
| `createLineup({team, name, slots = {}})` | new `Lineup` | DB defaults handle `version`, timestamps |
| `updateLineup(lineup)` | updated `Lineup` with `version+1` and fresh `updatedAt` | |
| `duplicateLineup(id)` | new `Lineup` named `"<original> (copy)"` | |
| `deleteLineup(id)` | `void` | |

All methods are `async`. Use the existing `supabase` client from `src/lib/supabase.js` — don't create a second one.

### Snake_case ↔ camelCase mapping

Postgres uses snake_case columns; the app's data shapes use camelCase. Every method that returns DB rows must map.

**Lineup:**
| DB column | App field |
|---|---|
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| (rest match) | (rest match) |

**Player:**
| DB column | App field |
|---|---|
| `eligible_categories` | `eligibleCategories` |
| `photo_url` | `photoUrl` |
| (rest match) | (rest match) |

### Query reference (one-liner per method)

| Method | Supabase query |
|---|---|
| `listPlayers(team)` | `from('players').select('*').eq('team', team).order('rating', {ascending: false})` |
| `listLineups()` | `from('lineups').select('id, name, team, updated_at').order('updated_at', {ascending: false})` |
| `getLineup(id)` | `from('lineups').select('*').eq('id', id).maybeSingle()` |
| `createLineup(...)` | `from('lineups').insert({team, name, slots}).select().single()` |
| `updateLineup(lineup)` | `from('lineups').update({name, slots, version: lineup.version + 1, updated_at: nowIso}).eq('id', lineup.id).select().single()` |
| `duplicateLineup(id)` | fetch source, then `insert({team, name: '<source> (copy)', slots: source.slots}).select().single()` |
| `deleteLineup(id)` | `from('lineups').delete().eq('id', id)` |

Every call returns `{ data, error }` — throw on error so the UI's existing try/catch story still works.

### Important: don't re-implement what the DB does

- **`id`** — let Postgres generate it (`default gen_random_uuid()`). Don't set it in INSERT.
- **`version`** — DB defaults to 1 on insert; bump explicitly on update.
- **`created_at` / `updated_at`** — DB defaults handle insert; bump `updated_at` explicitly on update.

---

## B4 — Flip the active backend

In `src/lib/storage/index.js`, swap the import + export. **One line of meaningful change.**

Before:
```js
import { localStorageBackend } from './localStorageBackend.js'
export const storage = localStorageBackend
```

After:
```js
import { supabaseBackend } from './supabaseBackend.js'
export const storage = supabaseBackend
```

Nothing else in the app needs to know — that's the entire point of having `storage/index.js` as the single import point.

---

## B5 — Test in the app

1. `npm run dev`
2. Go to `/dashboard`
   - **Expected:** if you previously had localStorage lineups, they're now invisible (correct — different backend). The list will be empty.
3. **+ New lineup** → name it `"supabase test"` → NSW → continue to the builder
4. Drag a couple of players onto positions → autosave runs (you'll see "Saving…" briefly)
5. Open Supabase **Table Editor → lineups** → you should see one row, with `slots` populated as JSON
6. Refresh the dev site → the lineup loads from Supabase
7. Edit the lineup again → see `version` increment in Supabase
8. Open the same dev URL in an incognito window → same lineup is visible there too (single-user mode working as designed)
9. Delete the lineup from the dashboard → row disappears from Supabase

If all 9 work, **Phase B is done.** The app is now using real cloud data.

---

## ~~After Phase B works — cleanup (B6)~~ ✅ Done

Done in commits `d9bb913` (smoke-test button removal + `LineupBuilder` swap to `storage.listPlayers`) and `4141347` (deleted `src/domain/seedPlayers.js` and `src/lib/storage/localStorageBackend.js`). Git history has both if you ever want them back.

---

## Phase C — Add auth (deferred)

When you're ready to share the app with anyone other than yourself, this is what changes. Outline only.

### C1 — Migrate the schema

```sql
alter table lineups add column owner_id uuid references auth.users(id) on delete cascade;
-- backfill existing rows with your auth user's id, or just delete them
alter table lineups alter column owner_id set not null;
```

### C2 — Re-enable RLS with policies

```sql
alter table players enable row level security;
create policy "players are readable by authenticated users"
  on players for select to authenticated using (true);

alter table lineups enable row level security;
create policy "users read their own lineups"   on lineups for select  to authenticated using (owner_id = auth.uid());
create policy "users insert their own lineups" on lineups for insert  to authenticated with check (owner_id = auth.uid());
create policy "users update their own lineups" on lineups for update  to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "users delete their own lineups" on lineups for delete  to authenticated using (owner_id = auth.uid());
```

### C3 — Wire Supabase Auth in the app

- `/login`, `/signup`, `/forgot-password`, `/reset-password` routes
- `<RequireAuth>` wrapper around `/dashboard` and `/lineup/:id`
- Logout button in dashboard header
- `getCurrentUser()` becomes `supabase.auth.getUser()`

### C4 — Update queries

Add `.eq('owner_id', currentUser.id)` to every lineup query; pass `owner_id` on every insert.

### C5 — Configure Supabase Auth dashboard

- **Authentication → Providers → Email** — confirm enabled. Dev: confirm-email OFF; prod: ON
- **Authentication → URL Configuration** — Site URL + Redirect URLs allow list (`http://localhost:5173/**`, plus the Netlify URL when deployed)

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `permission denied for table players` or empty arrays from select | RLS got re-enabled. Phase B expects RLS **disabled** on both tables. Check **Authentication → Policies**. |
| `Invalid API key` | `.env` typo, or you forgot to restart `npm run dev` after editing `.env`. |
| App saves successfully but rows don't appear in Supabase | Wrong project — check `VITE_SUPABASE_URL` matches the project you're viewing in the dashboard. |
| 500 errors immediately after schema changes | PostgREST schema cache stale. **Database → API Settings → Reload schema**. |
| Deleted a lineup but the dashboard still shows it | Hard refresh — the in-memory list isn't auto-revalidating. (If this becomes annoying, that's a `refresh()` call missing from the Supabase backend's mutation methods.) |
| Dashboard is empty when you expected to see localStorage lineups | Expected after B4. The two backends don't share data. localStorage lineups are abandoned per the no-auth-phase decision. |
