import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught render error:', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.body}>
            The app hit an unexpected error. Reloading usually clears it.
          </p>
          {import.meta.env.DEV && error.message && (
            <pre className={styles.detail}>{error.message}</pre>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => window.location.assign('/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }
}
