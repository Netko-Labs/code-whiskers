export function formatMessageTime(date: Date | string) {
  const value = typeof date === 'string' ? new Date(date) : date
  return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(date: Date | string) {
  const value = typeof date === 'string' ? new Date(date) : date
  return value.toLocaleString()
}

const AGE_STEPS = [
  { limit: 60_000, unit: 's', size: 1_000 },
  { limit: 3_600_000, unit: 'm', size: 60_000 },
  { limit: 86_400_000, unit: 'h', size: 3_600_000 },
] as const

/** Compact age for dense lists: `40s`, `18m`, `4h`, `2d`. */
export function formatAge(date: Date | string, now: Date = new Date()) {
  const value = typeof date === 'string' ? new Date(date) : date
  const elapsed = Math.max(0, now.getTime() - value.getTime())
  const step = AGE_STEPS.find((candidate) => elapsed < candidate.limit)
  if (!step) return `${Math.floor(elapsed / 86_400_000)}d`
  return `${Math.floor(elapsed / step.size)}${step.unit}`
}
