/**
 * Pure rule functions. No React, no DOM, no storage.
 * See docs/rule-functions-spec.md for the full spec and test-case tables.
 */

/**
 * @param {{ eligiblePositions: number[] }} player
 * @param {number} position  1..17
 * @param {boolean} looseMode
 * @returns {boolean}
 */
export function canPlayerFillPosition(player, position, looseMode) {
  if (looseMode) return true
  if (position >= 14 && position <= 17) return true
  return player.eligiblePositions.includes(position)
}

/**
 * @param {{ team: "NSW"|"QLD" }} player
 * @param {"NSW"|"QLD"} lineupTeam
 * @returns {boolean}
 */
export function canPlayerFillBenchOrEmergency(player, lineupTeam) {
  return player.team === lineupTeam
}

/**
 * @returns {{kind:"slot",position:number}|{kind:"bench",index:number}|{kind:"emergency"}|null}
 */
export function findPlayerPlacement(lineup, playerId) {
  for (const slot of lineup.slots) {
    if (slot.playerId === playerId) {
      return { kind: 'slot', position: slot.position }
    }
  }
  for (const benchSlot of lineup.bench) {
    if (benchSlot.playerId === playerId) {
      return { kind: 'bench', index: benchSlot.index }
    }
  }
  if (lineup.emergency.playerId === playerId) {
    return { kind: 'emergency' }
  }
  return null
}

export function isLineupComplete(lineup) {
  return lineup.slots.every((slot) => slot.playerId !== null)
}

/**
 * @returns {{ valid: boolean, errors: Array<object> }}
 */
export function isLineupValid(lineup, playersById) {
  const errors = []
  const placementsByPlayer = new Map()

  const recordPlacement = (playerId, placement) => {
    if (!placementsByPlayer.has(playerId)) {
      placementsByPlayer.set(playerId, [])
    }
    placementsByPlayer.get(playerId).push(placement)
  }

  for (const slot of lineup.slots) {
    if (slot.playerId === null) continue
    const player = playersById[slot.playerId]
    if (!player) continue

    const location = { kind: 'slot', position: slot.position }
    recordPlacement(slot.playerId, location)

    if (player.team !== lineup.team) {
      errors.push({ kind: 'wrong_team_player', playerId: slot.playerId, location })
    }

    if (slot.position >= 1 && slot.position <= 13) {
      if (!canPlayerFillPosition(player, slot.position, lineup.looseMode)) {
        errors.push({
          kind: 'ineligible_player',
          position: slot.position,
          playerId: slot.playerId,
        })
      }
    }
  }

  for (const benchSlot of lineup.bench) {
    if (benchSlot.playerId === null) continue
    const player = playersById[benchSlot.playerId]
    if (!player) continue

    const location = { kind: 'bench', index: benchSlot.index }
    recordPlacement(benchSlot.playerId, location)

    if (player.team !== lineup.team) {
      errors.push({ kind: 'wrong_team_player', playerId: benchSlot.playerId, location })
    }
  }

  if (lineup.emergency.playerId !== null) {
    const player = playersById[lineup.emergency.playerId]
    if (player) {
      const location = { kind: 'emergency' }
      recordPlacement(lineup.emergency.playerId, location)

      if (player.team !== lineup.team) {
        errors.push({ kind: 'wrong_team_player', playerId: lineup.emergency.playerId, location })
      }
    }
  }

  for (const [playerId, placements] of placementsByPlayer) {
    if (placements.length > 1) {
      errors.push({ kind: 'duplicate_player', playerId, locations: placements })
    }
  }

  return { valid: errors.length === 0, errors }
}
