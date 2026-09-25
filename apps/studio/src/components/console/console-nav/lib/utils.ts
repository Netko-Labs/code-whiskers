import type { ConsoleNavItem } from '../../shared/console-model'

export function navKey(item: ConsoleNavItem): string {
  const params = item.params
  if (params && 'bucket' in params) return `bucket:${params.bucket}`
  if (params && 'section' in params) return `section:${params.section}`
  return item.label
}

export function navPath(item: ConsoleNavItem): string {
  const params = item.params
  if (params && 'bucket' in params) return `/console/triage/${params.bucket}`
  if (params && 'section' in params) return `/console/${params.section}`
  return item.to
}
