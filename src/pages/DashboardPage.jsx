import { useCallback, useEffect, useRef, useState } from 'react'
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

function RenameForm({ lineup, onSubmit, onCancel }) {
  const [name, setName] = useState(lineup.name)
  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0 && trimmed !== lineup.name

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className={styles.fieldLabel} htmlFor="rename-input">
        Name
      </label>
      <input
        id="rename-input"
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        maxLength={80}
      />
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
          Save
        </button>
      </div>
    </form>
  )
}

export default function DashboardPage() {
  const [lineups, setLineups] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [renaming, setRenaming] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    const list = await storage.listLineups()
    const sorted = [...list].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    )
    setLineups(sorted)
  }, [])

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

  useEffect(() => {
    if (openMenuId == null) return
    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenuId])

  const handleCreate = async ({ team, name }) => {
    const lineup = await storage.createLineup({ team, name })
    setShowNewModal(false)
    navigate(`/lineup/${lineup.id}`)
  }

  const handleRename = async (newName) => {
    if (!renaming) return
    await storage.updateLineup({ ...renaming, name: newName })
    setRenaming(null)
    await refresh()
  }

  const handleDuplicate = async (id) => {
    setOpenMenuId(null)
    await storage.duplicateLineup(id)
    await refresh()
  }

  const handleDelete = async () => {
    if (!deleting) return
    await storage.deleteLineup(deleting.id)
    setDeleting(null)
    await refresh()
  }

  const openRename = (lineup) => {
    setOpenMenuId(null)
    setRenaming(lineup)
  }

  const openDelete = (lineup) => {
    setOpenMenuId(null)
    setDeleting(lineup)
  }

  if (lineups == null) return null

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Your lineups</h1>
        <button
          type="button"
          className={styles.newButton}
          onClick={() => setShowNewModal(true)}
        >
          + New lineup
        </button>
      </header>
      {lineups.length > 0 && (
        <ul className={styles.list}>
          {lineups.map((l) => {
            const menuOpen = openMenuId === l.id
            return (
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
                <div
                  className={styles.kebabWrap}
                  ref={menuOpen ? menuRef : null}
                >
                  <button
                    type="button"
                    className={styles.kebabButton}
                    aria-label={`Actions for ${l.name}`}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() =>
                      setOpenMenuId((prev) => (prev === l.id ? null : l.id))
                    }
                  >
                    ⋮
                  </button>
                  {menuOpen && (
                    <div className={styles.menu} role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.menuItem}
                        onClick={() => openRename(l)}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.menuItem}
                        onClick={() => handleDuplicate(l.id)}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={[
                          styles.menuItem,
                          styles.menuItemDestructive,
                        ].join(' ')}
                        onClick={() => openDelete(l)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <Modal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="New lineup"
      >
        <NewLineupForm
          onSubmit={handleCreate}
          onCancel={() => setShowNewModal(false)}
        />
      </Modal>
      <Modal
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Rename lineup"
      >
        {renaming && (
          <RenameForm
            lineup={renaming}
            onSubmit={handleRename}
            onCancel={() => setRenaming(null)}
          />
        )}
      </Modal>
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={deleting ? `Delete "${deleting.name}"?` : ''}
      >
        <p className={styles.dialogBody}>This can't be undone.</p>
        <div className={styles.dialogActions}>
          <button
            type="button"
            onClick={() => setDeleting(null)}
            className={styles.dialogCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={styles.dialogDestructive}
            autoFocus
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
