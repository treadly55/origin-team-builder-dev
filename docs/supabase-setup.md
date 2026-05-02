# Supabase setup — step-by-step

A click-by-click guide for standing up the Supabase project this app needs (Phase 2.1). Follow it once for **dev** now, again later for **prod** when there's something to launch.

This doc reflects the decisions locked on 2026-05-02:

- Hosted Supabase project (no local CLI / Docker)
- Email + password auth only
- Two tables (`players`, `lineups`) — sharing is parked
- Conflict detection is parked
- Free tier is sufficient for everything Phase 2 needs

If anything below stops matching the Supabase web UI (Supabase changes its dashboard often), the **concept** is what matters; click whatever the equivalent label has become.

---

## Prerequisites

- A Supabase account. Sign up at <https://supabase.com> with GitHub OAuth (one click) or email + password.
- A strong password generator handy. You'll need to save one DB password.
- This repo cloned locally with `npm install` already run.

---

## Step 1 — Create the project

1. From <https://supabase.com/dashboard>, click **New project**.
2. **Organization:** select your personal org (free tier is automatic).
3. **Project name:** `origin-builder-dev` (use `origin-builder-prod` later for the launch project).
4. **Database password:**
   - Click **Generate a password** and **copy it to your password manager immediately**. You will not see it again unless you reset it.
   - This password is for direct DB access (e.g., from a SQL client). Day-to-day app traffic uses the anon key, not this password.
5. **Region:** pick the closest Supabase region to your users.
   - For a State of Origin app: `Sydney (ap-southeast-2)`.
   - Wrong region isn't fatal — it's a latency cost, not a correctness one.
6. **Pricing plan:** **Free**. Free tier ceilings (500 MB DB, 50K monthly active users, 2 GB egress/mo) are *vastly* more than this app needs.
7. Click **Create new project** and wait ~2 minutes for provisioning.

---

## Step 2 — Grab the project URL and anon key

1. Once the project is ready, in the left sidebar go to **Project Settings → API** (the gear icon at the bottom).
2. Two values to copy:
   - **Project URL** — looks like `https://abcdefghijk.supabase.co`
   - **anon public key** — a long JWT starting with `eyJ...` (the *anon* key, NOT the *service_role* key — never use service_role in the browser)
3. Both values are safe to commit to a deployed environment as env vars. They are **not** secrets in the cryptographic sense — RLS policies are what actually protect your data.

---

## Step 3 — Wire up local env vars

In the repo root:

1. Create `.env.example` (commit this — it's a template with empty values):
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
2. Create `.env` (this is **gitignored** — never commit):
   ```
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. Confirm `.env` is in `.gitignore`. Vite reads `VITE_*` env vars and exposes them to the client bundle.

---

## Step 4 — Create the tables

In the Supabase dashboard, click **SQL Editor** in the sidebar, then **New query**. Paste the following block (copied from `docs/origin-builder-plan.md` §9), then click **Run**:

```sql
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text not null,
  team text not null check (team in ('NSW','QLD')),
  eligible_categories text[] not null,
  rating int not null check (rating between 0 and 99),
  speed int not null check (speed between 0 and 99),
  endurance int not null check (endurance between 0 and 99),
  defence int not null check (defence between 0 and 99),
  workrate int not null check (workrate between 0 and 99),
  photo_url text,
  updated_at timestamptz not null default now()
);

create table lineups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team text not null check (team in ('NSW','QLD')),
  name text not null,
  slots jsonb not null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Confirm in **Table Editor** that both tables exist and are empty.

> **Do not create `shared_lineups` yet** — sharing is parked.

---

## Step 5 — Enable Row-Level Security and add policies

By default, new Supabase tables are accessible to everyone. RLS is the security layer — without it, a malicious user with the anon key could read every lineup in the DB.

In **SQL Editor**, run:

```sql
-- players: readable by any logged-in user, writable only via service role (admin)
alter table players enable row level security;

create policy "players are readable by authenticated users"
  on players for select
  to authenticated
  using (true);

-- lineups: each user can only see and modify their own
alter table lineups enable row level security;

create policy "users can read their own lineups"
  on lineups for select
  to authenticated
  using (owner_id = auth.uid());

create policy "users can insert lineups they own"
  on lineups for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "users can update their own lineups"
  on lineups for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "users can delete their own lineups"
  on lineups for delete
  to authenticated
  using (owner_id = auth.uid());
```

Verify in **Authentication → Policies** that each table shows the policies above.

> **Why no policies for `players` writes?** Player data is seeded by you via the Table Editor (or SQL editor) — never written from the app. Without an INSERT/UPDATE/DELETE policy, the only way to write is via the service_role key, which lives only on your machine.

---

## Step 6 — Configure auth providers

1. **Authentication → Providers** in the sidebar.
2. **Email** — should already be enabled. Confirm:
   - **Enable email signups:** ON
   - **Confirm email:** **OFF for dev**, ON for prod. (Skipping confirmation in dev means you can sign up + log in with throwaway addresses. In prod, requiring confirmation prevents drive-by abuse.)
3. Leave every other provider disabled. OAuth (Google/GitHub) is parked.

---

## Step 7 — Configure auth URLs

1. **Authentication → URL Configuration**.
2. **Site URL:** `http://localhost:5173` for dev. For prod, set this to the Netlify URL (e.g., `https://origin-builder.netlify.app`).
3. **Redirect URLs (allow list):** add both:
   - `http://localhost:5173/**`
   - Later, for prod: `https://your-site.netlify.app/**`
4. Save.

These tell Supabase which URLs are allowed to receive auth callbacks (e.g., the password-reset email link). Misconfiguring this is the #1 cause of "I clicked the reset link and it sent me to the wrong place."

---

## Step 8 — Seed the players table

Phase 2.2 covers this in detail. Quick version:

1. Translate `src/domain/seedPlayers.js` (88 players) into INSERT statements.
2. Paste into SQL Editor and run.
3. Sanity-check with:
   ```sql
   select team, count(*) from players group by team;     -- expect NSW=44, QLD=44
   select unnest(eligible_categories) as cat, count(*)
     from players group by cat order by count(*) desc;
   ```

---

## Step 9 — Verify connection from the app

Once `.env` is populated and the tables exist:

1. Run `npm run dev`.
2. Open the browser console.
3. (After Phase 2.3 ships the Supabase backend file) confirm:
   ```js
   const { data, error } = await window.supabase
     .from('players')
     .select('id, name')
     .limit(5)
   console.log({ data, error })
   ```
   Expect 5 rows back, `error: null`.

If `error` is non-null:
- `Invalid API key` → re-check `.env` values, restart `npm run dev` (env vars are read at startup).
- `permission denied for table players` → RLS policy missing or wrong; re-run Step 5.
- `Failed to fetch` → wrong project URL or network issue.

---

## When it's time for production

Repeat all nine steps with a **separate** Supabase project named `origin-builder-prod`:

- Different URL + anon key — set as Netlify environment variables in the Netlify site settings, **not** in `.env` (which only covers local dev).
- Email confirmation **ON**.
- Site URL + redirect URLs point at the Netlify domain.
- Run the same DDL + RLS + seed scripts.

Keep dev and prod completely isolated. They never share data and never share credentials.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `auth.uid()` returns null in policies | User isn't logged in, or RLS is checking with the anon role instead of authenticated. |
| Client receives empty arrays from `select` | RLS policy missing; check `Authentication → Policies`. |
| Signup succeeds but no email arrives | "Confirm email" is OFF in dev (expected) — log in directly. In prod, check spam folder + Auth → Email Templates. |
| Password-reset link goes to wrong URL | Site URL or Redirect URLs misconfigured (Step 7). |
| 500 errors after schema changes | The PostgREST schema cache is stale; in **Database → API Settings** click **Reload schema**. |
