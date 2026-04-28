# Rule Functions Spec (v1.0, plain JS)

> Pure JavaScript functions that encode the logic rules of Origin Builder. Five functions, one file (`src/domain/rules.js`), no React, no storage, no DOM.
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
  eligiblePositions: [1, 2, 5],       // array of integers in 1..13. Empty array is legal.
  rating: 92,
  // ...other fields not used by rules
}

// Lineup
{
  id: "l_abc123",
  team: "NSW",                        // "NSW" or "QLD"
  looseMode: false,                   // boolean
  slots: [                            // length 17, one per position
    { position: 1,  playerId: "p_001" },
    { position: 2,  playerId: null },
    // ...
  ],
  bench: [                            // length 6
    { index: 0, playerId: "p_023" },
    // ...
  ],
  emergency: { playerId: null },
}

// Position numbers:
//   1..13 = starting positions
//   14..17 = interchange (always accepts anyone, exempt from eligibility checks)
```

---

## Function 1 — `canPlayerFillPosition`

```js
export function canPlayerFillPosition(player, position, looseMode) { ... }
```

**What it decides:** whether a given player is allowed to be placed at a given field position.

**Rules:**
1. If `looseMode` is `true` → return `true`.
2. If `position` is 14, 15, 16, or 17 → return `true`.
3. Otherwise → return `true` if `player.eligiblePositions` includes `position`, else `false`.

**Test cases:**

| # | `eligiblePositions` | `position` | `looseMode` | Expected |
|---|---|---|---|---|
| 1 | `[1, 2, 5]` | 1 | `false` | `true` |
| 2 | `[1, 2, 5]` | 2 | `false` | `true` |
| 3 | `[1, 2, 5]` | 5 | `false` | `true` |
| 4 | `[1, 2, 5]` | 3 | `false` | `false` |
| 5 | `[1, 2, 5]` | 13 | `false` | `false` |
| 6 | `[1, 2, 5]` | 3 | `true` | `true` (loose) |
| 7 | `[6]` | 6 | `false` | `true` |
| 8 | `[6]` | 7 | `false` | `false` |
| 9 | `[6]` | 14 | `false` | `true` (interchange) |
| 10 | `[6]` | 17 | `false` | `true` (interchange) |
| 11 | `[]` | 1 | `false` | `false` |
| 12 | `[]` | 1 | `true` | `true` |
| 13 | `[]` | 15 | `false` | `true` |
| 14 | `[11, 12, 13]` | 11 | `false` | `true` |
| 15 | `[11, 12, 13]` | 12 | `false` | `true` |
| 16 | `[11, 12, 13]` | 13 | `false` | `true` |
| 17 | `[11, 12, 13]` | 8 | `false` | `false` |

**Manual verification:** open the browser console and run each row, e.g.:
```js
canPlayerFillPosition({ eligiblePositions: [6] }, 6, false)  // expect true
canPlayerFillPosition({ eligiblePositions: [6] }, 7, false)  // expect false
```

---

## Function 2 — `canPlayerFillBenchOrEmergency`

```js
export function canPlayerFillBenchOrEmergency(player, lineupTeam) { ... }
```

**What it decides:** whether a given player can be placed on the bench or in the emergency slot.

**Rules:**
1. Return `true` if `player.team === lineupTeam`.
2. Otherwise return `false`.

**Test cases:**

| # | `player.team` | `lineupTeam` | Expected |
|---|---|---|---|
| 1 | `"NSW"` | `"NSW"` | `true` |
| 2 | `"QLD"` | `"QLD"` | `true` |
| 3 | `"NSW"` | `"QLD"` | `false` |
| 4 | `"QLD"` | `"NSW"` | `false` |

---

## Function 3 — `findPlayerPlacement`

```js
export function findPlayerPlacement(lineup, playerId) { ... }
// Returns one of:
//   { kind: "slot", position: <1..17> }
//   { kind: "bench", index: <0..5> }
//   { kind: "emergency" }
//   null
```

**What it decides:** where a given player currently sits in the lineup, if anywhere.

**Rules:**
1. If the player appears in `lineup.slots`, return `{ kind: "slot", position }` for the first match.
2. Else if the player appears in `lineup.bench`, return `{ kind: "bench", index }` for the first match.
3. Else if `lineup.emergency.playerId === playerId`, return `{ kind: "emergency" }`.
4. Otherwise return `null`.

**Test cases:**

| # | Where `"p1"` appears | Query | Expected |
|---|---|---|---|
| 1 | slot at position 1 | `"p1"` | `{ kind: "slot", position: 1 }` |
| 2 | bench at index 3 | `"p1"` | `{ kind: "bench", index: 3 }` |
| 3 | emergency | `"p1"` | `{ kind: "emergency" }` |
| 4 | nowhere | `"p1"` | `null` |
| 5 | both slot 7 AND bench index 2 | `"p1"` | `{ kind: "slot", position: 7 }` (slots first) |
| 6 | not in lineup | `"p99"` | `null` (unknown id) |

---

## Function 4 — `isLineupComplete`

```js
export function isLineupComplete(lineup) { ... }
```

**What it decides:** whether all 17 field positions are filled. Bench and emergency are not required.

**Rules:**
1. Return `true` if every entry in `lineup.slots` has a non-null `playerId`.
2. Otherwise return `false`.

**Test cases:**

| # | Slots 1–17 filled? | Bench filled? | Emergency? | Expected |
|---|---|---|---|---|
| 1 | all 17 | all 6 | yes | `true` |
| 2 | all 17 | 0 | no | `true` (bench/emergency don't matter) |
| 3 | 16 filled (pos 13 empty) | — | — | `false` |
| 4 | 0 filled | all 6 | yes | `false` |
| 5 | 1–13 filled, 14–17 empty | — | — | `false` (interchange counts) |

---

## Function 5 — `isLineupValid`

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
1. A player at a field position 1–13 fails if `canPlayerFillPosition(player, position, lineup.looseMode)` is `false` → `ineligible_player` error.
2. Positions 14–17 never produce `ineligible_player` errors.
3. Any player appearing more than once across slots/bench/emergency → one `duplicate_player` error listing all locations.
4. Any player whose `team` doesn't match `lineup.team` → `wrong_team_player` error.
5. Missing player references (playerId not in `playersById`) → treated as "no player placed", not an error.
6. Empty slots are not errors.
7. `valid` is `true` iff `errors` is empty.

**Test cases:**

| # | Setup | Expected |
|---|---|---|
| 1 | Empty lineup (all null) | `{ valid: true, errors: [] }` |
| 2 | All 17 filled with eligible same-team players | `{ valid: true, errors: [] }` |
| 3 | Player `[6]`-only at position 3, strict | `valid: false`, one `ineligible_player` for pos 3 |
| 4 | Same as #3 but `looseMode: true` | `{ valid: true, errors: [] }` |
| 5 | Player `[6]`-only at position 14, strict | `{ valid: true, errors: [] }` (interchange exempt) |
| 6 | Same `"p1"` at position 1 AND position 2 | one `duplicate_player`, both slots listed |
| 7 | Same `"p1"` at position 1 AND on bench | one `duplicate_player`, both locations |
| 8 | Same `"p1"` in emergency AND on bench | one `duplicate_player` |
| 9 | QLD player in NSW lineup at position 3 | one `wrong_team_player` |
| 10 | QLD player on NSW lineup's bench | one `wrong_team_player` |
| 11 | One ineligible AND one duplicate | two errors |
| 12 | playerId in slot but missing from `playersById` | `{ valid: true, errors: [] }` (treated as empty) |

---

## What's deliberately NOT a rule function

These are not in `rules.js` because they're either UI concerns or state-mutation concerns:

- **Placing or removing a player from a slot** — that's a Zustand action.
- **Filtering the player list panel** — UI code; uses `canPlayerFillPosition` but isn't a rule.
- **Magnetic snap detection** — geometry, not a domain rule.
- **Saving to storage** — persistence, not a rule.

Keeping `rules.js` free of these concerns is what makes the file simple, isolated, and easy to verify.

---

## How Claude Code should use this

1. Implement the five functions in `src/domain/rules.js` exactly as specified.
2. After writing each function, verify it manually by running each row of its test-case table in the browser console (or a small temporary debug page).
3. If a case fails, fix the function — not the table. The table is the spec.
4. If a case seems wrong on reflection, flag it for human review rather than silently changing the expected value.

No automated tests in v1 — manual verification is the testing strategy. If a bug surfaces in one of these functions later, that's the moment to add an automated test for that specific case.
