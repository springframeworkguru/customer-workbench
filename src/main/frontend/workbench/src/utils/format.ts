export function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export function truncate(text?: string | null, length = 80) {
  if (!text) return '—'
  return text.length > length ? `${text.slice(0, length)}…` : text
}
