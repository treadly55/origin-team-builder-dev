import { useMemo, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { seedPlayers } from '../../domain/seedPlayers.js'
import FieldView from '../field/FieldView.jsx'
import PlayerCard from '../panel/PlayerCard.jsx'
import PlayerListPanel from '../panel/PlayerListPanel.jsx'
import styles from './LineupBuilder.module.css'

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
  const [activeId, setActiveId] = useState(null)

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const position = over.data?.current?.position
    if (!position) return
    setSlots((prev) => ({ ...prev, [position]: active.id }))
  }

  const handleDragCancel = () => setActiveId(null)

  const activePlayer = activeId ? playersById[activeId] : null

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.builder}>
        <PlayerListPanel players={nswPlayers} title="NSW Blues" />
        <div className={styles.fieldArea}>
          <FieldView slots={slots} playersById={playersById} />
        </div>
      </div>
      <DragOverlay>
        {activePlayer ? <PlayerCard player={activePlayer} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
