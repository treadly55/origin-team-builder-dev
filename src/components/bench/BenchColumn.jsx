import { useDraggable, useDroppable } from '@dnd-kit/core'
import styles from './BenchColumn.module.css'

const BENCH_POSITIONS = [14, 15, 16, 17, 18, 19]

function lastName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1]
}

function BenchSlot({ position, player }) {
  const droppable = useDroppable({
    id: `pos-${position}`,
    data: { kind: 'position', position },
  })
  const draggable = useDraggable({
    id: player ? `field-${player.id}` : `bench-empty-${position}`,
    data: player
      ? { playerId: player.id, source: 'bench', position }
      : undefined,
    disabled: !player,
  })

  const setRef = (node) => {
    droppable.setNodeRef(node)
    draggable.setNodeRef(node)
  }

  const classes = [styles.slot]
  if (player) classes.push(styles.filled)
  if (droppable.isOver) classes.push(styles.over)
  if (draggable.isDragging) classes.push(styles.dragging)

  const dragProps = player
    ? { ...draggable.listeners, ...draggable.attributes }
    : {}

  return (
    <div ref={setRef} className={classes.join(' ')} {...dragProps}>
      {player ? (
        <span className={styles.playerName}>{lastName(player.name)}</span>
      ) : (
        position
      )}
    </div>
  )
}

export default function BenchColumn({ slots = {}, playersById = {} }) {
  return (
    <div className={styles.bench}>
      {BENCH_POSITIONS.map((position) => (
        <BenchSlot
          key={position}
          position={position}
          player={slots[position] ? playersById[slots[position]] : null}
        />
      ))}
    </div>
  )
}
