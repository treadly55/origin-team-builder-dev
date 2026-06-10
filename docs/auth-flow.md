# Auth flow (Phase C)

What Phase C built, how the pieces fit together, and the UX for every branch
a user can hit. Confirmed working: cross-account lineup isolation (a second
account sees an empty dashboard, and opening another account's `/lineup/:id`
link lands on `/404`).

## Architecture

| Piece | File | Role |
|---|---|---|
| `AuthProvider` | `src/lib/auth/AuthProvider.jsx` | Wraps the app, tracks the Supabase session via `getSession()` + `onAuthStateChange`. Exposes `{ user, session, loading }`. |
| `RequireAuth` | `src/components/auth/ProtectedRoute.jsx` | Redirects to `/login` if no session. |
| `RedirectIfAuthed` | `src/components/auth/ProtectedRoute.jsx` | Redirects to `/dashboard` if a session exists. |
| `LoginPage` | `src/pages/LoginPage.jsx` | Combined login form + signup modal + forgot-password modal. |
| `ResetPasswordPage` | `src/pages/ResetPasswordPage.jsx` | Standalone route for the "set new password" step (recovery link lands here). |
| `supabaseBackend.js` | `src/lib/storage/supabaseBackend.js` | `currentUserId()` resolves `auth.getUser()` per call; `createLineup`/`duplicateLineup`/`listLineups` read/write `owner_id`. |

### Routes (`src/App.jsx`)

| Route | Guard | Notes |
|---|---|---|
| `/` | none | Home page |
| `/login` | `RedirectIfAuthed` | Login form + signup/forgot-password modals |
| `/reset-password` | none | Outside `RequireAuth` — see [Reset password](#3-forgot-password--reset-password) |
| `/dashboard` | `RequireAuth` | Lineup list, scoped to `owner_id` |
| `/lineup/preview` | `RequireAuth` | New, unsaved lineup |
| `/lineup/:id` | `RequireAuth` | Existing lineup, fetched by id |
| `/404` | none | Catch-all |

### Loading state

`AuthProvider` initializes `session` to `undefined` (not `null`). Both guards
treat `loading` (`session === undefined`) as "render nothing yet" — this
avoids a flash of `/login` for a user who actually has a valid session while
`getSession()` resolves.

---

## Flows and what-if scenarios

### 1. Sign up

Entry point: `/login` → "Don't have an account? Sign up" → modal (`SignupForm`).

| Scenario | What happens |
|---|---|
| Email confirmation **off** (current dev setting) | `supabase.auth.signUp()` returns a session immediately. Modal closes via `onDone()`. `RedirectIfAuthed` (the page is still `/login`) sends the user to `/dashboard`, which loads empty (no lineups yet for this `owner_id`). |
| Email confirmation **on** (recommended for prod) | `signUp()` returns no session. Modal switches to "Check **`<email>`** for a confirmation link to finish creating your account." User stays on `/login` until they click the emailed link. |
| Sign-up error (e.g. email already registered, weak password) | `signUpError.message` is shown inline in the modal. Modal stays open, user can retry. |
| Password under 6 chars | Blocked client-side — `<input minLength={6} required>`. |

### 2. Log in

Entry point: `/login`, primary form.

| Scenario | What happens |
|---|---|
| Correct email + password | `signInWithPassword()` succeeds → `onAuthStateChange` fires → `AuthProvider`'s `session` updates → `RedirectIfAuthed` on `/login` immediately redirects to `/dashboard`. |
| Wrong password / unknown email | `signInError.message` ("Invalid login credentials") shown inline. Form stays filled in (except password — browser dependent), user can retry. |
| Already logged in, user navigates to `/login` directly (e.g. bookmark, back button) | `RedirectIfAuthed` sends them straight to `/dashboard` — they never see the form. |
| Submitting twice quickly | Guarded by `submitting` state — second submit is a no-op until the first resolves. |

**No "return to where you came from"** — redirect target after login/signup is
always `/dashboard`. If a signed-out user follows a deep link to
`/lineup/:id`, they're bounced to `/login`, then to `/dashboard` after
authenticating — not back to the original lineup. (Documented as a known
simplification in `docs/session-management.md`; would need
`location.state.from` plumbing to fix.)

### 3. Forgot password / reset password

Entry point: `/login` → "Forgot password?" → modal (`ForgotPasswordForm`) →
email link → `/reset-password`.

| Scenario | What happens |
|---|---|
| Submit email in "Forgot password?" modal | `resetPasswordForEmail()` called with `redirectTo: <origin>/reset-password`. Modal always shows "If an account exists for **`<email>`**, a reset link has been sent." — **same message regardless of whether the email exists**, so the flow can't be used to enumerate accounts. |
| User clicks the emailed link | Lands on `/reset-password`. Supabase's client picks up the recovery token from the URL automatically and starts a recovery session. |
| `/reset-password` is **not** behind `RequireAuth` | Necessary — the user isn't "logged in" in the normal sense yet, only holds a short-lived recovery session from the link. Putting it behind `RequireAuth` would bounce them to `/login` before they could set a new password. |
| User submits a new password | `supabase.auth.updateUser({ password })`. On success, page switches to "Your password has been updated." with a "Continue to dashboard" button. |
| Update error (e.g. password too short, expired/invalid recovery link) | `updateError.message` shown inline; user can retry (if the link expired, they need to request a new one from `/login`). |
| User visits `/reset-password` directly with no recovery token | Form renders normally; submitting will fail with a Supabase auth error (no active recovery session) — shown inline as above. |

### 4. Sign out

Entry point: "Sign out" button in the dashboard header (`DashboardPage.jsx`).

| Scenario | What happens |
|---|---|
| Click "Sign out" | `supabase.auth.signOut()` → `onAuthStateChange` fires with `null` session → every `RequireAuth`-guarded route now redirects to `/login` on next render/navigation. |
| Already on `/dashboard` when signing out | `RequireAuth` re-evaluates (`user` becomes `null`) and redirects to `/login` immediately — no extra click needed. |

### 5. Visiting protected routes while signed out

| Scenario | What happens |
|---|---|
| Direct navigation / bookmark to `/dashboard`, `/lineup/preview`, or `/lineup/:id` while signed out | `RequireAuth` redirects to `/login` (`replace`, so back button doesn't loop). |
| Session check still in flight (`loading === true`) | Guard renders `null` — brief blank screen, then either the page or a redirect, depending on the resolved session. No flash of `/login` for an actually-authenticated user. |

### 6. Cross-account data access — ✅ confirmed

This is the scenario RLS on `lineups` exists to prevent, and it's now been
tested with a second real account.

| Scenario | What happens |
|---|---|
| User B opens `/dashboard` | `listLineups()` filters `.eq('owner_id', ownerId)` **and** RLS double-enforces it server-side — User B sees only lineups they created, never User A's. |
| User B opens a `/lineup/:id` link belonging to User A | `getLineup(id)` runs `.eq('id', id).maybeSingle()` with **no** `owner_id` filter in the JS — RLS's `select` policy (`owner_id = auth.uid()`) makes the row invisible to User B, so the query returns `null`. `LineupPage` sets `notFound`, which renders `<Navigate to="/404" replace />`. |
| User B tries to rename/duplicate/delete a lineup they don't own (e.g. via crafted request, not reachable through normal UI) | Blocked by the `update`/`delete` RLS policies (`owner_id = auth.uid()`) — the query affects zero rows. |

The 404-on-foreign-lineup behavior is a side effect of RLS hiding the row,
not a dedicated "403 Forbidden" page — which is why it's "acceptable" rather
than a distinct designed state. A user can't distinguish "this lineup doesn't
exist" from "this lineup exists but isn't yours."

---

## Data isolation status

| Table | RLS | Policies |
|---|---|---|
| `lineups` | ✅ enabled | 4 policies (`select`/`insert`/`update`/`delete`, all gated on `owner_id = auth.uid()`), defined in `docs/lineups-table-setup.sql` |
| `players` | ✅ enabled | 1 policy — `select` for `authenticated`, `using (true)` (shared roster, not per-owner; no insert/update/delete from the client). |

Both tables are now RLS-protected. Phase C is functionally complete; remaining items are deploy-related (see below).

---

## Known gaps / open items

- **No deep-link return-to** — see [Log in](#2-log-in). Low priority; only matters for shared-link scenarios.
- **Email confirmation mode** — currently off (dev). Decide on/off for prod and re-verify the "check your email" branch in [Sign up](#1-sign-up) once changed.
- **No 403 state** — foreign lineups 404 instead of showing a distinct "not yours" message. Acceptable per current direction; revisit only if it causes user confusion.
- **Supabase Auth URL config for prod** — `Site URL` and `Redirect URLs` allow list need the Netlify URL added once deployed (see `docs/supabase-setup.md` C5). Without this, the password-reset email link (`redirectTo: <origin>/reset-password`) won't round-trip correctly on the live site.
