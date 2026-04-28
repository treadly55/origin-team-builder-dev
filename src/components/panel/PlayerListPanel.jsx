import { useDroppable } from '@dnd-kit/core'
import PlayerCard from './PlayerCard.jsx'
import styles from './PlayerListPanel.module.css'

export default function PlayerListPanel({ players, title = 'Squad' }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'panel' })

  const classes = [styles.panel]
  if (isOver) classes.push(styles.panelOver)

  return (
    <aside ref={setNodeRef} className={classes.join(' ')}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>{players.length}</span>
      </header>
      <ul className={styles.list}>
        {players.map((player) => (
          <li key={player.id}>
            <PlayerCard player={player} draggable />
          </li>
        ))}
      </ul>
    </aside>
  )
}
