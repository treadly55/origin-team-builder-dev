# Rule Functions Spec (v1.1, plain JS)

> Pure JavaScript functions that encode the logic rules of Origin Builder. Four functions, one file (`src/domain/rules.js`), no React, no storage, no DOM.
>
> The test-case tables below are the **manual verification checklist**. After writing or changing any function, work through its tables in the browser console. If the project ever adds automated tests, the tables become Vitest cases — but for now, manual is the rule.

---

## Shared data shapes (informational)

These shapes aren't enforced by TypeScript — they're documented here and in JSDoc comments so the rule functions can be written against the same expectations.

```js
// Player
{
  id: "p_001",
  name: "Jarrah Whitlock",
  team: "NSW",                       // "NSW" or "QLD"
  eligibleCategories: ["backs"],     // subset of ["backs","halves","forwards"]. Empty array is legal.
  rating: 92,
  speed: 78, endurance: 72, defence: 65, workrate: 81,  // integers 0..99 — display only, not used by rules
  // ...other fields not used by rules
}

// Position categories:
//   "backs"     → positions 1..5
//   "halves"    → positions 6..7
//   "forwards"  → positions 8..13

// Lineup
{
  id: "l_abc123",
  team: "NSW",                        // "NSW" or "QLD"
  // looseMode field deferred — see development-roadmap.md "Deferred / post-launch"
  slots: [                            // length 19, one entry per position
    { position: 1,  playerId: "p_001" },
    { position: 2,  playerId: null },
    // ... 1..13 are field positions
    { position: 14, playerId: "p_023" },
    // ... 14..19 are bench
  ],
}

// Position numbers:
//   1..13  = field positions (eligibility-checked, team-checked)
//   14..19 = bench (unrestricted — any player allowed, no checks)
```

---

## Function 1 — `canPlayerFillPosition`

```js
export function canPlayerFillPosition(player, position) { ... }
```

> The `looseMode` override has been deferred — see development-roadmap.md "Deferred / post-launch". When the feature returns, the third argument and its associated test cases come back with it.

**What it decides:** whether a given player is allowed to be placed at a given **field** position (1–13). Bench drops do not pass through this function.

**Rules:**
1. Look up the category of `position` (Backs/Halves/Forwards) and return `true` if `player.eligibleCategories` includes that category, else `false`.

**Test cases:**

| # | `eligibleCategories` | `position` | Expected |
|---|---|---|---|
| 1 | `["backs"]` | 1 | `true` |
| 2 | `["backs"]` | 5 | `true` |
| 3 | `["backs"]` | 6 | `false` |
| 4 | `["backs"]` | 8 | `false` |
| 5 | `["halves"]` | 6 | `true` |
| 6 | `["halves"]` | 7 | `true` |
| 7 | `["halves"]` | 5 | `false` |
| 8 | `["forwards"]` | 8 | `true` |
| 9 | `["forwards"]` | 13 | `true` |
| 10 | `["forwards"]` | 7 | `false` |
| 11 | `["backs", "halves"]` | 1 | `true` |
| 12 | `["backs", "halves"]` | 6 | `true` |
| 13 | `["backs", "halves"]` | 8 | `false` |
| 14 | `[]` | 1 | `false` |

**Manual verification:** open the browser console and run each row, e.g.:
```js
canPlayerFillPosition({ eligibleCategories: ["halves"] }, 6)  // expect true
canPlayerFillPosition({ eligibleCategories: ["halves"] }, 5)  // expect false
```

---

## Function 2 — `findPlayerPlacement`

```js
export function findPlayerPlacement(lineup, playerId) { ... }
// Returns one of:
//   { kind: "slot", position: <1..19> }
//   null
```

**What it decides:** where a given player currently sits in the lineup, if anywhere.

**Rules:**
1. If the player appears in `lineup.slots`, return `{ kind: "slot", position }` for the first match.
2. Otherwise return `null`.

**Test cases:**

| # | Where `"p1"` appears | Query | Expected |
|---|---|---|---|
| 1 | slot at position 1 (field) | `"p1"` | `{ kind: "slot", position: 1 }` |
| 2 | slot at position 15 (bench) | `"p1"` | `{ kind: "slot", position: 15 }` |
| 3 | nowhere | `"p1"` | `null` |
| 4 | not in lineup | `"p99"` | `null` (unknown id) |

---

## Function 3 — `isLineupComplete`

```js
export function isLineupComplete(lineup) { ... }
```

**What it decides:** whether all 13 field positions (1–13) are filled. Bench (14–19) is not required.

**Rules:**
1. Return `true` if every slot at position 1–13 has a non-null `playerId`.
2. Otherwise return `false`.

**Test cases:**

| # | Slots 1–13 filled? | Slots 14–19 filled? | Expected |
|---|---|---|---|
| 1 | all 13 | all 6 | `true` |
| 2 | all 13 | 0 | `true` (bench doesn't matter) |
| 3 | 12 filled (pos 13 empty) | — | `false` |
| 4 | 0 filled | all 6 | `false` |

---

## Function 4 — `isLineupValid`

```js
export function isLineupValid(lineup, playersById) { ... }
// Returns: { valid: boolean, errors: [...] }
//
// Each error is one of:
//   { kind: "ineligible_player", position, playerId }
//   { kind: "duplicate_player", playerId, locations: [<placement>, ...] }
//   { kind: "wrong_team_player", playerId, location: <placement> }
```

**What it decides:** is the lineup in a legal state right now? Reports all errors, not just the first.

**Rules:**
1. **Field 1–13:** a player there fails if `canPlayerFillPosition(player, position)` is `false` → `ineligible_player` error.
2. **Field 1–13:** a player whose `team` doesn't match `lineup.team` → `wrong_team_player` error.
3. **Bench 14–19:** no team check, no eligibility check.
4. **All slots:** any player appearing more than once → one `duplicate_player` error listing all locations.
5. Missing player references (playerId not in `playersById`) → treated as "no player placed", not an error.
6. Empty slots are not errors.
7. `valid` is `true` iff `errors` is empty.

**Test cases:**

| # | Setup | Expected |
|---|---|---|
| 1 | Empty lineup (all null) | `{ valid: true, errors: [] }` |
| 2 | All 13 field filled with eligible same-team players | `{ valid: true, errors: [] }` |
| 3 | Player `[6]`-only at position 3 | `valid: false`, one `ineligible_player` for pos 3 |
| 4 | Player `[6]`-only at position 15 (bench) | `{ valid: true, errors: [] }` (bench unrestricted) |
| 5 | Same `"p1"` at position 1 AND position 2 | one `duplicate_player`, both slots listed |
| 6 | Same `"p1"` at position 1 AND on bench (pos 14) | one `duplicate_player`, both locations |
| 7 | QLD player in NSW lineup at field position 3 | one `wrong_team_player` |
| 8 | QLD player in NSW lineup at bench position 14 | `{ valid: true, errors: [] }` (bench unrestricted) |
| 9 | One ineligible AND one duplicate | two errors |
| 10 | playerId in slot but missing from `playersById` | `{ valid: true, errors: [] }` (treated as empty) |

---

## What's deliberately NOT a rule function

These are not in `rules.js` because they're either UI concerns or state-mutation concerns:

- **Placing or removing a player from a slot** — that's a Zustand action.
- **Filtering the player list panel** — UI code; uses `canPlayerFillPosition` but isn't a rule.
- **Magnetic snap detection** — geometry, not a domain rule.
- **Saving to storage** — persistence, not a rule.
- **Bench-to-bench swap on drop** — drop-handler logic in `LineupBuilder`, not a domain rule.

Keeping `rules.js` free of these concerns is what makes the file simple, isolated, and easy to verify.

---

## How Claude Code should use this

1. Implement the four functions in `src/domain/rules.js` exactly as specified.
2. After writing each function, verify it manually by running each row of its test-case table in the browser console (or a small temporary debug page).
3. If a case fails, fix the function — not the table. The table is the spec.
4. If a case seems wrong on reflection, flag it for human review rather than silently changing the expected value.

No automated tests in v1 — manual verification is the testing strategy. If a bug surfaces in one of these functions later, that's the moment to add an automated test for that specific case.
