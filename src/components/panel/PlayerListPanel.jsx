import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { CATEGORIES, CATEGORY_LABELS } from '../../domain/categories.js'
import PlayerCard from './PlayerCard.jsx'
import styles from './PlayerListPanel.module.css'

export default function PlayerListPanel({ players, title = 'Squad' }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'panel' })
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredPlayers =
    selectedCategory === 'all'
      ? players
      : players.filter((p) =>
          p.eligibleCategories.includes(selectedCategory),
        )

  const classes = [styles.panel]
  if (isOver) classes.push(styles.panelOver)

  const renderChip = (value, label) => {
    const active = selectedCategory === value
    const chipClasses = [styles.chip]
    if (active) chipClasses.push(styles.chipActive)
    return (
      <button
        key={value}
        type="button"
        className={chipClasses.join(' ')}
        aria-pressed={active}
        onClick={() => setSelectedCategory(value)}
      >
        {label}
      </button>
    )
  }

  return (
    <aside ref={setNodeRef} className={classes.join(' ')}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>{filteredPlayers.length}</span>
      </header>
      <div className={styles.filters} role="radiogroup" aria-label="Filter by category">
        {renderChip('all', 'All')}
        {CATEGORIES.map((category) =>
          renderChip(category, CATEGORY_LABELS[category]),
        )}
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
