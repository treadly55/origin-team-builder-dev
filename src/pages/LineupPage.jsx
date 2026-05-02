import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import LineupBuilder from '../components/builder/LineupBuilder.jsx'
import { storage } from '../lib/storage/index.js'

const SAVE_DEBOUNCE_MS = 400

export default function LineupPage() {
  const { id } = useParams()
  const [lineup, setLineup] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [saveState, setSaveState] = useState('idle')

  const saveTimerRef = useRef(null)
  const pendingLineupRef = useRef(null)
  const inFlightCountRef = useRef(0)

  const persist = (toSave) => {
    inFlightCountRef.current += 1
    setSaveState('saving')
    storage
      .updateLineup(toSave)
      .catch(() => {})
      .finally(() => {
        inFlightCountRef.current -= 1
        if (inFlightCountRef.current === 0 && saveTimerRef.current == null) {
          setSaveState('idle')
        }
      })
  }

  const flushPendingSave = () => {
    if (saveTimerRef.current != null) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    const toSave = pendingLineupRef.current
    pendingLineupRef.current = null
    if (toSave) persist(toSave)
  }

  useEffect(() => {
    let cancelled = false
    setNotFound(false)
    setLineup(null)
    setSaveState('idle')
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
    setSaveState('saving')
    if (saveTimerRef.current != null) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      const toSave = pendingLineupRef.current
      saveTimerRef.current = null
      pendingLineupRef.current = null
      if (toSave) persist(toSave)
    }, SAVE_DEBOUNCE_MS)
  }

  if (notFound) return <Navigate to="/404" replace />
  if (!lineup) return null

  return (
    <LineupBuilder
      key={lineup.id}
      initialLineup={lineup}
      onChange={handleChange}
      onSave={flushPendingSave}
      saveState={saveState}
    />
  )
}
