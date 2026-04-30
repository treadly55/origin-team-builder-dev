import { useEffect, useMemo, useRef, useState } from 'react'
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

export default function LineupBuilder({ initialLineup, onChange }) {
  const isPreview = initialLineup.id == null

  const [selectedTeam, setSelectedTeam] = useState(initialLineup.team)
  const [slots, setSlots] = useState(initialLineup.slots ?? {})
  const [activePlayerId, setActivePlayerId] = useState(null)
  const [error, setError] = useState(null)
  const [pendingTeamSwitch, setPendingTeamSwitch] = useState(null)

  const teamPlayers = useMemo(
    () => seedPlayers.filter((p) => p.team === selectedTeam),
    [selectedTeam],
  )
  const playersById = useMemo(
    () => Object.fromEntries(teamPlayers.map((p) => [p.id, p])),
    [teamPlayers],
  )

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 2500)
    return () => clearTimeout(timer)
  }, [error])

  const isFirstRenderRef = useRef(true)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    if (!onChange) return
    onChange({ ...initialLineup, team: selectedTeam, slots })
  }, [slots, selectedTeam])

  const handleTeamClick = (teamId) => {
    if (teamId === selectedTeam) return
    if (Object.keys(slots).length > 0) {
      setPendingTeamSwitch(teamId)
    } else {
      setSelectedTeam(teamId)
    }
  }

  const confirmTeamSwitch = () => {
    if (!pendingTeamSwitch) return
    setSlots({})
    setSelectedTeam(pendingTeamSwitch)
    setError(null)
    setActivePlayerId(null)
    setPendingTeamSwitch(null)
  }

  const cancelTeamSwitch = () => setPendingTeamSwitch(null)

  useEffect(() => {
    if (!pendingTeamSwitch) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') cancelTeamSwitch()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pendingTeamSwitch])

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
        if (!canPlayerFillPosition(player, position)) {
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
  const pendingTeamLabel =
    TEAMS.find((t) => t.id === pendingTeamSwitch)?.label ?? ''

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
          {isPreview ? (
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
                    onClick={() => handleTeamClick(team.id)}
                  >
                    {team.label}
                  </button>
                )
              })}
            </div>
          ) : (
            <span
              className={[
                styles.teamLabel,
                styles[`teamLabel_${selectedTeam}`],
              ].join(' ')}
            >
              {teamLabel}
            </span>
          )}
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
            </header>
            <FieldView slots={slots} playersById={playersById} />
          </div>
        </div>
      </div>
      {error && (
        <div className={styles.toast} role="status">
          {error.message}
        </div>
      )}
      {pendingTeamSwitch && (
        <div
          className={styles.dialogOverlay}
          onClick={cancelTeamSwitch}
          role="presentation"
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-switch-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="team-switch-title" className={styles.dialogTitle}>
              Switch to {pendingTeamLabel}?
            </h2>
            <p className={styles.dialogBody}>
              The players you've placed will be cleared. This can't be undone.
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                onClick={cancelTeamSwitch}
                className={styles.dialogCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTeamSwitch}
                className={styles.dialogDiscard}
                autoFocus
              >
                Discard and switch
              </button>
            </div>
          </div>
        </div>
      )}
      <DragOverlay>
        {activePlayer ? <PlayerCard player={activePlayer} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
