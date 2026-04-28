import PlayerCard from './PlayerCard.jsx'
import styles from './PlayerListPanel.module.css'

export default function PlayerListPanel({ players, title = 'Squad' }) {
  return (
    <aside className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>{players.length}</span>
      </header>
      <ul className={styles.list}>
        {players.map((player, index) => (
          <li key={player.id}>
            <PlayerCard player={player} draggable={index === 0} />
          </li>
        ))}
      </ul>
    </aside>
  )
}
