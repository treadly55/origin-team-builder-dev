import { useMemo, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { CATEGORIES, CATEGORY_LABELS } from '../../domain/categories.js'
import PlayerCard from './PlayerCard.jsx'
import styles from './PlayerListPanel.module.css'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
]

export default function PlayerListPanel({ players, title = 'Squad' }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'panel' })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return players
      .filter((p) => {
        if (query && !p.name.toLowerCase().includes(query)) return false
        if (
          selectedCategory !== 'all' &&
          !p.eligibleCategories.includes(selectedCategory)
        ) {
          return false
        }
        return true
      })
      .sort((a, b) => b.rating - a.rating)
  }, [players, selectedCategory, searchQuery])

  const classes = [styles.panel]
  if (isOver) classes.push(styles.panelOver)

  return (
    <aside ref={setNodeRef} className={classes.join(' ')}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>{filteredPlayers.length}</span>
      </header>
      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players…"
          aria-label="Search players by name"
        />
      </div>
      <div
        className={styles.categorySwitch}
        role="radiogroup"
        aria-label="Filter by category"
      >
        {CATEGORY_OPTIONS.map(({ value, label }) => {
          const active = selectedCategory === value
          const btnClasses = [styles.categoryButton]
          if (active) btnClasses.push(styles.categoryButtonActive)
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              className={btnClasses.join(' ')}
              onClick={() => setSelectedCategory(value)}
            >
              {label}
            </button>
          )
        })}
      </div>
      {filteredPlayers.length === 0 ? (
        <p className={styles.empty}>No players match your filters.</p>
      ) : (
        <ul className={styles.list}>
          {filteredPlayers.map((player) => (
            <li key={player.id}>
              <PlayerCard player={player} draggable />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
