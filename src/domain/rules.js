import { categoryOf } from './categories.js'

/**
 * Pure rule functions. No React, no DOM, no storage.
 * See docs/rule-functions-spec.md for the full spec and test-case tables.
 *
 * Position model: 1–13 are field positions (eligibility-checked by category).
 *                 14–19 are bench (unrestricted).
 */

/**
 * @param {{ eligibleCategories: string[] }} player
 * @param {number} position  1..13 — bench drops do not use this function.
 * @param {boolean} looseMode
 * @returns {boolean}
 */
export function canPlayerFillPosition(player, position, looseMode) {
  if (looseMode) return true
  const category = categoryOf(position)
  if (!category) return false
  return player.eligibleCategories.includes(category)
}

/**
 * @returns {{ kind: 'slot', position: number } | null}
 */
export function findPlayerPlacement(lineup, playerId) {
  for (const slot of lineup.slots) {
    if (slot.playerId === playerId) {
      return { kind: 'slot', position: slot.position }
    }
  }
  return null
}

/**
 * Field positions 1–13 must all be filled. Bench (14–19) is optional.
 */
export function isLineupComplete(lineup) {
  return lineup.slots
    .filter((slot) => slot.position >= 1 && slot.position <= 13)
    .every((slot) => slot.playerId !== null)
}

/**
 * Field 1–13: enforces team match + position eligibility.
 * Bench 14–19: no restrictions.
 * Duplicates: a single player at multiple positions is always invalid.
 *
 * @returns {{ valid: boolean, errors: Array<object> }}
 */
export function isLineupValid(lineup, playersById) {
  const errors = []
  const placementsByPlayer = new Map()

  for (const slot of lineup.slots) {
    if (slot.playerId === null) continue
    const player = playersById[slot.playerId]
    if (!player) continue

    const location = { kind: 'slot', position: slot.position }
    if (!placementsByPlayer.has(slot.playerId)) {
      placementsByPlayer.set(slot.playerId, [])
    }
    placementsByPlayer.get(slot.playerId).push(location)

    if (slot.position >= 14 && slot.position <= 19) continue

    if (player.team !== lineup.team) {
      errors.push({ kind: 'wrong_team_player', playerId: slot.playerId, location })
    }
    if (!canPlayerFillPosition(player, slot.position, lineup.looseMode)) {
      errors.push({
        kind: 'ineligible_player',
        position: slot.position,
        playerId: slot.playerId,
      })
    }
  }

  for (const [playerId, placements] of placementsByPlayer) {
    if (placements.length > 1) {
      errors.push({ kind: 'duplicate_player', playerId, locations: placements })
    }
  }

  return { valid: errors.length === 0, errors }
}
