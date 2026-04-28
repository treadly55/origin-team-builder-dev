import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { CATEGORIES, CATEGORY_LABELS } from '../../domain/categories.js'
import PlayerCard from './PlayerCard.jsx'
import styles from './PlayerListPanel.module.css'

export default function PlayerListPanel({ players, title = 'Squad' }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'panel' })
  const [activeCategories, setActiveCategories] = useState(
    () => new Set(CATEGORIES),
  )

  const toggleCategory = (category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  const selectAll = () => setActiveCategories(new Set(CATEGORIES))

  const allActive = activeCategories.size === CATEGORIES.length

  const filteredPlayers =
    activeCategories.size === 0
      ? players
      : players.filter((p) =>
          p.eligibleCategories.some((c) => activeCategories.has(c)),
        )

  const classes = [styles.panel]
  if (isOver) classes.push(styles.panelOver)

  return (
    <aside ref={setNodeRef} className={classes.join(' ')}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>{filteredPlayers.length}</span>
      </header>
      <div className={styles.filters} role="group" aria-label="Filter by category">
        <button
          type="button"
          className={[styles.chip, allActive && styles.chipActive]
            .filter(Boolean)
            .join(' ')}
          aria-pressed={allActive}
          onClick={selectAll}
        >
          All
        </button>
        {CATEGORIES.map((category) => {
          const active = activeCategories.has(category)
          const chipClasses = [styles.chip]
          if (active) chipClasses.push(styles.chipActive)
          return (
            <button
              key={category}
              type="button"
              className={chipClasses.join(' ')}
              aria-pressed={active}
              onClick={() => toggleCategory(category)}
            >
              {CATEGORY_LABELS[category]}
            </button>
          )
        })}
      </div>
      <ul className={styles.list}>
        {filteredPlayers.map((player) => (
          <li key={player.id}>
            <PlayerCard player={player} draggable />
          </li>
        ))}
      </ul>
    </aside>
  )
}
