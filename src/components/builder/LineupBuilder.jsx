import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { storage } from '../../lib/storage/index.js'
import { canPlayerFillPosition } from '../../domain/rules.js'
import { autoFillSlots } from '../../domain/autoFill.js'
import { magneticCollision } from '../../lib/dnd/magneticCollision.js'
import BenchColumn from '../bench/BenchColumn.jsx'
import Modal from '../common/Modal.jsx'
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

export default function LineupBuilder({
  initialLineup,
  onChange,
  onSave,
  saveState = 'idle',
}) {
  const isPreview = initialLineup.id == null

  const [selectedTeam, setSelectedTeam] = useState(initialLineup.team)
  const [slots, setSlots] = useState(initialLineup.slots ?? {})
  const [activePlayerId, setActivePlayerId] = useState(null)
  const [error, setError] = useState(null)
  const [pendingTeamSwitch, setPendingTeamSwitch] = useState(null)
  const [showAutoFillConfirm, setShowAutoFillConfirm] = useState(false)

  const [teamPlayers, setTeamPlayers] = useState([])
  const [playersLoading, setPlayersLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setPlayersLoading(true)
    storage.listPlayers(selectedTeam).then((players) => {
      if (cancelled) return
      setTeamPlayers(players)
      setPlayersLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [selectedTeam])

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

  const runAutoFill = () => {
    const result = autoFillSlots(teamPlayers)
    if (!result.ok) {
      const parts = Object.entries(result.missing)
        .map(([cat, n]) => `${n} ${cat}`)
        .join(', ')
      setError({
        message: `Not enough players rated 75–99 to auto-fill (need ${parts})`,
        id: Date.now(),
      })
      return
    }
    setSlots(result.slots)
    setError(null)
    setActivePlayerId(null)
  }

  const handleAutoFillClick = () => {
    if (Object.keys(slots).length > 0) {
      setShowAutoFillConfirm(true)
    } else {
      runAutoFill()
    }
  }

  const confirmAutoFill = () => {
    setShowAutoFillConfirm(false)
    runAutoFill()
  }

  const cancelAutoFill = () => setShowAutoFillConfirm(false)

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
          <div className={styles.headerLeft}>
            <Link to="/dashboard" className={styles.dashboardLink}>
              ← Dashboard
            </Link>
            <h1 className={styles.pageTitle}>
              {isPreview
                ? 'Origin Team Builder'
                : initialLineup.name || 'Untitled lineup'}
            </h1>
          </div>
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
                onClick={handleAutoFillClick}
                disabled={playersLoading}
              >
                Auto-fill
              </button>
              <button
                type="button"
                onClick={() => setSlots({})}
                disabled={Object.keys(slots).length === 0}
              >
                Clear field
              </button>
              {onSave && (
                <div className={styles.saveWrap}>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={onSave}
                  >
                    Save
                  </button>
                  <span
                    className={styles.saveIndicator}
                    aria-live="polite"
                  >
                    {saveState === 'saving' ? 'Saving…' : ''}
                  </span>
                </div>
              )}
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
      <Modal
        open={showAutoFillConfirm}
        onClose={cancelAutoFill}
        title="Replace current lineup?"
      >
        <p className={styles.dialogBody}>
          Auto-fill will clear all placed players and pick new ones at random
          from the 75–99 rating pool.
        </p>
        <div className={styles.dialogActions}>
          <button
            type="button"
            onClick={cancelAutoFill}
            className={styles.dialogCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmAutoFill}
            className={styles.dialogDiscard}
            autoFocus
          >
            Clear and auto-fill
          </button>
        </div>
      </Modal>
      <Modal
        open={!!pendingTeamSwitch}
        onClose={cancelTeamSwitch}
        title={`Switch to ${pendingTeamLabel}?`}
      >
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
      </Modal>
      <DragOverlay>
        {activePlayer ? <PlayerCard player={activePlayer} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
