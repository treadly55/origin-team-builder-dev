import { useDraggable, useDroppable } from '@dnd-kit/core'
import styles from './FieldView.module.css'

const POSITIONS = [
  { number: 1,  top: 90, left: 50 },
  { number: 2,  top: 78, left: 15 },
  { number: 3,  top: 65, left: 35 },
  { number: 4,  top: 65, left: 65 },
  { number: 5,  top: 78, left: 85 },
  { number: 6,  top: 52, left: 38 },
  { number: 7,  top: 52, left: 62 },
  { number: 8,  top: 12, left: 30 },
  { number: 9,  top: 12, left: 50 },
  { number: 10, top: 12, left: 70 },
  { number: 11, top: 26, left: 38 },
  { number: 12, top: 26, left: 62 },
  { number: 13, top: 38, left: 50 },
]

function lastName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1]
}

function PositionCircle({ position, player, looseMode }) {
  const droppable = useDroppable({
    id: `pos-${position.number}`,
    data: { kind: 'position', position: position.number },
  })
  const draggable = useDraggable({
    id: player ? `field-${player.id}` : `field-empty-${position.number}`,
    data: player
      ? { playerId: player.id, source: 'field', position: position.number }
      : undefined,
    disabled: !player,
  })

  const setRef = (node) => {
    droppable.setNodeRef(node)
    draggable.setNodeRef(node)
  }

  const classes = [styles.position]
  if (player) classes.push(styles.filled)
  if (looseMode) classes.push(styles.loose)
  if (droppable.isOver) classes.push(styles.over)
  if (draggable.isDragging) classes.push(styles.dragging)

  const dragProps = player
    ? { ...draggable.listeners, ...draggable.attributes }
    : {}

  return (
    <div
      ref={setRef}
      className={classes.join(' ')}
      style={{ top: `${position.top}%`, left: `${position.left}%` }}
      {...dragProps}
    >
      {player ? (
        <span className={styles.playerName}>{lastName(player.name)}</span>
      ) : (
        position.number
      )}
    </div>
  )
}

export default function FieldView({
  slots = {},
  playersById = {},
  looseMode = false,
}) {
  return (
    <div className={styles.field}>
      <div className={styles.halfwayLine} />
      {POSITIONS.map((p) => (
        <PositionCircle
          key={p.number}
          position={p}
          player={slots[p.number] ? playersById[slots[p.number]] : null}
          looseMode={looseMode}
        />
      ))}
    </div>
  )
}
