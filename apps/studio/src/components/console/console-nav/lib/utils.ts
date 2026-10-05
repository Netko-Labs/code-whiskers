import type { ConsoleNavItem } from '../../shared/console-model'

export function navKey(item: ConsoleNavItem): string {
  const params = item.params
  if (params && 'bucket' in params) return `bucket:${params.bucket}`
  if (params && 'section' in params) return `section:${params.section}`
  if (params && 'projectId' in params) return `project:${params.projectId}`
  return item.label
}

export function navPath(item: ConsoleNavItem): string {
  const params = item.params
  if (params && 'bucket' in params) return `/console/triage/${params.bucket}`
  if (params && 'section' in params) return `/console/${params.section}`
  if (params && 'projectId' in params) return `/console/projects/${params.projectId}`
  return item.to
}

export function isNavActive(item: ConsoleNavItem, pathname: string): boolean {
  const path = navPath(item)
  return pathname === path || pathname.startsWith(`${path}/`)
}
