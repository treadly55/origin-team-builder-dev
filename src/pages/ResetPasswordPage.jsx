import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import styles from './LoginPage.module.css'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })
    setSubmitting(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setDone(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Set a new password</h1>
        {done ? (
          <>
            <p className={styles.dialogBody}>
              Your password has been updated.
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.dialogPrimary}
                onClick={() => navigate('/dashboard')}
              >
                Continue to dashboard
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className={styles.fieldLabel} htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              autoFocus
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitButton}
            >
              {submitting ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
