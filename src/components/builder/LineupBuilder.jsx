import { useEffect, useMemo, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { seedPlayers } from '../../domain/seedPlayers.js'
import { canPlayerFillPosition } from '../../domain/rules.js'
import { magneticCollision } from '../../lib/dnd/magneticCollision.js'
import BenchColumn from '../bench/BenchColumn.jsx'
import FieldView from '../field/FieldView.jsx'
import PlayerCard from '../panel/PlayerCard.jsx'
import PlayerListPanel from '../panel/PlayerListPanel.jsx'
import styles from './LineupBuilder.module.css'

const TEAMS = [
  { id: 'NSW', label: 'NSW Blues' },
  { id: 'QLD', label: 'QLD Maroons' },
]

function placePlayerAt(slots, playerId, position) {
  const next = {}
  for (const [pos, pid] of Object.entries(slots)) {
    if (pid !== playerId) next[pos] = pid
  }
  next[position] = playerId
  return next
}

function unplacePlayer(slots, playerId) {
  const next = {}
  for (const [pos, pid] of Object.entries(slots)) {
    if (pid !== playerId) next[pos] = pid
  }
  return next
}

function swapAt(slots, playerId, fromPosition, toPosition) {
  if (fromPosition === toPosition) return slots
  const next = { ...slots }
  const displaced = next[toPosition]
  next[toPosition] = playerId
  if (displaced != null) {
    next[fromPosition] = displaced
  } else {
    delete next[fromPosition]
  }
  return next
}

export default function LineupBuilder() {
  const [selectedTeam, setSelectedTeam] = useState('NSW')

  const teamPlayers = useMemo(
    () => seedPlayers.filter((p) => p.team === selectedTeam),
    [selectedTeam],
  )
  const playersById = useMemo(
    () => Object.fromEntries(teamPlayers.map((p) => [p.id, p])),
    [teamPlayers],
  )

  const [slots, setSlots] = useState({})
  const [activePlayerId, setActivePlayerId] = useState(null)
  const [error, setError] = useState(null)
  const [looseMode, setLooseMode] = useState(false)

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 2500)
    return () => clearTimeout(timer)
  }, [error])

  const handleTeamChange = (teamId) => {
    if (teamId === selectedTeam) return
    setSelectedTeam(teamId)
    setSlots({})
    setError(null)
    setActivePlayerId(null)
  }

  const handleDragStart = (event) => {
    setActivePlayerId(event.active.data?.current?.playerId ?? null)
  }

  const handleDragEnd = (event) => {
    setActivePlayerId(null)
    const { active, over } = event
    if (!over) return
    const playerId = active.data?.current?.playerId
    if (!playerId) return
    const player = playersById[playerId]
    if (!player) return

    if (typeof over.id === 'string' && over.id.startsWith('pos-')) {
      const position = Number(over.id.slice(4))
      const isBench = position >= 14 && position <= 19

      if (!isBench) {
        if (!canPlayerFillPosition(player, position, looseMode)) {
          setError({
            message: `${player.name} isn't eligible for position ${position}`,
            id: Date.now(),
          })
          return
        }
      }

      const sourceData = active.data?.current
      const isBenchToBench =
        isBench &&
        sourceData?.source === 'bench' &&
        typeof sourceData?.position === 'number' &&
        sourceData.position !== position

      if (isBenchToBench) {
        setSlots((prev) =>
          swapAt(prev, playerId, sourceData.position, position),
        )
      } else {
        setSlots((prev) => placePlayerAt(prev, playerId, position))
      }
    } else if (over.id === 'panel') {
      setSlots((prev) => unplacePlayer(prev, playerId))
    }
  }

  const handleDragCancel = () => setActivePlayerId(null)

  const activePlayer = activePlayerId ? playersById[activePlayerId] : null

  const placedPlayerIds = new Set(Object.values(slots))
  const availablePlayers = teamPlayers.filter(
    (p) => !placedPlayerIds.has(p.id),
  )

  const teamLabel = TEAMS.find((t) => t.id === selectedTeam)?.label ?? ''

  return (
    <DndContext
      collisionDetection={magneticCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Origin Team Builder</h1>
          <div
            className={styles.teamSwitch}
            role="radiogroup"
            aria-label="Select team"
          >
            {TEAMS.map((team) => {
              const active = team.id === selectedTeam
              const classes = [styles.teamButton]
              if (active) classes.push(styles.teamButtonActive)
              if (active) classes.push(styles[`teamButton_${team.id}`])
              return (
                <button
                  key={team.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={classes.filter(Boolean).join(' ')}
                  onClick={() => handleTeamChange(team.id)}
                >
                  {team.label}
                </button>
              )
            })}
          </div>
        </header>
        <div className={styles.builder}>
          <PlayerListPanel
            key={selectedTeam}
            players={availablePlayers}
            title={teamLabel}
          />
          <BenchColumn slots={slots} playersById={playersById} />
          <div className={styles.fieldArea}>
            <header className={styles.fieldHeader}>
              <button
                type="button"
                onClick={() => setSlots({})}
                disabled={Object.keys(slots).length === 0}
              >
                Clear field
              </button>
              <button
                type="button"
                className={[
                  styles.looseToggle,
                  looseMode && styles.looseToggleOn,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={looseMode}
                onClick={() => setLooseMode((v) => !v)}
                title={
                  looseMode
                    ? 'Loose mode is on — any player can fill any field position. Click to enforce category rules.'
                    : 'Category rules are on — players must match the position category. Click to allow any player anywhere.'
                }
              >
                <span className={styles.looseDot} aria-hidden="true" />
                Category rules: {looseMode ? 'off' : 'on'}
              </button>
            </header>
            <FieldView
              slots={slots}
              playersById={playersById}
              looseMode={looseMode}
            />
          </div>
        </div>
      </div>
      {error && (
        <div className={styles.toast} role="status">
          {error.message}
        </div>
      )}
      <DragOverlay>
        {activePlayer ? <PlayerCard player={activePlayer} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
