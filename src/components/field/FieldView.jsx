import { useDroppable } from '@dnd-kit/core'
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

const DROPPABLE_POSITIONS = new Set([1])

function lastName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1]
}

function PositionCircle({ position, player }) {
  const isDroppable = DROPPABLE_POSITIONS.has(position.number)
  const { setNodeRef, isOver } = useDroppable({
    id: `pos-${position.number}`,
    data: { position: position.number },
    disabled: !isDroppable,
  })

  const classes = [styles.position]
  if (player) classes.push(styles.filled)
  if (isOver) classes.push(styles.over)

  return (
    <div
      ref={isDroppable ? setNodeRef : undefined}
      className={classes.join(' ')}
      style={{ top: `${position.top}%`, left: `${position.left}%` }}
    >
      {player ? (
        <span className={styles.playerName}>{lastName(player.name)}</span>
      ) : (
        position.number
      )}
    </div>
  )
}

export default function FieldView({ slots = {}, playersById = {} }) {
  return (
    <div className={styles.field}>
      <div className={styles.halfwayLine} />
      {POSITIONS.map((p) => (
        <PositionCircle
          key={p.number}
          position={p}
          player={slots[p.number] ? playersById[slots[p.number]] : null}
        />
      ))}
    </div>
  )
}
