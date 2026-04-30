import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import LineupBuilder from '../components/builder/LineupBuilder.jsx'
import { storage } from '../lib/storage/index.js'

const SAVE_DEBOUNCE_MS = 400

export default function LineupPage() {
  const { id } = useParams()
  const [lineup, setLineup] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const saveTimerRef = useRef(null)
  const pendingLineupRef = useRef(null)

  const flushPendingSave = () => {
    if (saveTimerRef.current != null) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    const toSave = pendingLineupRef.current
    pendingLineupRef.current = null
    if (toSave) {
      storage.updateLineup(toSave).catch(() => {})
    }
  }

  useEffect(() => {
    let cancelled = false
    setNotFound(false)
    setLineup(null)
    storage.getLineup(id).then((found) => {
      if (cancelled) return
      if (found == null) {
        setNotFound(true)
      } else {
        setLineup(found)
      }
    })
    return () => {
      cancelled = true
      flushPendingSave()
    }
  }, [id])

  const handleChange = (updated) => {
    pendingLineupRef.current = updated
    if (saveTimerRef.current != null) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      const toSave = pendingLineupRef.current
      saveTimerRef.current = null
      pendingLineupRef.current = null
      if (toSave) {
        storage.updateLineup(toSave).catch(() => {})
      }
    }, SAVE_DEBOUNCE_MS)
  }

  if (notFound) return <Navigate to="/404" replace />
  if (!lineup) return null

  return (
    <LineupBuilder
      key={lineup.id}
      initialLineup={lineup}
      onChange={handleChange}
    />
  )
}
