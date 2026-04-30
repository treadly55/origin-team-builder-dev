import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Modal from '../components/common/Modal.jsx'
import { storage } from '../lib/storage/index.js'
import { formatRelativeOrAbsolute } from '../lib/formatDate.js'
import styles from './DashboardPage.module.css'

const TEAMS = [
  { id: 'NSW', label: 'NSW Blues' },
  { id: 'QLD', label: 'QLD Maroons' },
]

function teamLabelFor(id) {
  return TEAMS.find((t) => t.id === id)?.label ?? id
}

function NewLineupForm({ onSubmit, onCancel }) {
  const [team, setTeam] = useState('NSW')
  const [name, setName] = useState('')
  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ team, name: trimmed })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className={styles.fieldLabel} htmlFor="lineup-name">
        Name
      </label>
      <input
        id="lineup-name"
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Origin I 2026"
        autoFocus
        maxLength={80}
      />
      <span className={styles.fieldLabel}>Team</span>
      <div
        className={styles.teamSwitch}
        role="radiogroup"
        aria-label="Select team"
      >
        {TEAMS.map((t) => {
          const active = t.id === team
          const classes = [styles.teamButton]
          if (active) classes.push(styles.teamButtonActive)
          if (active) classes.push(styles[`teamButton_${t.id}`])
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={classes.filter(Boolean).join(' ')}
              onClick={() => setTeam(t.id)}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div className={styles.dialogActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.dialogCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={styles.dialogPrimary}
        >
          Create
        </button>
      </div>
    </form>
  )
}

export default function DashboardPage() {
  const [lineups, setLineups] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    storage.listLineups().then((list) => {
      if (cancelled) return
      const sorted = [...list].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      )
      setLineups(sorted)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleCreate = async ({ team, name }) => {
    const lineup = await storage.createLineup({ team, name })
    setShowModal(false)
    navigate(`/lineup/${lineup.id}`)
  }

  if (lineups == null) return null

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Your lineups</h1>
        <button
          type="button"
          className={styles.newButton}
          onClick={() => setShowModal(true)}
        >
          + New lineup
        </button>
      </header>
      {lineups.length > 0 && (
        <ul className={styles.list}>
          {lineups.map((l) => (
            <li key={l.id} className={styles.row}>
              <Link to={`/lineup/${l.id}`} className={styles.rowLink}>
                <span className={styles.rowName}>{l.name}</span>
                <span
                  className={[
                    styles.teamPill,
                    styles[`teamPill_${l.team}`],
                  ].join(' ')}
                >
                  {teamLabelFor(l.team)}
                </span>
                <span className={styles.rowDate}>
                  {formatRelativeOrAbsolute(l.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New lineup"
      >
        <NewLineupForm
          onSubmit={handleCreate}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  )
}
