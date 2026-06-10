# Session management — auth implementation notes

What was added to take the app from anonymous/single-user to per-account auth via Supabase Auth, and the design decisions behind it. Picks up from `supabase-setup.md` Phase C.

## Where you are

- ✅ `AuthProvider` wired around the whole app, tracking the Supabase session
- ✅ Combined login/signup page at `/login` (no separate `/signup` route)
- ✅ Forgot-password flow (`/login` → modal → email link → `/reset-password`)
- ✅ Route guards: `/dashboard`, `/lineup/preview`, `/lineup/:id` require a session; `/login` redirects away if already signed in
- ✅ `owner_id` wired into `createLineup`, `duplicateLineup`, `listLineups`
- ✅ Sign-out button in the dashboard header

**Not yet done** (see `supabase-setup.md` Phase C for the SQL):
- `owner_id` column doesn't exist on `lineups` yet — needs the `alter table` + backfill
- RLS is still off
- No real account has been created/tested through the new flow yet

---

## New files

| File | Purpose |
|---|---|
| `src/lib/auth/AuthProvider.jsx` | React context wrapping `supabase.auth`. Exposes `user`, `session`, `loading`. |
| `src/components/auth/ProtectedRoute.jsx` | `RequireAuth` and `RedirectIfAuthed` route wrappers. |
| `src/pages/LoginPage.jsx` + `.module.css` | Combined login/signup/forgot-password UI. |
| `src/pages/ResetPasswordPage.jsx` | Destination for the password-reset email link; sets a new password. |

## Changed files

| File | Change |
|---|---|
| `src/App.jsx` | Wrapped in `<AuthProvider>`; added `/login` and `/reset-password` routes; wrapped protected routes in `<RequireAuth>`. |
| `src/lib/storage/supabaseBackend.js` | Added `currentUserId()` helper; `createLineup`/`duplicateLineup` now write `owner_id`; `listLineups` filters `.eq('owner_id', ownerId)`. |
| `src/pages/DashboardPage.jsx` + `.module.css` | Added a "Sign out" button next to "+ New lineup". |

---

## Design decisions

### One page, not separate `/login` and `/signup` routes

The plan originally called for separate signup/login pages (and a password-reset flow as its own page set). Per direction, this was collapsed into a single `/login` page:

- Login form is the default, primary content (email + password + submit)
- "Don't have an account? Sign up" opens the existing `Modal` component with a signup form
- "Forgot password?" opens the same `Modal` with an email-only form

**Why:** fewer routes to guard, fewer pages to build, and the user explicitly asked for this shape — a single entry point that handles both directions of account access. Reusing `Modal` kept this to ~150 lines instead of three separate page+route combos.

### `/reset-password` stays a real route, not a modal

Unlike signup/forgot-password, the "set a new password" step **must** be its own page. The user arrives there via an emailed link (`redirectTo: ${origin}/reset-password`) carrying a Supabase recovery token in the URL — there's no "open a modal from an email link" option, and Supabase's client picks up the recovery session from the URL automatically on page load.

It's left **outside** the `RequireAuth` guard since the user isn't fully "logged in" yet at that point — they're in a password-recovery session.

### Redirect target after auth is always `/dashboard`

`RedirectIfAuthed` sends signed-in users straight to `/dashboard` (confirmed default — no "return to where you came from" logic). This keeps the auth flow simple: there's no need to track an intended-destination URL through the login round-trip. If deep-link preservation becomes desirable later (e.g. someone clicks a shared lineup link while signed out), that would need a small addition — capturing `location.state.from` in `RequireAuth` and reading it back in `LoginPage`.

### Signup handles both confirm-email modes

`supabase.auth.signUp()` behaves differently depending on the project's **Authentication → Providers → Email → Confirm email** setting:
- **Off** (dev default per `supabase-setup.md`): returns a session immediately — the modal closes and `RedirectIfAuthed` sends the user to `/dashboard`
- **On** (recommended for prod): returns no session — the modal switches to a "check your email" message

`SignupForm` checks `data.session` to branch between these without needing to know which mode is configured. This means the same code works whether or not confirm-email is toggled on later for production.

### `owner_id` resolved per-call, not cached

`currentUserId()` calls `supabase.auth.getUser()` fresh on every `createLineup` / `duplicateLineup` / `listLineups`, rather than reading a cached id from `AuthProvider`. The storage layer (`supabaseBackend.js`) is intentionally decoupled from React — it has no access to context, and `getUser()` is cheap (reads the local session, only round-trips to the server if the JWT needs refreshing).

### `RequireAuth` / `RedirectIfAuthed` render `null` while loading

`AuthProvider` initializes `session` to `undefined` (distinct from `null`, which means "checked, no session"). Both guards treat `loading` (i.e. `session === undefined`) as "render nothing yet" rather than redirecting — this avoids a flash of the login page for users who actually have a valid session, while `getSession()` resolves.

---

## What's left to wire up (Phase C continuation)

Straight from `supabase-setup.md`, still pending:

1. **C1** — `alter table lineups add column owner_id ...`, backfill, `set not null`
2. **C2** — re-enable RLS with the policies listed there
3. Create a real account through `/login`'s signup modal and confirm the dashboard correctly scopes to `owner_id`
4. Decide on confirm-email setting for prod and verify the "check your email" branch end-to-end
