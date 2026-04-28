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
  const nswPlayers = useMemo(
    () => seedPlayers.filter((p) => p.team === 'NSW'),
    [],
  )
  const playersById = useMemo(
    () => Object.fromEntries(nswPlayers.map((p) => [p.id, p])),
    [nswPlayers],
  )

  const [slots, setSlots] = useState({})
  const [activePlayerId, setActivePlayerId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 2500)
    return () => clearTimeout(timer)
  }, [error])

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
        if (!canPlayerFillPosition(player, position, false)) {
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
  const availablePlayers = nswPlayers.filter(
    (p) => !placedPlayerIds.has(p.id),
  )

  return (
    <DndContext
      collisionDetection={magneticCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.builder}>
        <PlayerListPanel players={availablePlayers} title="NSW Blues" />
        <BenchColumn slots={slots} playersById={playersById} />
        <div className={styles.fieldArea}>
          <FieldView slots={slots} playersById={playersById} />
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
