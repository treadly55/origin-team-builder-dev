import { useDraggable } from '@dnd-kit/core'
import styles from './PlayerCard.module.css'

function Silhouette() {
  return (
    <div className={styles.silhouetteWrap} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={styles.silhouette}>
        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.667-10 5v3h20v-3c0-3.333-6.686-5-10-5z" />
      </svg>
    </div>
  )
}

export default function PlayerCard({ player, draggable = false }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel-${player.id}`,
    data: { playerId: player.id, source: 'panel' },
    disabled: !draggable,
  })

  const classes = [styles.card]
  if (draggable) classes.push(styles.draggable)
  if (isDragging) classes.push(styles.dragging)

  return (
    <div
      ref={setNodeRef}
      className={classes.join(' ')}
      {...listeners}
      {...attributes}
    >
      <Silhouette />
      <div className={styles.body}>
        <p className={styles.name}>{player.name}</p>
        <div className={styles.positions}>
          {player.eligiblePositions.map((pos) => (
            <span key={pos} className={styles.posBadge}>
              {pos}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.rating}>{player.rating}</div>
    </div>
  )
}
