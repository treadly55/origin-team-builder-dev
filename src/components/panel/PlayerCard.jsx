import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CATEGORY_LABELS } from '../../domain/categories.js'
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

function Chevron({ open }) {
  const classes = [styles.chevron]
  if (open) classes.push(styles.chevronOpen)
  return (
    <svg viewBox="0 0 24 24" className={classes.join(' ')} aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PlayerCard({ player, draggable = false }) {
  const [expanded, setExpanded] = useState(false)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel-${player.id}`,
    data: { playerId: player.id, source: 'panel' },
    disabled: !draggable,
  })

  const classes = [styles.card]
  if (draggable) classes.push(styles.draggable)
  if (isDragging) classes.push(styles.dragging)
  if (expanded) classes.push(styles.expanded)

  const stopDragActivation = (e) => e.stopPropagation()
  const toggle = () => setExpanded((v) => !v)

  const categoryNames =
    player.eligibleCategories.length === 0
      ? '—'
      : player.eligibleCategories.map((c) => CATEGORY_LABELS[c]).join(', ')

  return (
    <div
      ref={setNodeRef}
      className={classes.join(' ')}
      {...listeners}
      {...attributes}
    >
      <div className={styles.row}>
        <Silhouette />
        <div className={styles.body}>
          <p className={styles.name}>{player.name}</p>
          <div className={styles.positions}>
            {player.eligibleCategories.map((category) => (
              <span key={category} className={styles.posBadge}>
                {CATEGORY_LABELS[category][0]}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.rating}>{player.rating}</div>
        <button
          type="button"
          className={styles.chevronBtn}
          onClick={toggle}
          onPointerDown={stopDragActivation}
          onMouseDown={stopDragActivation}
          onTouchStart={stopDragActivation}
          onKeyDown={stopDragActivation}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse player details' : 'Expand player details'}
        >
          <Chevron open={expanded} />
        </button>
      </div>
      {expanded && (
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Club</span>
            <span className={styles.detailValue}>{player.club}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Categories</span>
            <span className={styles.detailValue}>{categoryNames}</span>
          </div>
        </div>
      )}
    </div>
  )
}
