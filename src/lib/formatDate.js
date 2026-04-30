const ABSOLUTE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export function formatRelativeOrAbsolute(iso, now = Date.now()) {
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return ''
  const diffMs = now - ts
  if (diffMs < 60_000) return 'just now'
  if (diffMs < 3_600_000) {
    const m = Math.floor(diffMs / 60_000)
    return `${m} min ago`
  }
  if (diffMs < 86_400_000) {
    const h = Math.floor(diffMs / 3_600_000)
    return `${h} hr ago`
  }
  if (diffMs < 86_400_000 * 7) {
    const d = Math.floor(diffMs / 86_400_000)
    return d === 1 ? 'yesterday' : `${d} days ago`
  }
  return ABSOLUTE_FORMATTER.format(new Date(ts))
}
