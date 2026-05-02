import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LineupBuilder from '../components/builder/LineupBuilder.jsx'
import Modal from '../components/common/Modal.jsx'
import { storage } from '../lib/storage/index.js'
import styles from './LineupPreviewPage.module.css'

const PREVIEW_LINEUP = {
  id: null,
  team: 'NSW',
  name: '',
  slots: {},
  version: 0,
  createdAt: '',
  updatedAt: '',
}

export default function LineupPreviewPage() {
  const draftRef = useRef({ team: PREVIEW_LINEUP.team, slots: {} })
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (updated) => {
    draftRef.current = { team: updated.team, slots: updated.slots }
  }

  const handleSaveClick = () => {
    setName('')
    setShowSaveModal(true)
  }

  const closeModal = () => {
    if (submitting) return
    setShowSaveModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    const { team, slots } = draftRef.current
    try {
      const created = await storage.createLineup({ team, name: trimmed, slots })
      navigate(`/lineup/${created.id}`)
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <>
      <LineupBuilder
        initialLineup={PREVIEW_LINEUP}
        onChange={handleChange}
        onSave={handleSaveClick}
      />
      <Modal open={showSaveModal} onClose={closeModal} title="Save lineup">
        <form onSubmit={handleSubmit}>
          <label className={styles.fieldLabel} htmlFor="save-lineup-name">
            Name
          </label>
          <input
            id="save-lineup-name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Origin I 2026"
            autoFocus
            maxLength={80}
          />
          <div className={styles.dialogActions}>
            <button
              type="button"
              onClick={closeModal}
              className={styles.dialogCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className={styles.dialogPrimary}
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
