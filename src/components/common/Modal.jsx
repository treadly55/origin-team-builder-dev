import { useEffect, useId } from 'react'
import styles from './Modal.module.css'

export default function Modal({ open, onClose, title, children }) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={styles.overlay}
      onClick={() => onClose?.()}
      role="presentation"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
