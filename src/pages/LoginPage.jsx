import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import Modal from '../components/common/Modal.jsx'
import styles from './LoginPage.module.css'

function SignupForm({ onDone }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [confirmSent, setConfirmSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    setSubmitting(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    if (data.session) {
      onDone()
    } else {
      setConfirmSent(true)
    }
  }

  if (confirmSent) {
    return (
      <p className={styles.dialogBody}>
        Check <strong>{email.trim()}</strong> for a confirmation link to
        finish creating your account.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className={styles.fieldLabel} htmlFor="signup-email">
        Email
      </label>
      <input
        id="signup-email"
        type="email"
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        autoFocus
        required
      />
      <label className={styles.fieldLabel} htmlFor="signup-password">
        Password
      </label>
      <input
        id="signup-password"
        type="password"
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        minLength={6}
        required
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.dialogActions}>
        <button
          type="submit"
          disabled={submitting}
          className={styles.dialogPrimary}
        >
          {submitting ? 'Signing up…' : 'Sign up'}
        </button>
      </div>
    </form>
  )
}

function ForgotPasswordForm({ onDone }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` },
    )
    setSubmitting(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <p className={styles.dialogBody}>
        If an account exists for <strong>{email.trim()}</strong>, a reset link
        has been sent.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className={styles.fieldLabel} htmlFor="forgot-email">
        Email
      </label>
      <input
        id="forgot-email"
        type="email"
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        autoFocus
        required
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.dialogActions}>
        <button
          type="submit"
          disabled={submitting}
          className={styles.dialogPrimary}
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </div>
    </form>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showSignup, setShowSignup] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setSubmitting(false)
    if (signInError) {
      setError(signInError.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Origin Builder</h1>
        <form onSubmit={handleSubmit}>
          <label className={styles.fieldLabel} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            required
          />
          <label className={styles.fieldLabel} htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className={styles.submitButton}
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <div className={styles.links}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setShowForgot(true)}
          >
            Forgot password?
          </button>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setShowSignup(true)}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
      <Modal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        title="Create an account"
      >
        <SignupForm onDone={() => setShowSignup(false)} />
      </Modal>
      <Modal
        open={showForgot}
        onClose={() => setShowForgot(false)}
        title="Reset your password"
      >
        <ForgotPasswordForm onDone={() => setShowForgot(false)} />
      </Modal>
    </div>
  )
}
